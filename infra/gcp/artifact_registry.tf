resource "google_artifact_registry_repository" "docker" {
  location      = var.region
  repository_id = var.repository
  description   = "Docker repo for ezclip"
  format        = "DOCKER"
}

output "artifact_registry_repo" {
  value = google_artifact_registry_repository.docker.name
}

