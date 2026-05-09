# Lumora — Cloud-Native Photo Sharing Platform

> MSc Scalable Systems coursework project  
> A full-stack photo-sharing web application built entirely on Microsoft Azure

![Azure](https://img.shields.io/badge/Microsoft_Azure-0078D4?style=flat&logo=microsoft-azure&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat&logo=javascript&logoColor=black)
![CosmosDB](https://img.shields.io/badge/Cosmos_DB-NoSQL-0078D4?style=flat&logo=microsoft-azure&logoColor=white)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Live Demo](#live-demo)
3. [Architecture](#architecture)
4. [Azure Services Used](#azure-services-used)
5. [Features](#features)
6. [Project Structure](#project-structure)
7. [Frontend Pages](#frontend-pages)
8. [Backend API Reference](#backend-api-reference)
9. [Database Schema](#database-schema)
10. [Authentication & Roles](#authentication--roles)
11. [Setup & Deployment](#setup--deployment)
12. [Environment Variables](#environment-variables)
13. [Known Limitations](#known-limitations)

---

## Project Overview

**Lumora** is a scalable, cloud-native photo-sharing platform built as an MSc coursework project to demonstrate real-world use of Microsoft Azure services. It supports two user roles — **Creators** (who upload and manage content) and **Consumers** (who browse, like, comment, rate and save content).

The entire backend is serverless (Azure Functions v4 + Node.js), with Azure Cosmos DB for data persistence, Azure Blob Storage for media files, and Azure Static Website hosting for the frontend.

---

## Live Demo

| Component | URL |
|-----------|-----|
| Frontend (Static Site) | https://lumorastorage01.z1.web.core.windows.net |
| Backend API Base URL | https://lumora-api-mb.azurewebsites.net/api |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│             HTML + CSS + Vanilla JavaScript                  │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼───────────────────────────────────┐
│            Azure Blob Storage — Static Website               │
│   ($web container · lumorastorage01.z1.web.core.windows.net) │
└──────────────────────────┬───────────────────────────────────┘
                           │ REST API calls (fetch)
┌──────────────────────────▼───────────────────────────────────┐
│          Azure Functions App — lumora-api-mb                 │
│              Node.js v18 · Functions v4                      │
│    /auth/*   /photos/*   /users/*   /stories/*               │
└─────────────┬────────────────────────┬───────────────────────┘
              │                        │
┌─────────────▼──────────┐  ┌──────────▼────────────────────┐
│   Azure Cosmos DB       │  │   Azure Blob Storage          │
│   NoSQL — 4 containers  │  │   container: "photos"         │
│   users / photos /      │  │   photos · avatars · stories  │
│   comments / stories    │  │   Direct upload via SAS URL   │
└────────────────────────┘  └───────────────────────────────┘
```

---

## Azure Services Used

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Azure Blob Storage** | Static website hosting + media file storage | LRS · `$web` for frontend, `photos` container for media |
| **Azure Functions v4** | Serverless REST API | Consumption plan · Node.js 18 |
| **Azure Cosmos DB** | NoSQL database for all app data | Serverless · 4 containers · partition key `/id` |

### Cosmos DB Containers

| Container | Partition Key | Description |
|-----------|--------------|-------------|
| `users` | `/id` | User accounts, roles, liked/saved photo ID arrays |
| `photos` | `/id` | Photo/video metadata, like counts, ratings breakdown |
| `comments` | `/photoId` | Comments on individual photos |
| `stories` | `/id` | 24-hour story posts |

---

## Features

### For Creators
- **Upload photos & videos** — file picker with drag-and-drop, direct upload to Azure Blob Storage via SAS URL
- **8 CSS photo filters** — Original, Moon (B&W), Clarendon, Juno, Lo-Fi, Warm, Cold, Vivid
- **Rich metadata** — title, caption, location, category (9 options), hashtags
- **People tagging** — click anywhere on the photo to pin-tag people by username
- **Delete photos** — only the owning creator can delete their own uploaded content
- **Stories** — post 24-hour photo/video stories visible on the feed to all users
- **Edit profile** — update display name, bio, location, and avatar photo
- **Cover photo** — upload a banner/cover image for your public profile page

### For Consumers
- **Home Feed** — paginated feed of all latest photos and videos from creators
- **Explore** — keyword search, category filters, trending photos, hashtag browsing
- **Like photos** — optimistic UI with instant visual feedback, synced to backend
- **Comments** — post comments on any photo, sort by newest or oldest
- **Star ratings** — submit 1–5 star rating, community average and breakdown displayed
- **Save photos** — personal saved collection with multi-view (grid / list), stats and filters
- **View liked & saved** — dedicated tabs on profile page showing real photo thumbnails

### Both Roles
- **JWT authentication** — email + password login, JWT token stored in `localStorage`
- **Avatar dropdown menu** — click the profile photo (top-right) to access "My Profile" or "Sign Out" instantly
- **Dark mode** — full dark/light theme toggle, persisted in `localStorage`
- **Responsive design** — desktop top navbar + mobile bottom navigation bar
- **Profile page** — view any user's public profile, stats (posts, likes, avg rating), cover photo and bio

---

## Project Structure

```
lumora/
├── frontend/                      # Static website (deployed to Azure Blob $web)
│   ├── index.html                 # Landing / marketing page (public)
│   ├── auth.html                  # Login & Sign Up
│   ├── feed.html                  # Home feed (auth required)
│   ├── explore.html               # Search & discovery (auth required)
│   ├── photo.html                 # Single photo detail + comments (auth required)
│   ├── creator.html               # Upload studio (creator role only)
│   ├── saved.html                 # Saved photos collection (auth required)
│   ├── profile.html               # User profile page (auth required)
│   ├── css/
│   │   └── shared.css             # Global styles, navbar, cards, dark mode
│   └── js/
│       ├── config.js              # API base URL configuration
│       ├── shared.js              # Auth helpers, navbar injection, toasts, utilities
│       └── api.js                 # All API calls (centralised fetch wrapper)
│
├── backend/                       # Azure Functions app
│   ├── src/
│   │   ├── functions/             # One file per HTTP route handler
│   │   │   ├── authLogin.js       # POST /auth/login
│   │   │   ├── authRegister.js    # POST /auth/register
│   │   │   ├── authMe.js          # GET  /auth/me
│   │   │   ├── photosGet.js       # GET  /photos  &  GET /photos/{id}
│   │   │   ├── photosCreate.js    # POST /photos
│   │   │   ├── photosDelete.js    # DELETE /photos/{id}
│   │   │   ├── photosLike.js      # POST /photos/{id}/like
│   │   │   ├── photosSave.js      # POST /photos/{id}/save
│   │   │   ├── photosRate.js      # POST /photos/{id}/rate
│   │   │   ├── photosComments.js  # GET/POST /photos/{id}/comments
│   │   │   ├── photosUploadUrl.js # POST /photos/upload-url  (SAS URL)
│   │   │   ├── photosSearch.js    # GET  /photos/search?q=
│   │   │   ├── photosTrending.js  # GET  /photos/trending
│   │   │   ├── storiesGet.js      # GET  /stories
│   │   │   ├── storiesCreate.js   # POST /stories
│   │   │   ├── usersProfile.js    # GET  /users/{id}
│   │   │   ├── usersUpdate.js     # PUT  /users/me
│   │   │   ├── usersPhotos.js     # GET  /users/{id}/photos
│   │   │   ├── usersSaved.js      # GET  /users/me/saved
│   │   │   ├── usersLiked.js      # GET  /users/me/liked
│   │   │   └── usersAvatarUrl.js  # POST /users/avatar-url  (SAS URL)
│   │   └── shared/
│   │       ├── auth.js            # JWT verify: requireAuth(), requireCreator()
│   │       ├── blob.js            # Azure Blob SAS URL generation
│   │       ├── cosmos.js          # Cosmos DB container accessor functions
│   │       └── helpers.js         # ok(), err(), handle() HTTP response helpers
│   ├── package.json
│   └── host.json
│
└── README.md
```

---

## Frontend Pages

| Page | File | Auth | Role |
|------|------|------|------|
| Landing page | `index.html` | No | Public |
| Login / Sign Up | `auth.html` | No | Public |
| Home Feed | `feed.html` | Yes | Any |
| Explore & Search | `explore.html` | Yes | Any |
| Photo Detail | `photo.html?id={id}` | Yes | Any |
| Upload Studio | `creator.html` | Yes | Creator only |
| Saved Collection | `saved.html` | Yes | Any |
| User Profile | `profile.html?user={id}` | Yes | Any |

---

## Backend API Reference

**Base URL:** `https://lumora-api-mb.azurewebsites.net/api`

All protected routes require the header:
```
Authorization: Bearer <jwt-token>
```

### Auth Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/auth/register` | No | Register a new user account |
| `POST` | `/auth/login` | No | Authenticate and receive a JWT token |
| `GET` | `/auth/me` | Yes | Get the current authenticated user's full profile |

**Login request body:**
```json
{ "email": "user@example.com", "password": "secret" }
```
**Login response:**
```json
{ "token": "<jwt>", "user": { "id": "...", "username": "...", "role": "creator" } }
```

---

### Photo Endpoints

| Method | Route | Auth | Role | Description |
|--------|-------|------|------|-------------|
| `GET` | `/photos` | Yes | Any | Paginated photo feed. Query params: `?page=1&limit=12&filter=all` |
| `GET` | `/photos/{id}` | Yes | Any | Single photo with `userLiked`, `userSaved`, `userRating` |
| `POST` | `/photos` | Yes | Creator | Create photo record after blob upload |
| `DELETE` | `/photos/{id}` | Yes | Creator (owner) | Permanently delete own photo |
| `POST` | `/photos/upload-url` | Yes | Creator | Get SAS URL for direct upload to Blob Storage |
| `POST` | `/photos/{id}/like` | Yes | Any | Toggle like. Returns `{ liked: bool, likeCount: number }` |
| `POST` | `/photos/{id}/save` | Yes | Any | Toggle save. Returns `{ saved: bool, saveCount: number }` |
| `POST` | `/photos/{id}/rate` | Yes | Any | Submit or update star rating (1–5) |
| `GET` | `/photos/{id}/comments` | Yes | Any | Get all comments for a photo |
| `POST` | `/photos/{id}/comments` | Yes | Any | Post a new comment |
| `GET` | `/photos/search?q={query}` | Yes | Any | Search photos by keyword |
| `GET` | `/photos/trending` | Yes | Any | Top photos ordered by likes |
| `GET` | `/photos/hashtag/{tag}` | Yes | Any | Photos filtered by hashtag |

---

### User Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/users/{id}` | Yes | Get public profile for any user |
| `PUT` | `/users/me` | Yes | Update own profile fields |
| `GET` | `/users/{id}/photos` | Yes | Get all photos uploaded by a creator |
| `GET` | `/users/me/saved` | Yes | Get own saved photos (paginated) |
| `GET` | `/users/me/liked` | Yes | Get own liked photos (paginated) |
| `POST` | `/users/avatar-url` | Yes | Get SAS URL for avatar or cover photo upload |

**Update profile request body** (all fields optional):
```json
{
  "displayName": "My Name",
  "bio": "About me...",
  "location": "London, UK",
  "avatarUrl": "https://...",
  "coverUrl": "https://..."
}
```

---

### Story Endpoints

| Method | Route | Auth | Role | Description |
|--------|-------|------|------|-------------|
| `GET` | `/stories` | Yes | Any | Get all recent stories |
| `POST` | `/stories` | Yes | Creator | Post a new story with blob URL |

---

## Database Schema

### User Document (`users` container)
```json
{
  "id": "uuid-v4",
  "username": "mamoon",
  "email": "mamoon@example.com",
  "passwordHash": "$2b$10$...",
  "role": "creator",
  "displayName": "Mamoon Bashir",
  "bio": "DevOps engineer and photographer",
  "location": "London, UK",
  "avatarUrl": "https://lumorastorage01.blob.core.windows.net/photos/avatar-xxx.jpg",
  "coverUrl": "https://lumorastorage01.blob.core.windows.net/photos/avatar-yyy.jpg",
  "likedPhotos": ["photo-id-1", "photo-id-2"],
  "savedPhotos": ["photo-id-3"],
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### Photo Document (`photos` container)
```json
{
  "id": "uuid-v4",
  "creatorId": "user-uuid",
  "creatorUsername": "mamoon",
  "creatorAvatar": "https://...",
  "title": "Mountain Sunset",
  "caption": "Golden hour in the Alps #travel #nature",
  "blobUrl": "https://lumorastorage01.blob.core.windows.net/photos/photo-xxx.jpg",
  "mediaType": "image",
  "category": "travel",
  "location": "Alps, Switzerland",
  "hashtags": ["travel", "nature"],
  "filter": "Warm",
  "likeCount": 12,
  "likedBy": ["user-uuid-1", "user-uuid-2"],
  "saveCount": 3,
  "commentCount": 5,
  "avgRating": 4.2,
  "ratingCount": 10,
  "ratings": { "user-uuid-1": 5, "user-uuid-2": 4 },
  "ratingBreakdown": { "1": 0, "2": 1, "3": 2, "4": 3, "5": 4 },
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### Comment Document (`comments` container)
```json
{
  "id": "uuid-v4",
  "photoId": "photo-uuid",
  "userId": "user-uuid",
  "username": "mamoon",
  "avatarUrl": "https://...",
  "text": "Stunning composition!",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### Story Document (`stories` container)
```json
{
  "id": "uuid-v4",
  "creatorId": "user-uuid",
  "creatorUsername": "mamoon",
  "blobUrl": "https://lumorastorage01.blob.core.windows.net/photos/story-xxx.jpg",
  "caption": "Behind the scenes",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

## Authentication & Roles

Lumora uses **custom JWT authentication**:

1. On **registration**, `bcrypt` hashes the password; the user document is saved to Cosmos DB with `role: "consumer"` by default
2. On **login**, the backend verifies the bcrypt hash and signs a JWT with payload `{ id, username, role }`
3. The JWT is stored client-side in `localStorage` as `lm_token`; the user object is stored as `lm_user`
4. Every protected Function calls `requireAuth(request)` — it extracts and verifies the JWT using `JWT_SECRET`
5. Creator-only endpoints additionally call `requireCreator(request)` which checks `claims.role === 'creator'`

**Granting creator access:** Users register as `consumer`. To promote to `creator`, update the `role` field in the user's Cosmos DB document to `"creator"` manually or via an admin script.

---

## Setup & Deployment

### Prerequisites

- Node.js 18+
- Azure CLI — `az` ([install guide](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
- Azure Functions Core Tools v4 — `func` ([install guide](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local))
- An active Azure subscription with the following resources already provisioned:
  - Storage Account (`lumorastorage01`) with `$web` static website enabled and `photos` blob container
  - Azure Functions App (`lumora-api-mb`) on Node.js 18
  - Cosmos DB account (Serverless) with database `lumora` and containers: `users`, `photos`, `comments`, `stories` — all with partition key `/id`

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/MamoonBashir/lumora.git
cd lumora

# 2. Install backend dependencies
cd backend
npm install

# 3. Create local settings file
cp local.settings.json.example local.settings.json
# Fill in your Azure credentials in local.settings.json

# 4. Start the Azure Functions runtime locally
func start

# 5. Serve the frontend (separate terminal)
cd ../frontend
npx serve .
# Open http://localhost:3000
```

Update `frontend/js/config.js` to point to local backend:
```js
const CONFIG = { API_BASE: 'http://localhost:7071/api' };
```

### Deploy Backend to Azure

```bash
cd backend
func azure functionapp publish lumora-api-mb --javascript
```

### Deploy Frontend to Azure

```bash
# Deploy all frontend files at once
az storage blob upload-batch \
  --account-name lumorastorage01 \
  --account-key <STORAGE_ACCOUNT_KEY> \
  --destination '$web' \
  --source ./frontend \
  --overwrite

# Or deploy a single file
az storage blob upload \
  --account-name lumorastorage01 \
  --account-key <STORAGE_ACCOUNT_KEY> \
  --container-name '$web' \
  --file frontend/feed.html \
  --name feed.html \
  --overwrite
```

---

## Environment Variables

Set these in the Azure Functions App → **Configuration → Application Settings**, or in `backend/local.settings.json` for local development:

| Variable | Description | Example |
|----------|-------------|---------|
| `COSMOS_ENDPOINT` | Cosmos DB account URI | `https://lumora-db.documents.azure.com:443/` |
| `COSMOS_KEY` | Cosmos DB primary key | `abc123==` |
| `COSMOS_DB` | Database name | `lumora` |
| `BLOB_ACCOUNT_NAME` | Storage account name | `lumorastorage01` |
| `BLOB_ACCOUNT_KEY` | Storage account key | `xyz==` |
| `BLOB_CONTAINER` | Blob container name | `photos` |
| `JWT_SECRET` | Secret key for JWT signing | `my-super-secret-key` |

**`local.settings.json` format:**
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_ENDPOINT": "https://...",
    "COSMOS_KEY": "...",
    "COSMOS_DB": "lumora",
    "BLOB_ACCOUNT_NAME": "lumorastorage01",
    "BLOB_ACCOUNT_KEY": "...",
    "BLOB_CONTAINER": "photos",
    "JWT_SECRET": "your-secret"
  }
}
```

---

## Known Limitations

| Feature | Status | Notes |
|---------|--------|-------|
| Story expiry | Partial | Stories show in feed but are not auto-deleted after 24h (no Cosmos TTL configured) |
| Follow / Unfollow | UI only | Toggle button exists but relationship is not persisted to database |
| Trending feed filter | Basic | Returns most-liked photos globally; not personalised |
| Search | Basic | Keyword match on title/caption; no full-text index in Cosmos DB |
| Notifications | UI only | Bell icon present but notifications not implemented |
| Phone OTP login | Mock | UI exists but no SMS gateway (e.g. Twilio/Azure Communication Services) connected |
| People tagging | Manual | Pin coordinates stored in DB; Azure Computer Vision auto-detection not wired up |
| Image optimisation | None | Photos stored and served at original resolution; no Azure CDN or thumbnail generation |

---

## Author

**Mamoon Bashir**  
MSc Computer Science — Scalable Systems Module  
2025–2026
