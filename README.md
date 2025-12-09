# Ultimate Downloader

A modern, beautiful video downloader application built with Tauri, React, and TypeScript. Download videos from YouTube, Instagram, TikTok, and 1800+ other sites.

## Features

- Download from 1800+ websites (YouTube, Instagram, TikTok, Twitter, Facebook, Vimeo, etc.)
- Beautiful UI with Microsoft Fluent 2 design system
- Multiple quality options (up to 4K)
- Audio extraction (MP3, AAC, FLAC)
- Subtitle download support
- Metadata embedding
- Dark theme with Aurora color palette
- Smooth animations with Framer Motion

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Microsoft Fluent UI 2
- **Animations**: Framer Motion
- **Backend**: Tauri 2.0 (Rust)
- **Download Engine**: yt-dlp

## Prerequisites

- Node.js 18+
- Rust (latest stable)
- yt-dlp installed and in PATH

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run tauri:dev

# Build for production
npm run tauri:build
```

## Building

### Windows
```bash
npm run tauri:build
```

The installer will be generated in `src-tauri/target/release/bundle/`.

## License

MIT
