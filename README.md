# Job Ops 🚀

Automated job discovery, scoring, and resume generation pipeline.

## Features

- **Job Crawler** - Discovers jobs from Gradcracker and other sources
- **AI Scoring** - Ranks jobs by suitability using OpenRouter API
- **Resume Generator** - Creates tailored PDFs via RXResume automation
- **Dashboard UI** - React-based interface for reviewing and applying

## Quick Start with Docker

### 1. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit with your credentials
nano .env
```

Required environment variables:
- `OPENROUTER_API_KEY` - Get from [openrouter.ai/keys](https://openrouter.ai/keys)
- `RXRESUME_EMAIL` - Your [rxresu.me](https://rxresu.me) account email
- `RXRESUME_PASSWORD` - Your RXResume password

### 2. Add Your Base Resume

Place your resume JSON at `resume-generator/base.json`.
You can export this from RXResume.

### 3. Run

```bash
# Build and start
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

### 4. Access

- **Dashboard**: http://localhost:3001
- **API**: http://localhost:3001/api
- **Health**: http://localhost:3001/health

## Data Persistence

All data is stored in the `./data` directory:
- `data/jobs.db` - SQLite database
- `data/pdfs/` - Generated resume PDFs

## Development

### Without Docker

```bash
# Install dependencies
cd orchestrator && npm install
cd ../job-extractor && npm install

# Set up Python environment for resume generator
cd ../resume-generator
python3 -m venv .venv
source .venv/bin/activate
pip install playwright
playwright install chromium

# Run orchestrator (from orchestrator folder)
cd ../orchestrator
cp .env.example .env  # Configure your env
npm run db:migrate
npm run dev
```

### Build Docker Image

```bash
docker build -t job-ops:latest .
```

### Push to Docker Hub

```bash
docker tag job-ops:latest yourusername/job-ops:latest
docker push yourusername/job-ops:latest
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List all jobs |
| GET | `/api/jobs/:id` | Get job details |
| PATCH | `/api/jobs/:id` | Update job |
| POST | `/api/jobs/:id/process` | Generate resume for job |
| POST | `/api/jobs/:id/apply` | Mark as applied |
| POST | `/api/jobs/:id/reject` | Skip job |
| POST | `/api/jobs/process-discovered` | Process all discovered jobs |
| GET | `/api/pipeline/status` | Pipeline status |
| POST | `/api/pipeline/run` | Trigger pipeline |
| GET | `/api/pipeline/progress` | SSE progress stream |
| DELETE | `/api/database` | Clear all data |

## Architecture

```
job-ops/
├── orchestrator/       # Node.js backend + React frontend
│   ├── src/server/    # Express API, services, DB
│   └── src/client/    # React dashboard
├── job-extractor/      # Crawlee-based job crawler
├── resume-generator/   # Python Playwright automation
├── data/               # SQLite DB + generated PDFs
├── Dockerfile
└── docker-compose.yml
```

## License

MIT
