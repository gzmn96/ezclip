Stop your current processes: Press Ctrl+C in your terminals.
Restart Docker: Run npm run compose:up (I moved the webhook to port 3001 to free up port 3000).
Restart Web App: Run npm run dev --workspace @ezclip/web.
Open: http://localhost:3000.


# ezclip

Auto-clip and auto-publish pipeline for new YouTube uploads.

## Quick start

1. Copy `.env.example` to `.env` and fill in secrets.
2. Install dependencies with `npm install`.
3. Run tests with `npm test`.
4. Build all workspaces with `npm run build`.
5. Launch the stack with `npm run compose:up`.

See [docs/QUICK_START.md](docs/QUICK_START.md) for details.

## Deploying to Google Cloud

- Infrastructure-as-code lives in `infra/gcp-terraform` and provisions everything required in a single GCP project per environment (Artifact Registry, Cloud Run services/jobs, Memorystore, buckets, secrets, logging).
- CI/CD is handled by `.github/workflows/deploy.yml`. Pushes to `develop` deploy the **test** project, pushes to `main` deploy the **prod** project.
- The workflow builds all five service images, pushes them to Artifact Registry using immutable digests, and runs `terraform apply` with those digests so Cloud Run rolls out the new revisions.
- Configure Workload Identity Federation plus GitHub secrets as described in `infra/gcp-terraform/README.md` before running the workflow for the first time.
- Manual deploys are also possible: `cd infra/gcp-terraform && terraform init && terraform workspace select test && terraform apply -var project_id=<project> ...` (see the infra README for the full command list).


git config --global user.email "gzmn96@gmail.com"
  git config --global user.name "Rafael Guzman"

  
------START------

To start your services, you have a few options depending on which one you want to run. Since you are in a monorepo, it's best to run npm install first to ensure all workspaces are linked correctly.

1. Start the Web App (Frontend)
If you are trying to start the Next.js web application:

bash
# From the root directory
npm install
npm run dev --workspace @ezclip/web
Alternative (if the workspace command fails):

bash
cd services/web
npm run dev
2. Start the Worker (The "Supreme Brain" we just built)
If you want to run the background worker to process videos:

bash
# From the root directory
npm run dev --workspace @ezclip/worker
Alternative:

bash
cd services/worker
npm run dev
Troubleshooting "No workspaces found"
If you see npm error No workspaces found, it usually means npm hasn't indexed the workspaces yet. Running npm install in the root directory 
/Users/rafael/Projects/ezclip
 should fix this