# AI-Powered Resume Builder & Analyzer (MERN)

## Setup
```bash
# Server
cd server
npm install
cp .env.example .env     # fill in MONGO_URI, JWT_SECRET, AI keys
npm run dev              # http://localhost:5000/api/health

# Client: scaffold with Vite (see Phase 1 commands), then
cd client
cp .env.example .env
npm run dev              # http://localhost:5173
```
Status: Phase 1 done (structure, schemas, server setup). Phase 2: APIs + AI analyzer. Phase 3: React UI.
