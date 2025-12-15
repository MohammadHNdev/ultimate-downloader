use regex::Regex;
use serde::{Deserialize, Serialize};
use std::process::Stdio;
use std::path::PathBuf;
use std::env;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x08000000;

/// Get path to bundled yt-dlp executable
fn get_ytdlp_path() -> PathBuf {
    let exe_dir = env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .unwrap_or_default();

    // Tauri 2.x resource paths - resources are copied to exe directory root
    let candidates = vec![
        exe_dir.join("yt-dlp.exe"),
        exe_dir.join("resources").join("yt-dlp.exe"),
        // Also check _up_ directory for dev mode
        exe_dir.parent().map(|p| p.join("resources").join("yt-dlp.exe")).unwrap_or_default(),
        // Check current working directory
        std::env::current_dir().ok().map(|p| p.join("yt-dlp.exe")).unwrap_or_default(),
        std::env::current_dir().ok().map(|p| p.join("resources").join("yt-dlp.exe")).unwrap_or_default(),
        // System PATH fallback
        PathBuf::from("yt-dlp.exe"),
        PathBuf::from("yt-dlp"),
    ];

    for path in &candidates {
        eprintln!("[get_ytdlp_path] Checking: {:?} exists={}", path, path.exists());
        if path.exists() && !path.as_os_str().is_empty() {
            return path.clone();
        }
    }

    eprintln!("[get_ytdlp_path] No bundled yt-dlp found, falling back to PATH");
    PathBuf::from("yt-dlp")
}

/// Get path to bundled ffmpeg executable
fn get_ffmpeg_path() -> PathBuf {
    let exe_dir = env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .unwrap_or_default();

    // Tauri 2.x resource paths - resources are copied to exe directory root
    let candidates = vec![
        exe_dir.join("ffmpeg.exe"),
        exe_dir.join("resources").join("ffmpeg.exe"),
        // Also check _up_ directory for dev mode
        exe_dir.parent().map(|p| p.join("resources").join("ffmpeg.exe")).unwrap_or_default(),
        // Check current working directory
        std::env::current_dir().ok().map(|p| p.join("ffmpeg.exe")).unwrap_or_default(),
        std::env::current_dir().ok().map(|p| p.join("resources").join("ffmpeg.exe")).unwrap_or_default(),
        // System PATH fallback
        PathBuf::from("ffmpeg.exe"),
        PathBuf::from("ffmpeg"),
    ];

    for path in &candidates {
        eprintln!("[get_ffmpeg_path] Checking: {:?} exists={}", path, path.exists());
        if path.exists() && !path.as_os_str().is_empty() {
            return path.clone();
        }
    }

    eprintln!("[get_ffmpeg_path] No bundled ffmpeg found, falling back to PATH");
    PathBuf::from("ffmpeg")
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadOptions {
    pub embed_metadata: bool,
    pub embed_thumbnail: bool,
    pub download_subtitles: bool,
    pub subtitle_languages: Option<Vec<String>>,
    pub audio_only: bool,
    pub audio_format: Option<String>,
}

impl Default for DownloadOptions {
    fn default() -> Self {
        Self {
            embed_metadata: true,
            embed_thumbnail: true,
            download_subtitles: false,
            subtitle_languages: None,
            audio_only: false,
            audio_format: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadProgress {
    pub id: String,
    pub progress: f64,
    pub speed: String,
    pub eta: String,
    pub downloaded_size: String,
    pub total_size: String,
    pub status: String,
}

pub async fn check_ytdlp_available() -> bool {
    let ytdlp_path = get_ytdlp_path();
    let mut cmd = Command::new(&ytdlp_path);
    cmd.arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null());

    #[cfg(windows)]
    cmd.creation_flags(CREATE_NO_WINDOW);

    cmd.status()
        .await
        .map(|s| s.success())
        .unwrap_or(false)
}

pub async fn download_video<F>(
    url: &str,
    format_id: &str,
    output_path: &str,
    options: &DownloadOptions,
    download_id: &str,
    progress_callback: F,
) -> Result<String, Box<dyn std::error::Error + Send + Sync>>
where
    F: Fn(DownloadProgress) + Send + 'static,
{
    let download_id = download_id.to_string();

    // Build yt-dlp command
    // For video formats, merge with best audio to ensure video has sound
    let format_string = if format_id.starts_with("best") || format_id.contains("+") {
        format_id.to_string()
    } else {
        // Try to merge video format with best audio
        format!("{}+bestaudio/best", format_id)
    };

    let mut args = vec![
        "--newline".to_string(),
        "--progress".to_string(),
        // Use progress template for consistent, parseable output
        "--progress-template".to_string(),
        "download:PROGRESS:%(progress._percent_str)s:%(progress._speed_str)s:%(progress._eta_str)s:%(progress._total_bytes_str)s".to_string(),
        "--no-warnings".to_string(),
        "--no-playlist".to_string(),
        "--no-write-comments".to_string(),
        "--no-write-info-json".to_string(),
        // Speed optimizations
        "--concurrent-fragments".to_string(),
        "4".to_string(),
        "--buffer-size".to_string(),
        "16K".to_string(),
        "--merge-output-format".to_string(),
        "mp4".to_string(),
        "-f".to_string(),
        format_string,
        "-o".to_string(),
        // Better filename: use title, fallback to uploader_id for Instagram
        format!("{}/%(title,uploader_id)s - %(upload_date>%Y-%m-%d,id)s.%(ext)s", output_path),
    ];

    if options.embed_metadata {
        args.push("--embed-metadata".to_string());
    }

    if options.embed_thumbnail {
        args.push("--embed-thumbnail".to_string());
    }

    if options.download_subtitles {
        args.push("--write-subs".to_string());
        args.push("--embed-subs".to_string());

        if let Some(ref langs) = options.subtitle_languages {
            args.push("--sub-langs".to_string());
            args.push(langs.join(","));
        }
    }

    if options.audio_only {
        args.push("-x".to_string());
        if let Some(ref format) = options.audio_format {
            args.push("--audio-format".to_string());
            args.push(format.clone());
        }
    }

    args.push(url.to_string());

    // Get bundled executable paths
    let ytdlp_path = get_ytdlp_path();
    let ffmpeg_path = get_ffmpeg_path();

    eprintln!("[download_video] Using yt-dlp at: {:?}", ytdlp_path);
    eprintln!("[download_video] Using ffmpeg at: {:?}", ffmpeg_path);
    eprintln!("[download_video] URL: {}", url);
    eprintln!("[download_video] Format: {}", format_id);
    eprintln!("[download_video] Output: {}", output_path);

    // Add ffmpeg location if bundled
    if ffmpeg_path.exists() {
        if let Some(parent) = ffmpeg_path.parent() {
            args.insert(0, parent.to_string_lossy().to_string());
            args.insert(0, "--ffmpeg-location".to_string());
            eprintln!("[download_video] Added ffmpeg location: {:?}", parent);
        }
    }

    eprintln!("[download_video] Full args: {:?}", args);

    // Spawn yt-dlp process (hidden on Windows)
    let mut cmd = Command::new(&ytdlp_path);
    cmd.args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(windows)]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let mut child = cmd.spawn()?;

    let stdout = child.stdout.take().expect("Failed to capture stdout");
    let stderr = child.stderr.take().expect("Failed to capture stderr");

    // Multiple progress parsing regexes for different yt-dlp output formats
    // Custom template format: PROGRESS:45.2%:5.00MiB/s:00:15:150.00MiB
    let progress_template_regex = Regex::new(
        r"PROGRESS:\s*(\d+\.?\d*)%\s*:\s*(\S*)\s*:\s*(\S*)\s*:\s*(\S*)",
    )?;
    // Format 1: [download]  45.2% of 150.00MiB at 5.00MiB/s ETA 00:15
    let progress_regex1 = Regex::new(
        r"\[download\]\s+(\d+\.?\d*)%\s+of\s+~?\s*(\S+)\s+at\s+(\S+)\s+ETA\s+(\S+)",
    )?;
    // Format 2: [download]  45.2%
    let progress_regex2 = Regex::new(
        r"\[download\]\s+(\d+\.?\d*)%",
    )?;

    let download_regex = Regex::new(r"\[download\]")?;
    let merge_regex = Regex::new(r"\[Merger\]|\[ffmpeg\]")?;
    let convert_regex = Regex::new(r"\[ExtractAudio\]")?;
    let destination_regex = Regex::new(r"Destination:")?;

    let download_id_clone = download_id.clone();

    // Read stdout line by line
    let mut reader = BufReader::new(stdout).lines();

    // Send initial progress immediately
    progress_callback(DownloadProgress {
        id: download_id_clone.clone(),
        progress: 0.0,
        speed: "Starting...".to_string(),
        eta: String::new(),
        downloaded_size: "0 MB".to_string(),
        total_size: String::new(),
        status: "downloading".to_string(),
    });

    tokio::spawn(async move {
        let mut stderr_reader = BufReader::new(stderr).lines();
        while let Ok(Some(line)) = stderr_reader.next_line().await {
            eprintln!("yt-dlp stderr: {}", line);
        }
    });

    let mut last_progress: f64 = 0.0;

    while let Ok(Some(line)) = reader.next_line().await {
        eprintln!("yt-dlp: {}", line); // Debug log

        // Try to parse progress with multiple regex patterns
        let mut matched = false;

        // Try custom template format first (PROGRESS:45.2%:5.00MiB/s:00:15:150.00MiB)
        if let Some(caps) = progress_template_regex.captures(&line) {
            let progress: f64 = caps.get(1).unwrap().as_str().parse().unwrap_or(0.0);
            let speed = caps.get(2).map(|m| m.as_str().to_string()).unwrap_or_default();
            let eta = caps.get(3).map(|m| m.as_str().to_string()).unwrap_or_default();
            let total_size = caps.get(4).map(|m| m.as_str().to_string()).unwrap_or_default();

            if progress > last_progress || progress == 0.0 {
                last_progress = progress;
                progress_callback(DownloadProgress {
                    id: download_id_clone.clone(),
                    progress,
                    speed: if speed.is_empty() || speed == "N/A" { "Downloading...".to_string() } else { speed },
                    eta: if eta == "N/A" { String::new() } else { eta },
                    downloaded_size: format!("{:.1}%", progress),
                    total_size: if total_size == "N/A" { String::new() } else { total_size },
                    status: "downloading".to_string(),
                });
                matched = true;
            }
        }
        // Try standard yt-dlp format
        else if let Some(caps) = progress_regex1.captures(&line) {
            let progress: f64 = caps.get(1).unwrap().as_str().parse().unwrap_or(0.0);
            let total_size = caps.get(2).unwrap().as_str().to_string();
            let speed = caps.get(3).unwrap().as_str().to_string();
            let eta = caps.get(4).unwrap().as_str().to_string();

            last_progress = progress;
            progress_callback(DownloadProgress {
                id: download_id_clone.clone(),
                progress,
                speed,
                eta,
                downloaded_size: format!("{:.1}%", progress),
                total_size,
                status: "downloading".to_string(),
            });
            matched = true;
        }
        // Try simpler format
        else if let Some(caps) = progress_regex2.captures(&line) {
            let progress: f64 = caps.get(1).unwrap().as_str().parse().unwrap_or(0.0);

            if progress > last_progress {
                last_progress = progress;
                progress_callback(DownloadProgress {
                    id: download_id_clone.clone(),
                    progress,
                    speed: "Downloading...".to_string(),
                    eta: String::new(),
                    downloaded_size: format!("{:.1}%", progress),
                    total_size: String::new(),
                    status: "downloading".to_string(),
                });
                matched = true;
            }
        }

        if !matched {
            if merge_regex.is_match(&line) {
                progress_callback(DownloadProgress {
                    id: download_id_clone.clone(),
                    progress: 99.0,
                    speed: "Merging...".to_string(),
                    eta: String::new(),
                    downloaded_size: String::new(),
                    total_size: String::new(),
                    status: "merging".to_string(),
                });
            } else if convert_regex.is_match(&line) {
                progress_callback(DownloadProgress {
                    id: download_id_clone.clone(),
                    progress: 99.0,
                    speed: "Converting...".to_string(),
                    eta: String::new(),
                    downloaded_size: String::new(),
                    total_size: String::new(),
                    status: "converting".to_string(),
                });
            } else if destination_regex.is_match(&line) {
                progress_callback(DownloadProgress {
                    id: download_id_clone.clone(),
                    progress: 5.0,
                    speed: "Preparing...".to_string(),
                    eta: String::new(),
                    downloaded_size: String::new(),
                    total_size: String::new(),
                    status: "downloading".to_string(),
                });
            }
        }
    }

    // Wait for process to complete
    let status = child.wait().await?;

    if status.success() {
        progress_callback(DownloadProgress {
            id: download_id.clone(),
            progress: 100.0,
            speed: String::new(),
            eta: String::new(),
            downloaded_size: String::new(),
            total_size: String::new(),
            status: "completed".to_string(),
        });
        Ok(download_id)
    } else {
        let exit_code = status.code().unwrap_or(-1);
        let error_msg = match exit_code {
            1 => "Download failed: Video may be private, age-restricted, or unavailable",
            2 => "Download failed: Invalid URL or unsupported site",
            100 => "Download failed: yt-dlp not found. Please reinstall the application",
            101 => "Download failed: ffmpeg not found for merging video/audio",
            _ => "Download failed: Unknown error occurred",
        };
        eprintln!("[download_video] Process exited with code: {}", exit_code);
        Err(error_msg.into())
    }
}
