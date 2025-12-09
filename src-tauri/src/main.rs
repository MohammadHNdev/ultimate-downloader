// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod downloader;
mod video_info;

use downloader::{DownloadOptions, DownloadProgress};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tauri::{Emitter, State};
use tokio::sync::Mutex;
use video_info::VideoInfo;

// Application state
struct AppState {
    downloads: Arc<Mutex<HashMap<String, DownloadProgress>>>,
}

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
    state: State<'_, AppState>,
    url: String,
    format_id: String,
    output_path: String,
    options: DownloadOptions,
) -> Result<DownloadResponse, String> {
    let download_id = uuid::Uuid::new_v4().to_string();
    let downloads = state.downloads.clone();

    // Initialize download progress
    {
        let mut downloads = downloads.lock().await;
        downloads.insert(
            download_id.clone(),
            DownloadProgress {
                id: download_id.clone(),
                progress: 0.0,
                speed: String::new(),
                eta: String::new(),
                downloaded_size: String::new(),
                total_size: String::new(),
                status: "starting".to_string(),
            },
        );
    }

    let download_id_clone = download_id.clone();
    let app_clone = app.clone();

    // Spawn download task
    tokio::spawn(async move {
        match downloader::download_video(
            &url,
            &format_id,
            &output_path,
            &options,
            move |progress| {
                // Update progress in state
                let downloads = downloads.clone();
                let progress_clone = progress.clone();
                let app = app_clone.clone();
                tokio::spawn(async move {
                    let mut downloads = downloads.lock().await;
                    downloads.insert(progress_clone.id.clone(), progress_clone);
                });

                // Emit progress event to frontend
                let _ = app.emit("download-progress", progress);
            },
        )
        .await
        {
            Ok(_) => {
                let _ = app_clone.emit(
                    "download-complete",
                    serde_json::json!({
                        "id": download_id_clone,
                        "success": true
                    }),
                );
            }
            Err(e) => {
                let _ = app_clone.emit(
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
async fn cancel_download(
    state: State<'_, AppState>,
    download_id: String,
) -> Result<bool, String> {
    let mut downloads = state.downloads.lock().await;
    if let Some(progress) = downloads.get_mut(&download_id) {
        progress.status = "cancelled".to_string();
        // TODO: Implement actual cancellation logic
        Ok(true)
    } else {
        Ok(false)
    }
}

// Get download progress
#[tauri::command]
async fn get_download_progress(
    state: State<'_, AppState>,
    download_id: String,
) -> Result<Option<DownloadProgress>, String> {
    let downloads = state.downloads.lock().await;
    Ok(downloads.get(&download_id).cloned())
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

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .manage(AppState {
            downloads: Arc::new(Mutex::new(HashMap::new())),
        })
        .invoke_handler(tauri::generate_handler![
            fetch_video_info,
            start_download,
            cancel_download,
            get_download_progress,
            get_default_download_path,
            check_ytdlp_installed,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
