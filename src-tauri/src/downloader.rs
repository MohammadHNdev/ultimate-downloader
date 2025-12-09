use regex::Regex;
use serde::{Deserialize, Serialize};
use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x08000000;

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
    let mut cmd = Command::new("yt-dlp");
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

    // Spawn yt-dlp process (hidden on Windows)
    let mut cmd = Command::new("yt-dlp");
    cmd.args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(windows)]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let mut child = cmd.spawn()?;

    let stdout = child.stdout.take().expect("Failed to capture stdout");
    let stderr = child.stderr.take().expect("Failed to capture stderr");

    // Progress parsing regex
    let progress_regex = Regex::new(
        r"\[download\]\s+(\d+\.?\d*)%\s+of\s+~?\s*(\S+)\s+at\s+(\S+)\s+ETA\s+(\S+)",
    )?;

    let download_regex = Regex::new(r"\[download\]\s+Downloading")?;
    let merge_regex = Regex::new(r"\[Merger\]")?;
    let convert_regex = Regex::new(r"\[ExtractAudio\]")?;

    let download_id_clone = download_id.clone();

    // Read stdout line by line
    let mut reader = BufReader::new(stdout).lines();

    tokio::spawn(async move {
        let mut stderr_reader = BufReader::new(stderr).lines();
        while let Ok(Some(line)) = stderr_reader.next_line().await {
            eprintln!("yt-dlp stderr: {}", line);
        }
    });

    while let Ok(Some(line)) = reader.next_line().await {
        // Parse progress from yt-dlp output
        if let Some(caps) = progress_regex.captures(&line) {
            let progress: f64 = caps.get(1).unwrap().as_str().parse().unwrap_or(0.0);
            let total_size = caps.get(2).unwrap().as_str().to_string();
            let speed = caps.get(3).unwrap().as_str().to_string();
            let eta = caps.get(4).unwrap().as_str().to_string();

            // Calculate downloaded size
            let downloaded_size = format!("{:.1}%", progress);

            progress_callback(DownloadProgress {
                id: download_id_clone.clone(),
                progress,
                speed,
                eta,
                downloaded_size,
                total_size,
                status: "downloading".to_string(),
            });
        } else if download_regex.is_match(&line) {
            progress_callback(DownloadProgress {
                id: download_id_clone.clone(),
                progress: 0.0,
                speed: String::new(),
                eta: String::new(),
                downloaded_size: String::new(),
                total_size: String::new(),
                status: "starting".to_string(),
            });
        } else if merge_regex.is_match(&line) {
            progress_callback(DownloadProgress {
                id: download_id_clone.clone(),
                progress: 99.0,
                speed: String::new(),
                eta: String::new(),
                downloaded_size: String::new(),
                total_size: String::new(),
                status: "merging".to_string(),
            });
        } else if convert_regex.is_match(&line) {
            progress_callback(DownloadProgress {
                id: download_id_clone.clone(),
                progress: 99.0,
                speed: String::new(),
                eta: String::new(),
                downloaded_size: String::new(),
                total_size: String::new(),
                status: "converting".to_string(),
            });
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
        Err("Download failed".into())
    }
}
