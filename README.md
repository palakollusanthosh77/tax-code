# TaxCode Insight — The AI-Powered Audit & Compliance Orchestrator

A production-grade MERN + GenAI platform that helps Chartered Accountants and auditors search regulatory law with RAG-grounded AI, generate structured audit observations, summarize compliance documents, and compare tax regimes — all backed by MongoDB Atlas, Pinecone, and Google Gemini.

---

## 1. Tech Stack

| Layer            | Technology                                   |
|-------------------|-----------------------------------------------|
| Frontend          | React 18 (Vite), Tailwind CSS, React Router, Axios |
| Backend           | Node.js, Express.js                          |
| Database          | MongoDB Atlas (Mongoose ODM)                 |
| Vector Database   | Pinecone (serverless index)                  |
| AI Model          | Google Gemini (`gemini-1.5-pro` + `text-embedding-004`) |
| Auth              | JWT + bcrypt                                 |
| File Upload       | Multer                                       |
| PDF Parsing       | pdf-parse                                    |
| PDF Report Export | pdfkit                                       |
| Env Config        | dotenv                                       |

---

## 2. Folder Structure

```
taxcode-insight/
├── backend/
│   ├── config/          # db.js, gemini.js, pinecone.js
│   ├── controllers/     # authController, documentController, aiController, reportController, adminController, dashboardController
│   ├── middleware/      # authMiddleware, roleMiddleware, errorMiddleware, validateMiddleware, uploadMiddleware
│   ├── models/          # User, Document, AuditReport, QueryHistory
│   ├── routes/          # authRoutes, documentRoutes, aiRoutes, reportRoutes, adminRoutes, dashboardRoutes
│   ├── services/        # pdfService, embeddingService, pineconeService, geminiService, ragService, taxService
│   ├── utils/           # asyncHandler, apiError, apiResponse, chunkText, logger, generateToken, initPinecone, seedAdmin
│   ├── uploads/          # uploaded PDF storage
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/          # axiosClient + one file per resource
    │   ├── components/   # layout/, common/, documents/, ai/, reports/, dashboard/
    │   ├── pages/         # Login, Register, Dashboard, Documents, AISearch, AuditWorkspace, Summarizer, TaxComparison, Reports, Profile, AdminPanel, NotFound
    │   ├── context/       # AuthContext, ThemeContext
    │   ├── hooks/         # useAuth, useTheme, useDebounce
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.js
    ├── package.json
    └── .env.example
```

---

## 3. How the RAG Pipeline Works

1. **Upload**: User uploads a PDF via `/api/documents/upload` (Multer stores it on disk, a `Document` record is created with `status: processing`).
2. **Extract**: `pdfService.extractTextFromPDF` uses `pdf-parse` to pull raw text.
3. **Chunk**: `utils/chunkText.js` splits the text into ~1500-character overlapping chunks (200-char overlap) on sentence boundaries.
4. **Embed**: `embeddingService.js` calls Gemini's `text-embedding-004` model to generate a 768-dim vector per chunk.
5. **Store**: `pineconeService.js` upserts vectors into Pinecone with metadata (`documentId`, `documentTitle`, `category`, `text`).
6. **Query**: When a user asks a question (`/api/ai/query`), the question is embedded, Pinecone returns the top-K most similar chunks, and only chunks above a similarity threshold (0.55) are kept.
7. **Generate**: The retrieved chunks are passed as context to Gemini with a strict system instruction: *answer only from context; never fabricate; cite sources*. If no chunk clears the threshold, the API returns exactly: `"No relevant information found in the uploaded regulatory documents."`
8. **Audit trail**: Every query is logged to `QueryHistory` with sources, confidence score, and a `grounded` flag.

This entire flow runs asynchronously after upload so the UI isn't blocked — the document's `status` field (`processing → indexed/failed`) is polled/refreshed from the Documents page.

---

## 4. API Endpoints

### Authentication
| Method | Endpoint             | Description               |
|--------|-----------------------|----------------------------|
| POST   | `/api/auth/register`  | Register a new user       |
| POST   | `/api/auth/login`     | Login, returns JWT         |
| GET    | `/api/auth/me`        | Get current profile (protected) |
| PUT    | `/api/auth/me`        | Update current profile (protected) |

### Documents
| Method | Endpoint                | Description                        |
|--------|---------------------------|--------------------------------------|
| POST   | `/api/documents/upload`   | Upload PDF → triggers RAG pipeline |
| GET    | `/api/documents`          | List/search documents (paginated)  |
| GET    | `/api/documents/:id`      | Get single document                |
| DELETE | `/api/documents/:id`      | Delete document + its vectors      |

### AI
| Method | Endpoint                  | Description                            |
|--------|-----------------------------|------------------------------------------|
| POST   | `/api/ai/query`             | RAG-grounded regulatory Q&A            |
| GET    | `/api/ai/query/history`     | Current user's search history           |
| POST   | `/api/ai/audit`             | Generate structured audit observations |
| POST   | `/api/ai/summarize`         | Summarize a document (by ID or raw text) |
| POST   | `/api/ai/tax-comparison`    | Old vs New tax regime comparison       |

### Reports
| Method | Endpoint                | Description               |
|--------|---------------------------|-----------------------------|
| POST   | `/api/reports`            | Save an AI-generated report |
| GET    | `/api/reports`            | List report history (paginated) |
| GET    | `/api/reports/:id`        | Get a single report        |
| DELETE | `/api/reports/:id`        | Delete a report            |
| GET    | `/api/reports/:id/pdf`    | Download report as PDF     |

### Admin (role: admin only)
| Method | Endpoint                     | Description                  |
|--------|---------------------------------|---------------------------------|
| GET    | `/api/admin/users`              | List all users                |
| PUT    | `/api/admin/users/:id/status`   | Activate/deactivate a user    |
| GET    | `/api/admin/documents`          | View all uploaded documents   |
| GET    | `/api/admin/usage`              | Platform-wide AI usage stats  |

### Dashboard
| Method | Endpoint         | Description                          |
|--------|--------------------|-----------------------------------------|
| GET    | `/api/dashboard`   | Summary stats + recent activity        |

---

## 5. Setup Instructions

### Prerequisites
- Node.js ≥ 18
- A MongoDB Atlas cluster (connection string)
- A Pinecone account (serverless index, API key)
- A Google Gemini API key (from Google AI Studio)

### 5.1 Backend Setup

```bash
cd backend
cp .env.example .env
# edit .env with your MongoDB, Pinecone, Gemini, and JWT values
npm install

# One-time: create the Pinecone index (768-dim, cosine metric)
node utils/initPinecone.js

# One-time: create a default admin user (admin@taxcodeinsight.com / Admin@12345)
npm run seed:admin

# Start in dev mode (nodemon)
npm run dev
# or production
npm start
```

The API will run on `http://localhost:5000` by default.

### 5.2 Frontend Setup

```bash
cd frontend
cp .env.example .env
# ensure VITE_API_BASE_URL points to your backend, e.g. http://localhost:5000/api
npm install
npm run dev
```

The app will run on `http://localhost:5173` (Vite dev server proxies `/api` to the backend).

### 5.3 First-Time Login

- Register a new account from the UI (`/register`), **or**
- Use the seeded admin: `admin@taxcodeinsight.com` / `Admin@12345` (change this password immediately in production).

---

## 6. Environment Variables

See `backend/.env.example` and `frontend/.env.example`. Key backend variables:

| Variable                | Purpose                                      |
|--------------------------|------------------------------------------------|
| `MONGO_URI`              | MongoDB Atlas connection string               |
| `JWT_SECRET`             | Secret used to sign JWTs                      |
| `GEMINI_API_KEY`         | Google Gemini API key                         |
| `GEMINI_EMBEDDING_MODEL` | Defaults to `text-embedding-004`              |
| `GEMINI_CHAT_MODEL`      | Defaults to `gemini-1.5-pro`                  |
| `PINECONE_API_KEY`       | Pinecone API key                              |
| `PINECONE_INDEX_NAME`    | Pinecone index name (created by `initPinecone.js`) |
| `PINECONE_CLOUD` / `PINECONE_REGION` | Serverless index region (e.g. `aws` / `us-east-1`) |
| `MAX_UPLOAD_MB`          | Max PDF upload size (default 20MB)            |

---

## 7. Testing

### Manual API smoke test (using `curl` or Postman)

```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane CA","email":"jane@firm.com","password":"secret123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@firm.com","password":"secret123"}'

# Upload a document (replace TOKEN and path)
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@./sample-gst-circular.pdf" \
  -F "title=GST Circular" \
  -F "category=GST"

# Ask a question
curl -X POST http://localhost:5000/api/ai/query \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"question":"What are GST late filing penalties?"}'
```

### Suggested automated test additions (not included by default, to keep the project lean)
- **Backend**: Jest + Supertest for controller/route tests; mock Gemini/Pinecone calls.
- **Frontend**: Vitest + React Testing Library for component/page tests; Cypress/Playwright for E2E flows (login → upload → query → save report).

---

## 8. Deployment Instructions

### Backend (Node/Express) — e.g. Render, Railway, EC2, or Docker
1. Set all variables from `.env.example` in your hosting provider's environment settings.
2. Ensure the `uploads/` directory is on persistent storage (or swap to S3/Cloud Storage for production — recommended for horizontal scaling).
3. Build/run: `npm install && npm start`.
4. Run `node utils/initPinecone.js` once against production Pinecone credentials.
5. Point `CLIENT_URL` to your deployed frontend origin for CORS.

**Minimal Dockerfile (backend)**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Frontend (React/Vite) — e.g. Vercel, Netlify, or static hosting behind Nginx
1. Set `VITE_API_BASE_URL` to your deployed backend's `/api` URL.
2. Build: `npm run build` → outputs static assets to `dist/`.
3. Deploy `dist/` to your static host; configure SPA fallback (`/* -> index.html`) for React Router.

### MongoDB Atlas
- Create a free/shared or dedicated cluster, add your server's IP (or `0.0.0.0/0` for cloud hosts with dynamic IPs) to the network access list, and create a database user.

### Pinecone
- Create a serverless index via `initPinecone.js` (matches Gemini's 768-dim embeddings) or manually in the Pinecone console with `metric: cosine`.

### Google Gemini
- Generate an API key at Google AI Studio and enable billing/quota appropriate for your expected query volume.

---

## 9. Security Notes
- Passwords are hashed with bcrypt (10 salt rounds); JWTs expire per `JWT_EXPIRES_IN`.
- `helmet` + rate limiting are enabled on all `/api` routes.
- File uploads are restricted to PDF mimetype and a configurable size cap.
- All AI responses are grounded via RAG; the system prompt explicitly forbids fabrication and mandates the "No relevant information found..." fallback.
- Role-based access control (`user` / `admin`) protects `/api/admin/*` routes.

---

## 10. Roadmap / Suggested Enhancements
- Move file storage to S3/GCS for multi-instance deployments.
- Add Excel export for audit observation tables (`xlsx` is already a frontend dependency).
- Add multi-document comparison view (diff amendments across two PDFs).
- Add WebSocket/polling for live document indexing status instead of manual refresh.
- Add automated test suites as outlined in section 7.

---

Built as a reference implementation of a production-quality MERN + GenAI compliance platform.
