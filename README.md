# KanchiParivaar

> A gallery website for the KanchiParivaar saree collection — showcasing handcrafted sarees through images and videos.

🌐 **Live site:** [kanchiparivaar.com](https://www.kanchiparivaar.com)

---

## Overview

KanchiParivaar is a lightweight, fully serverless gallery website built without any frontend framework. It features a public-facing gallery and a password-protected admin panel for managing content.

## Features

- 🖼️ Responsive image & video gallery
- ▶️ YouTube video embedding
- 🏷️ Filter by media type and category tag
- 🔐 Password-protected admin panel
- ✏️ Inline editing of gallery items
- ☁️ Google Drive folder import
- 💾 Serverless backend via Netlify Functions
- 📦 Gallery data stored as JSON in GitHub via GitHub API
- 🔒 XSS-safe — all user data rendered via DOM methods, never innerHTML

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Hosting | Netlify |
| Serverless Functions | Netlify Functions (Node.js) |
| Gallery Storage | GitHub API (`gallery.json`) |
| Image Hosting | Google Drive |
| Auth | SHA-256 password hash + timing-safe comparison |

## Project Structure

├── index.html                     # Public gallery site  
├── hbjbk5gionbu5h5ubj58hnjf9-gb58g-g5oo.html   # Password-protected admin panel  
├── admin-config.js               # Admin session config  
├── gallery.json                  # Gallery data (managed via admin panel)  
├── Kanchiparivaar.jpg            # Logo  
├── .gitignore  
├── netlify.toml                  # Netlify build + redirect config  
└── netlify/  
    └── functions/  
        ├── admin-auth.js         # Password verification (timing-safe)  
        ├── gallery-read.js       # Read gallery.json from GitHub  
        ├── gallery-write.js      # Write gallery.json to GitHub (auth required)  
        └── drive-folder.js       # List images from a Google Drive folder  

## Environment Variables

Set these in your Netlify dashboard → Site Settings → Environment Variables. **Never commit values.**

| Variable | Description |
|---|---|
| `GITHUB_TOKEN` | GitHub personal access token (repo scope) |
| `GITHUB_OWNER` | GitHub username |
| `GITHUB_REPO` | Repository name |
| `GITHUB_FILE` | Path to gallery.json (e.g. `gallery.json`) |
| `GOOGLE_API_KEY` | Google Drive API key |
| `ADMIN_PASSWORD_HASH` | SHA-256 hash of your admin password |
| `ADMIN_SECRET_TOKEN` | Shared secret for write endpoint authentication |

## Security Notes

- Admin password is never stored in plain text — SHA-256 hash only
- Password comparison uses `crypto.timingSafeEqual` to prevent timing attacks
- Admin lockout persists across tabs via `localStorage`
- Write endpoint requires `x-admin-token` header — unauthenticated requests return 401
- All gallery URLs validated against an allowlist before render and before write
- No secrets ever stored in this repository — all via Netlify environment variables

---

© 2025 KanchiParivaar. All Rights Reserved.
