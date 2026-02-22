# GrantOps: The Ironman Suit for Grant Hunting


**Automate the hunt.** Scrapes major grant boards, **AI-scores suitability**, **tailors applications** (RxResume), and **tracks application emails** automatically.

Self-hosted. Docker-based. **Stop applying manually.**

## 40s Demo: Crawl → Score → PDF → Track

## Documentation (Start Here)

JobOps ships with full docs for setup, architecture, extractors, and troubleshooting.

If you want the serious view of the project, start here:

- [Documentation Home](https://jobops.dakheera47.com/docs/)
- [Self-Hosting Guide](https://jobops.dakheera47.com/docs/getting-started/self-hosting)
- [Feature Overview](https://jobops.dakheera47.com/docs/features/overview)
- [Orchestrator Pipeline](https://jobops.dakheera47.com/docs/features/orchestrator)
- [Extractor System](https://jobops.dakheera47.com/docs/extractors/overview)
- [Troubleshooting](https://jobops.dakheera47.com/docs/troubleshooting/common-problems)

## Quick Start (10 Min)

Prefer guided setup? Follow the [Self-Hosting Guide](https://jobops.dakheera47.com/docs/getting-started/self-hosting).

```bash
# 1. Download
git clone https://github.com/DaKheera47/job-ops.git
cd job-ops

# 2. Start (Pulls pre-built image)
docker compose up -d

# 3. Launch Dashboard
# Open http://localhost:3005 to start the onboarding wizard

```

## Why GrantOps?

* **Universal Scraping**: Supports **TK list** + specialized boards (TK specialized).
* **AI Scoring**: Ranks jobs by fit against *your* profile using your preferred LLM (OpenRouter/OpenAI/Gemini).
* **Auto-Tailoring**: Generates custom resumes (PDFs) for every application using RxResume v4.
* **Email Tracking**: Connect Gmail to auto-detect interviews, offers, and rejections.
* **Self-Hosted**: Your data stays with you. SQLite database. No SaaS fees.

## Workflow

1. **Search**: Scrapes job boards for roles matching your criteria.
2. **Score**: AI ranks jobs (0-100) based on your resume/profile.
3. **Tailor**: Generates a custom resume summary & keyword optimization for top matches.
4. **Export**: Uses [RxResume v4](https://v4.rxresu.me) to create tailored PDFs.
5. **Track**: "Smart Router" AI watches your inbox for recruiter replies.

## Supported Extractors

| Platform | Focus |
| --- | --- |
|  |  |

*(More extractors can be added via TypeScript - see [extractors documentation](https://jobops.dakheera47.com/docs/extractors/overview))*

## Post-App Tracking (Killer Feature)

Connect Gmail → AI routes emails to your applied jobs.

* "We'd like to interview you..." → **Status: Interviewing** (Auto-updated)
* "Unfortunately..." → **Status: Rejected** (Auto-updated)

See [post-application tracking docs](https://jobops.dakheera47.com/docs/features/post-application-tracking) for setup.

**Note on Analytics**: The alpha version includes anonymous analytics (Umami) to help debug performance. To opt-out, block `umami.dakheera47.com` in your firewall/DNS.

## License

**AGPLv3** - Free to use and modify.
