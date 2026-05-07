# Lumora 📸

> A cloud-native, Instagram-style photo-sharing platform built on Microsoft Azure — MSc Cloud Computing Coursework

![Azure](https://img.shields.io/badge/Azure-Functions-0089D6?style=flat&logo=microsoft-azure)
![CosmosDB](https://img.shields.io/badge/Azure-Cosmos%20DB-0089D6?style=flat&logo=microsoft-azure)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat&logo=node.js)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat&logo=javascript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

## Overview

Lumora is a full-stack, scalable photo-sharing web application designed and deployed on Microsoft Azure. It supports two distinct user roles — **Creators** who upload and manage photos, and **Consumers** who browse, like, comment, rate, and save content. The platform is built with a serverless backend using Azure Functions and a fully static, responsive frontend.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│         HTML5 · CSS3 · Vanilla JavaScript               │
│    feed · explore · photo · profile · creator · saved   │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS REST API
┌───────────────────────▼─────────────────────────────────┐
│              Azure Functions (Node.js v22)               │
│                  Serverless · Pay-per-use                │
│   Auth · Photos · Comments · Likes · Saves · Ratings   │
└──────────┬────────────────────────────┬─────────────────┘
           │                            │
┌──────────▼──────────┐    ┌────────────▼────────────────┐
│   Azure Cosmos DB   │    │    Azure Blob Storage        │
│  NoSQL · 4 containers│    │  Photo CDN · SAS Upload     │
│  photos · users      │    │  Direct browser upload      │
│  comments · stories  │    │  via SAS token              │
└─────────────────────┘    └─────────────────────────────┘
```

---

## Features

### Consumer
| Feature | Description |
|---------|-------------|
| 📰 Photo Feed | Infinite-scroll feed with category filters and trending sort |
| 🔍 Explore | Masonry grid with real-time search and hashtag discovery |
| ❤️ Like | Toggle like on photos — persisted to database instantly |
| 💬 Comments | Post and view comments with newest/oldest sort |
| ⭐ Ratings | 1–5 star community rating with live average update |
| 🔖 Save | Bookmark photos to personal saved collection |
| 📖 Stories | Horizontal story bar (Instagram-style) |
| 👤 Profile | View any creator's profile and photo portfolio |

### Creator
| Feature | Description |
|---------|-------------|
| 📤 Upload | Direct-to-Blob upload via SAS token (no server middleman) |
| 🎨 Filters | Client-side photo filters (Moon, Clarendon, Vivid, etc.) |
| 🏷️ Metadata | Title, caption, category, hashtags, people tags |
| 🗑️ Delete | Delete own photos (admin can delete any) |

### Authentication
- JWT-based stateless authentication
- bcrypt password hashing
- Role-based access control (`consumer` / `creator` / `admin`)
- 7-day token expiry

---

## Tech Stack

### Frontend
- **Pure HTML5 / CSS3 / Vanilla JS** — no framework dependencies
- CSS custom properties for theming (light/dark ready)
- Responsive grid layouts with CSS Grid and Flexbox
- 8 fully functional pages

### Backend
- **Azure Functions v4** (Node.js 22) — serverless REST API
- **Azure Cosmos DB** — NoSQL document database
- **Azure Blob Storage** — image storage with SAS token upload
- **jsonwebtoken** — JWT authentication
- **bcryptjs** — password hashing
- **uuid** — unique ID generation

### DevOps
- **GitHub Actions** — CI/CD pipelines
- Auto-deploy backend on push to `main` (when `backend/` changes)
- Auto-deploy frontend on push to `main` (when `frontend/` changes)

---

## Project Structure

```
lumora/
├── .github/
│   └── workflows/
│       ├── deploy-backend.yml      # Azure Functions CI/CD
│       └── deploy-frontend.yml     # Blob Storage static site CI/CD
│
├── backend/
│   ├── src/
│   │   ├── functions/              # 14 Azure Function endpoints
│   │   │   ├── authLogin.js
│   │   │   ├── authRegister.js
│   │   │   ├── authMe.js
│   │   │   ├── photosList.js       # GET feed + POST upload
│   │   │   ├── photosGet.js        # GET by id + DELETE
│   │   │   ├── photosUploadUrl.js  # SAS token generator
│   │   │   ├── photosLike.js       # Toggle like
│   │   │   ├── photosSave.js       # Toggle save
│   │   │   ├── photosRate.js       # 1-5 star rating
│   │   │   ├── photosSearch.js
│   │   │   ├── photosTrending.js
│   │   │   ├── commentsList.js     # GET + POST comments
│   │   │   ├── storiesList.js
│   │   │   └── usersProfile.js
│   │   └── shared/
│   │       ├── auth.js             # JWT helpers
│   │       ├── blob.js             # SAS token generation
│   │       ├── cosmos.js           # Cosmos DB client
│   │       └── helpers.js          # CORS + response helpers
│   ├── host.json
│   └── package.json
│
└── frontend/
    ├── index.html                  # Public landing page
    ├── auth.html                   # Login & Sign up
    ├── feed.html                   # Main photo feed
    ├── explore.html                # Search & discover
    ├── photo.html                  # Single photo detail
    ├── profile.html                # User profile
    ├── creator.html                # Creator studio
    ├── saved.html                  # Saved collection
    ├── css/
    │   └── shared.css              # Global design system
    └── js/
        ├── config.js               # API base URL config
        ├── api.js                  # API layer (all fetch calls)
        └── shared.js               # Navbar, auth, utilities
```

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/register` | — | Register new user |
| `POST` | `/api/auth/login` | — | Login, returns JWT |
| `GET`  | `/api/auth/me` | ✅ | Get current user |
| `GET`  | `/api/photos` | — | List photos (filter, page, limit) |
| `POST` | `/api/photos` | Creator | Create photo record |
| `GET`  | `/api/photos/{id}` | — | Get single photo |
| `DELETE` | `/api/photos/{id}` | Owner/Admin | Delete photo |
| `POST` | `/api/photos/upload-url` | Creator | Get SAS upload URL |
| `POST` | `/api/photos/{id}/like` | ✅ | Toggle like |
| `POST` | `/api/photos/{id}/save` | ✅ | Toggle save |
| `POST` | `/api/photos/{id}/rate` | ✅ | Submit 1–5 star rating |
| `GET`  | `/api/photos/{id}/comments` | — | List comments |
| `POST` | `/api/photos/{id}/comments` | ✅ | Post a comment |
| `GET`  | `/api/stories` | — | Get active stories |

---

## Cosmos DB Schema

### `photos` container — partition key: `/id`
```json
{
  "id": "uuid",
  "creatorId": "uuid",
  "creatorUsername": "string",
  "title": "string",
  "description": "string",
  "blobUrl": "string",
  "category": "travel|nature|urban|portrait|abstract",
  "hashtags": ["string"],
  "likeCount": 0,
  "saveCount": 0,
  "commentCount": 0,
  "avgRating": 0,
  "ratingCount": 0,
  "createdAt": "ISO8601"
}
```

### `users` container — partition key: `/id`
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "passwordHash": "string",
  "role": "consumer|creator|admin",
  "likedPhotos": ["photoId"],
  "savedPhotos": ["photoId"],
  "createdAt": "ISO8601"
}
```

### `comments` container — partition key: `/photoId`
```json
{
  "id": "uuid",
  "photoId": "uuid",
  "userId": "uuid",
  "username": "string",
  "text": "string",
  "createdAt": "ISO8601"
}
```

---

## Local Development

### Prerequisites
- Node.js 22+
- Azure Functions Core Tools v4
- Azure account with Cosmos DB and Blob Storage

### Setup

```bash
# Clone the repository
git clone https://github.com/MamoonBashir/lumora.git
cd lumora

# Install backend dependencies
cd backend
npm install

# Create local settings (never commit this file)
cp local.settings.example.json local.settings.json
# Fill in your Azure credentials in local.settings.json

# Start the backend locally
func start
```

Open `frontend/feed.html` in your browser. The frontend connects to `http://localhost:7071/api` by default.

### Environment Variables (`local.settings.json`)

```json
{
  "Values": {
    "COSMOS_ENDPOINT": "https://YOUR_ACCOUNT.documents.azure.com:443/",
    "COSMOS_KEY": "YOUR_COSMOS_KEY",
    "COSMOS_DATABASE": "lumora-db",
    "BLOB_CONNECTION_STRING": "DefaultEndpointsProtocol=https;...",
    "BLOB_CONTAINER": "photos",
    "BLOB_ACCOUNT_NAME": "YOUR_STORAGE_ACCOUNT",
    "JWT_SECRET": "your-secret-key",
    "JWT_EXPIRES": "7d",
    "ALLOWED_ORIGINS": "http://localhost:5500,http://127.0.0.1:5500"
  }
}
```

---

## Deployment

### Backend — Azure Functions

```bash
cd backend
func azure functionapp publish lumora-api-mb
```

### Frontend — Azure Blob Static Website

```bash
az storage blob upload-batch \
  --account-name lumorastorage01 \
  --source frontend \
  --destination '$web' \
  --overwrite true
```

### CI/CD — GitHub Actions

Two automated pipelines are configured:

| Pipeline | Trigger | Action |
|----------|---------|--------|
| `deploy-backend.yml` | Push to `main` → `backend/**` | Publish to Azure Functions |
| `deploy-frontend.yml` | Push to `main` → `frontend/**` | Upload to Azure Blob `$web` |

**Required GitHub Secrets:**

| Secret | Description |
|--------|-------------|
| `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` | Download from Azure Portal → Function App → Get publish profile |
| `AZURE_STORAGE_CONNECTION_STRING` | Storage account connection string |

---

## Azure Resources

| Resource | Name | Purpose |
|----------|------|---------|
| Resource Group | `lumora-rg` | Container for all resources |
| Cosmos DB | `lumora-cosmos-db` | NoSQL database |
| Storage Account | `lumorastorage01` | Photo storage + static frontend |
| Function App | `lumora-api-mb` | Serverless API (Node.js 22, Linux) |

---

## Security

- Passwords hashed with **bcrypt** (10 salt rounds)
- JWTs signed with a secret key, expire after 7 days
- Blob uploads use **time-limited SAS tokens** (no permanent credentials exposed)
- CORS configured to allow only specific origins
- `local.settings.json` excluded from version control via `.gitignore`
- Role-based access: creator-only and owner-only routes enforced server-side

---

## Author

**Mamoon Bashir**  
MSc Cloud Computing  
📧 mamoonbashir6@gmail.com  
🐙 [github.com/MamoonBashir](https://github.com/MamoonBashir)

---

## License

This project is submitted as MSc coursework. All rights reserved.
