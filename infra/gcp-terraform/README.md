# Google Cloud Infrastructure

Terraform in this directory provisions everything ezclip needs per environment (test/prod) inside its own GCP project.

## Resources
- Artifact Registry Docker repository (`ezclip-repo`).
- GCS buckets:
  - `ezclip-${env}-raw-videos` for source and rendered clips.
  - `ezclip-${env}-tmp` mounted at `/app/tmp` in Cloud Run Jobs via GCS FUSE.
  - `ezclip-${env}-logs` as the destination for a centralized Cloud Logging sink.
- VPC + Serverless VPC Access connector so Cloud Run can reach Memorystore.
- Memorystore Redis (`BASIC` in test, `STANDARD_HA` recommended for prod).
- Secret Manager secrets (`yt-hub-secret-${env}`, `redis-url-${env}`).
- Service accounts for each workload (webhook, publish, ingest, analyze, clipper) with least-privilege IAM (Artifact Registry Reader, Secret Manager Accessor, Storage Object Admin, Redis Client, Logging Writer).
- Cloud Run services:
  - `ezclip-webhook` (public HTTP, health check on `/health`).
  - `ezclip-publish` (internal-only).
- Cloud Run jobs:
  - `ezclip-ingest`, `ezclip-analyze`, `ezclip-clipper` (each mounts `/app/tmp` from the tmp bucket).
- Cloud Logging sink that exports all Cloud Run service + job logs to the logs bucket.

## Prerequisites
1. **Create two GCP projects** (e.g., `ezclip-test`, `ezclip-prod`). Record their IDs.
2. **Enable Workload Identity Federation** for this GitHub repository:
   - Create/choose an Identity Pool + Provider (`secrets.GCP_WORKLOAD_IDENTITY_PROVIDER` should store the provider resource name).
   - In each project, create a service account named `github-deployer@<project-id>.iam.gserviceaccount.com` (or adjust the workflow if you prefer a different name).
   - Grant that service account the roles it needs: `roles/run.admin`, `roles/artifactregistry.admin`, `roles/secretmanager.admin`, `roles/storage.admin`, `roles/compute.networkAdmin`, `roles/redis.admin`, `roles/logging.configWriter`, `roles/iam.serviceAccountTokenCreator`.
   - Allow the Workload Identity Provider principal to impersonate the service account (`gcloud iam service-accounts add-iam-policy-binding ... --role=roles/iam.workloadIdentityUser`).
3. **CLI tooling (for manual applies)**: install `gcloud` and Terraform >= 1.5.

## GitHub Secrets
Set the following secrets in the repository:

| Secret | Purpose |
| --- | --- |
| `GCP_PROJECT_ID_TEST` | Project ID for the test environment. |
| `GCP_PROJECT_ID_PROD` | Project ID for the prod environment. |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Resource name of the WIF provider that trusts GitHub Actions. |
| `YT_HUB_SECRET_TEST` | WebSub/Hub secret for the test webhook. |
| `YT_HUB_SECRET_PROD` | WebSub/Hub secret for the prod webhook. |

*Optional*: If you deviate from the default service-account naming pattern, also store `GCP_SERVICE_ACCOUNT_TEST` / `GCP_SERVICE_ACCOUNT_PROD` and update the workflow accordingly.

## GitHub Actions Flow
`.github/workflows/deploy.yml` runs on every push to `develop` and `main`:
1. Determines the target environment (`develop` → `test`, `main` → `prod`).
2. Authenticates to GCP using WIF, builds all five service images, and pushes them to Artifact Registry with immutable tags (`${env}-${short_sha}`).
3. Feeds the resulting digests into Terraform and runs `terraform apply` inside this directory, which rolls out Cloud Run services/jobs plus all infra changes.

## Manual Terraform Usage
While CI handles day-to-day deploys, you can apply manually:
```bash
cd infra/gcp-terraform
terraform init
terraform workspace select test || terraform workspace new test
terraform apply \ 
  -var project_id=$GCP_PROJECT_ID_TEST \
  -var region=us-central1 \
  -var environment=test \
  -var redis_tier=BASIC \
  -var webhook_image="us-central1-docker.pkg.dev/<project>/ezclip-repo/ezclip-webhook@sha256:<digest>" \
  -var ingest_image=... \  # repeat for analyze/clipper/publish
  -var yt_hub_secret=$YT_HUB_SECRET_TEST
```
Repeat with the prod workspace / project / images. Terraform outputs the webhook URL, Redis host, and Artifact Registry repo URL when it finishes.

## First Deployment Checklist
1. Create the two GCP projects and enable billing.
2. Configure Workload Identity Federation + service accounts + roles.
3. Enable the APIs listed in `main.tf` (or let Terraform enable them automatically).
4. Add the GitHub secrets above.
5. Push to `develop` to trigger the first test deployment. Once verified, merge to `main` for prod.
