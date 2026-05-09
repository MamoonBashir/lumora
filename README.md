# Lumora — Cloud-Native Photo Sharing Platform

![Azure](https://img.shields.io/badge/Microsoft_Azure-0078D4?style=flat&logo=microsoft-azure&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat&logo=javascript&logoColor=black)
![CosmosDB](https://img.shields.io/badge/Cosmos_DB-NoSQL-0078D4?style=flat&logo=microsoft-azure&logoColor=white)

A scalable, cloud-native photo-sharing web application built on Microsoft Azure as part of the MSc Scalable Systems module. Supports two roles — **Creators** (upload & manage content) and **Consumers** (browse, like, comment, rate & save).

---

## Live Demo

| | URL |
|--|-----|
| **Frontend** | https://lumorastorage01.z1.web.core.windows.net |
| **Backend API** | https://lumora-api-mb.azurewebsites.net/api |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML / CSS / JavaScript |
| Backend | Azure Functions v4 · Node.js 18 |
| Database | Azure Cosmos DB (NoSQL · Serverless) |
| Media Storage | Azure Blob Storage (SAS URL direct upload) |
| Hosting | Azure Blob Static Website |
| Auth | Custom JWT (bcrypt + jsonwebtoken) |

---

## Project Structure

```
lumora/
├── frontend/          # Static website → deployed to Azure Blob $web
│   ├── *.html         # 8 pages (index, auth, feed, explore, photo, creator, saved, profile)
│   ├── css/shared.css
│   └── js/            # config.js · shared.js · api.js
├── backend/           # Azure Functions app → deployed to lumora-api-mb
│   └── src/
│       ├── functions/ # 21 HTTP route handlers
│       └── shared/    # auth · blob · cosmos · helpers
└── docs/
    └── project-report.md   # Full academic report (architecture, design decisions, evaluation)
```

---

## Quick Start (Local Development)

```bash
# Clone
git clone https://github.com/MamoonBashir/lumora.git
cd lumora

# Backend
cd backend
npm install
# Copy and fill in your Azure credentials
cp local.settings.json.example local.settings.json
func start

# Frontend (separate terminal)
cd ../frontend
npx serve .
```

Update `frontend/js/config.js`:
```js
const CONFIG = { API_BASE: 'http://localhost:7071/api' };
```

---

## Deploy

```bash
# Backend
cd backend
func azure functionapp publish lumora-api-mb --javascript

# Frontend
az storage blob upload-batch \
  --account-name lumorastorage01 \
  --account-key <KEY> \
  --destination '$web' \
  --source ./frontend \
  --overwrite
```

---

## Environment Variables

Set in Azure Functions → Application Settings (or `backend/local.settings.json` locally):

```
COSMOS_ENDPOINT=https://<account>.documents.azure.com:443/
COSMOS_KEY=<key>
COSMOS_DB=lumora
BLOB_ACCOUNT_NAME=lumorastorage01
BLOB_ACCOUNT_KEY=<key>
BLOB_CONTAINER=photos
JWT_SECRET=<secret>
```

---

## Documentation

For full architecture diagrams, design decisions, database schema, API reference, scalability analysis and evaluation, see:

**[📄 docs/project-report.md](docs/project-report.md)**

---

## Author

**Mamoon Bashir** · MSc Computer Science · Scalable Systems Module · 2025–2026
