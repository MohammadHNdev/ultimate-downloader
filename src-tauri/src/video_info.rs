use serde::{Deserialize, Serialize};
use std::process::Stdio;
use std::path::PathBuf;
use std::env;
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

    let candidates = vec![
        exe_dir.join("yt-dlp.exe"),
        exe_dir.join("resources").join("yt-dlp.exe"),
        PathBuf::from("yt-dlp.exe"),
        PathBuf::from("yt-dlp"),
    ];

    for path in candidates {
        if path.exists() {
            return path;
        }
    }

    PathBuf::from("yt-dlp")
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoInfo {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub channel: String,
    pub channel_url: Option<String>,
    pub thumbnail: String,
    pub duration: u64,
    pub duration_string: String,
    pub view_count: Option<u64>,
    pub upload_date: Option<String>,
    pub webpage_url: String,
    pub extractor: String,
    pub formats: Vec<FormatInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormatInfo {
    pub format_id: String,
    pub format_note: Option<String>,
    pub ext: String,
    pub resolution: Option<String>,
    pub fps: Option<f64>,
    pub vcodec: Option<String>,
    pub acodec: Option<String>,
    pub filesize: Option<u64>,
    pub filesize_approx: Option<u64>,
    pub tbr: Option<f64>,
    pub has_video: bool,
    pub has_audio: bool,
    pub quality_label: String,
}

#[derive(Debug, Deserialize)]
struct YtDlpInfo {
    id: String,
    title: String,
    description: Option<String>,
    channel: Option<String>,
    uploader: Option<String>,
    channel_url: Option<String>,
    thumbnail: Option<String>,
    thumbnails: Option<Vec<Thumbnail>>,
    // Instagram specific
    display_url: Option<String>,
    duration: Option<f64>,
    duration_string: Option<String>,
    view_count: Option<u64>,
    upload_date: Option<String>,
    webpage_url: String,
    extractor: Option<String>,
    extractor_key: Option<String>,
    formats: Option<Vec<YtDlpFormat>>,
}

#[derive(Debug, Deserialize)]
struct Thumbnail {
    url: String,
    preference: Option<i32>,
}

#[derive(Debug, Deserialize)]
struct YtDlpFormat {
    format_id: String,
    format_note: Option<String>,
    ext: String,
    resolution: Option<String>,
    fps: Option<f64>,
    vcodec: Option<String>,
    acodec: Option<String>,
    filesize: Option<u64>,
    filesize_approx: Option<u64>,
    tbr: Option<f64>,
    height: Option<u32>,
    width: Option<u32>,
}

pub async fn fetch_info(url: &str) -> Result<VideoInfo, Box<dyn std::error::Error + Send + Sync>> {
    let ytdlp_path = get_ytdlp_path();
    eprintln!("[fetch_info] Using yt-dlp at: {:?}", ytdlp_path);
    eprintln!("[fetch_info] URL: {}", url);

    let mut cmd = Command::new(&ytdlp_path);
    cmd.args([
        "--dump-json",
        "--no-download",
        "--no-warnings",
        "--no-playlist",
        url,
    ])
    .stdout(Stdio::piped())
    .stderr(Stdio::piped());

    #[cfg(windows)]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let output = cmd.output().await?;

    eprintln!("[fetch_info] Exit status: {:?}", output.status);

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        eprintln!("[fetch_info] stderr: {}", stderr);
        eprintln!("[fetch_info] stdout: {}", stdout);
        return Err(format!("yt-dlp failed: {}", stderr).into());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let info: YtDlpInfo = serde_json::from_str(&stdout)?;

    // Get best thumbnail (check multiple sources for Instagram compatibility)
    let thumbnail = info
        .thumbnail
        .or(info.display_url.clone())
        .or_else(|| {
            info.thumbnails.and_then(|thumbs| {
                thumbs
                    .into_iter()
                    .max_by_key(|t| t.preference.unwrap_or(0))
                    .map(|t| t.url)
            })
        })
        .unwrap_or_default();

    // Parse formats - filter, deduplicate, and sort by quality
    let mut formats: Vec<FormatInfo> = info
        .formats
        .unwrap_or_default()
        .into_iter()
        .filter(|f| {
            // Filter out storyboard and other non-media formats
            let has_video = f.vcodec.as_deref() != Some("none") && f.vcodec.is_some();
            let has_audio = f.acodec.as_deref() != Some("none") && f.acodec.is_some();
            // Only include formats with video OR audio-only formats
            has_video || has_audio
        })
        .map(|f| {
            let has_video = f.vcodec.as_deref() != Some("none") && f.vcodec.is_some();
            let has_audio = f.acodec.as_deref() != Some("none") && f.acodec.is_some();

            // Generate quality label
            let quality_label = if has_video {
                if let Some(height) = f.height {
                    let fps_str = f
                        .fps
                        .filter(|&fps| fps > 30.0)
                        .map(|fps| format!(" {}fps", fps as u32))
                        .unwrap_or_default();

                    match height {
                        h if h >= 2160 => format!("4K{}", fps_str),
                        h if h >= 1440 => format!("1440p{}", fps_str),
                        h if h >= 1080 => format!("1080p{}", fps_str),
                        h if h >= 720 => format!("720p{}", fps_str),
                        h if h >= 480 => format!("480p{}", fps_str),
                        h if h >= 360 => format!("360p{}", fps_str),
                        _ => format!("{}p{}", height, fps_str),
                    }
                } else {
                    f.format_note.clone().unwrap_or_else(|| "Video".to_string())
                }
            } else if has_audio {
                if let Some(tbr) = f.tbr {
                    format!("{}kbps", tbr as u32)
                } else {
                    "Audio".to_string()
                }
            } else {
                f.format_note.clone().unwrap_or_else(|| "Unknown".to_string())
            };

            FormatInfo {
                format_id: f.format_id,
                format_note: f.format_note,
                ext: f.ext,
                resolution: f.resolution,
                fps: f.fps,
                vcodec: f.vcodec,
                acodec: f.acodec,
                filesize: f.filesize,
                filesize_approx: f.filesize_approx,
                tbr: f.tbr,
                has_video,
                has_audio,
                quality_label,
            }
        })
        .collect();

    // Sort formats: video formats by height (desc), then audio by bitrate (desc)
    formats.sort_by(|a, b| {
        // Video formats first, then audio
        match (a.has_video, b.has_video) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => {
                // Compare by filesize if both have it
                let size_a = a.filesize.or(a.filesize_approx).unwrap_or(0);
                let size_b = b.filesize.or(b.filesize_approx).unwrap_or(0);
                size_b.cmp(&size_a) // Descending
            }
        }
    });

    // Deduplicate by quality_label - keep the one with the best filesize info
    let mut seen_qualities = std::collections::HashSet::new();
    formats.retain(|f| {
        if seen_qualities.contains(&f.quality_label) {
            false
        } else {
            seen_qualities.insert(f.quality_label.clone());
            true
        }
    });

    // Add "Best" option at the beginning for video
    if formats.iter().any(|f| f.has_video) {
        let best_video = formats.iter().find(|f| f.has_video).cloned();
        if let Some(mut best) = best_video {
            best.format_id = "bestvideo+bestaudio/best".to_string();
            best.quality_label = "Best Quality".to_string();
            formats.insert(0, best);
        }
    }

    // Calculate duration string if not provided
    let duration = info.duration.unwrap_or(0.0) as u64;
    let duration_string = info.duration_string.unwrap_or_else(|| {
        let hours = duration / 3600;
        let minutes = (duration % 3600) / 60;
        let seconds = duration % 60;

        if hours > 0 {
            format!("{}:{:02}:{:02}", hours, minutes, seconds)
        } else {
            format!("{}:{:02}", minutes, seconds)
        }
    });

    Ok(VideoInfo {
        id: info.id,
        title: info.title,
        description: info.description,
        channel: info.channel.or(info.uploader).unwrap_or_else(|| "Unknown".to_string()),
        channel_url: info.channel_url,
        thumbnail,
        duration,
        duration_string,
        view_count: info.view_count,
        upload_date: info.upload_date,
        webpage_url: info.webpage_url,
        extractor: info.extractor.or(info.extractor_key).unwrap_or_else(|| "generic".to_string()),
        formats,
    })
}
