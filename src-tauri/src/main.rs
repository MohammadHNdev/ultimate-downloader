// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod downloader;
mod video_info;

use downloader::DownloadOptions;
use serde::{Deserialize, Serialize};
use tauri::Emitter;
use video_info::VideoInfo;

#[derive(Debug, Serialize, Deserialize)]
struct VideoInfoResponse {
    success: bool,
    data: Option<VideoInfo>,
    error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct DownloadResponse {
    success: bool,
    download_id: Option<String>,
    error: Option<String>,
}

// Fetch video information from URL
#[tauri::command]
async fn fetch_video_info(url: String) -> Result<VideoInfoResponse, String> {
    match video_info::fetch_info(&url).await {
        Ok(info) => Ok(VideoInfoResponse {
            success: true,
            data: Some(info),
            error: None,
        }),
        Err(e) => Ok(VideoInfoResponse {
            success: false,
            data: None,
            error: Some(e.to_string()),
        }),
    }
}

// Start a new download
#[tauri::command]
async fn start_download(
    app: tauri::AppHandle,
    url: String,
    format_id: String,
    output_path: String,
    download_id: String,  // Accept ID from frontend (required now)
    options: DownloadOptions,
) -> Result<DownloadResponse, String> {
    // Debug logging
    eprintln!("[start_download] URL: {}", url);
    eprintln!("[start_download] Format: {}", format_id);
    eprintln!("[start_download] Output: {}", output_path);
    eprintln!("[start_download] ID: {}", download_id);

    let download_id_clone = download_id.clone();
    let app_for_callback = app.clone();
    let app_for_result = app.clone();

    let download_id_for_downloader = download_id.clone();

    // Spawn download task
    tokio::spawn(async move {
        match downloader::download_video(
            &url,
            &format_id,
            &output_path,
            &options,
            &download_id_for_downloader,
            move |progress| {
                // Emit progress event to frontend immediately
                let _ = app_for_callback.emit("download-progress", &progress);
            },
        )
        .await
        {
            Ok(_) => {
                let _ = app_for_result.emit(
                    "download-complete",
                    serde_json::json!({
                        "id": download_id_clone,
                        "success": true
                    }),
                );
            }
            Err(e) => {
                let _ = app_for_result.emit(
                    "download-error",
                    serde_json::json!({
                        "id": download_id_clone,
                        "error": e.to_string()
                    }),
                );
            }
        }
    });

    Ok(DownloadResponse {
        success: true,
        download_id: Some(download_id),
        error: None,
    })
}

// Cancel a download
#[tauri::command]
async fn cancel_download(download_id: String) -> Result<bool, String> {
    // TODO: Implement actual cancellation logic
    Ok(true)
}

// Get default download path
#[tauri::command]
fn get_default_download_path() -> String {
    dirs::download_dir()
        .unwrap_or_else(|| dirs::home_dir().unwrap_or_default())
        .to_string_lossy()
        .to_string()
}

// Check if yt-dlp is installed
#[tauri::command]
async fn check_ytdlp_installed() -> bool {
    downloader::check_ytdlp_available().await
}

// Open file location in file explorer
#[tauri::command]
async fn open_file_location(path: String) -> Result<bool, String> {
    use std::process::Command;

    #[cfg(target_os = "windows")]
    {
        // On Windows, use explorer /select to highlight the file
        let result = Command::new("explorer")
            .arg("/select,")
            .arg(&path)
            .spawn();

        match result {
            Ok(_) => Ok(true),
            Err(e) => Err(e.to_string()),
        }
    }

    #[cfg(target_os = "macos")]
    {
        let result = Command::new("open")
            .arg("-R")
            .arg(&path)
            .spawn();

        match result {
            Ok(_) => Ok(true),
            Err(e) => Err(e.to_string()),
        }
    }

    #[cfg(target_os = "linux")]
    {
        let result = Command::new("xdg-open")
            .arg(std::path::Path::new(&path).parent().unwrap_or(std::path::Path::new(&path)))
            .spawn();

        match result {
            Ok(_) => Ok(true),
            Err(e) => Err(e.to_string()),
        }
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            fetch_video_info,
            start_download,
            cancel_download,
            get_default_download_path,
            check_ytdlp_installed,
            open_file_location,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
