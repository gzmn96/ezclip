pipeline {
  agent any

  environment {
    AWS_REGION = "us-east-1"
    // Provide an AWS credentials binding named 'aws-creds' (Access Key ID/Secret)
    // or configure the Jenkins node with an instance profile.
    GCP_REGION = "us-central1"
    GCP_ARTIFACT_REPO = "ezclip"
  }

  options {
    timestamps()
  }

  stages {
    stage('Prepare') {
      steps {
        script {
          // Determine environment from branch
          def branch = env.BRANCH_NAME ?: sh(returnStdout: true, script: 'git branch --show-current').trim()
          if (branch == 'main') {
            env.DEPLOY_ENV = 'prod'
          } else if (branch == 'develop') {
            env.DEPLOY_ENV = 'test'
          } else {
            error "Unsupported branch '${branch}'. Use 'develop' or 'main'."
          }

          // Short SHA for tagging
          env.SHORT_SHA = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()

          // Ensure Terraform is available
          sh '''#!/usr/bin/env bash
          set -euo pipefail
          export PATH="$PWD/bin:$PATH"
          if ! command -v terraform >/dev/null 2>&1; then
            VER=1.6.6
            mkdir -p bin
            curl -sSL -o bin/terraform.zip https://releases.hashicorp.com/terraform/${VER}/terraform_${VER}_linux_amd64.zip
            (cd bin && unzip -o terraform.zip && rm terraform.zip && chmod +x terraform)
          fi
          terraform -version
          '''
        }
      }
    }

    stage('AWS Login') {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-creds']]) {
          sh '''#!/usr/bin/env bash
          set -euo pipefail
          if ! command -v aws >/dev/null 2>&1; then
            curl -sSL -o awscliv2.zip https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip
            unzip -q -o awscliv2.zip
            sudo ./aws/install || ./aws/install
          fi
          ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
          echo "Using AWS Account: $ACCOUNT_ID"
          aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
          echo $ACCOUNT_ID > .account_id
          '''
        }
      }
    }

    stage('GCP Login') {
      steps {
        withCredentials([file(credentialsId: 'gcp-sa-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
          sh '''#!/usr/bin/env bash
          set -euo pipefail
          if ! command -v gcloud >/dev/null 2>&1; then
            curl -sSL https://sdk.cloud.google.com | bash -s -- --disable-prompts --install-dir=$WORKSPACE/bin
            export PATH="$WORKSPACE/bin/google-cloud-sdk/bin:$PATH"
          else
            export PATH="$WORKSPACE/bin/google-cloud-sdk/bin:$PATH:$PATH"
          fi
          gcloud auth activate-service-account --key-file "$GOOGLE_APPLICATION_CREDENTIALS"
          if [ -z "${GCP_PROJECT_ID:-}" ]; then
            echo 'GCP_PROJECT_ID not set. Define a Jenkins credential env var or parameter.'
            exit 1
          fi
          gcloud config set project "$GCP_PROJECT_ID"
          gcloud config set run/region "$GCP_REGION"
          gcloud --version
          '''
        }
      }
    }

    stage('Terraform: Create ECR Repos') {
      steps {
        dir('infra/terraform') {
          sh '''#!/usr/bin/env bash
          set -euo pipefail
          export PATH="$WORKSPACE/bin:$PATH"
          terraform init -upgrade
          terraform workspace select ${DEPLOY_ENV} || terraform workspace new ${DEPLOY_ENV}
          terraform apply -auto-approve -target=aws_ecr_repository.repos \
            -var-file=environments/${DEPLOY_ENV}.tfvars \
            -var environment=${DEPLOY_ENV}
          '''
        }
      }
    }

    stage('Terraform (GCP): Setup repo + secrets + Cloud Run/Jobs') {
      steps {
        withCredentials([
          string(credentialsId: 'yt-hub-secret-test', variable: 'YT_SECRET_TEST'),
          string(credentialsId: 'yt-hub-secret-prod', variable: 'YT_SECRET_PROD'),
          string(credentialsId: 'external-redis-url', variable: 'EXT_REDIS_URL'),
          string(credentialsId: 'gcp-project-id', variable: 'GCP_PROJECT_ID')
        ]) {
          dir('infra/gcp') {
            script {
              def map = [:]
              if (fileExists('../.gcp_images_digests')) {
                def lines = readFile('../.gcp_images_digests').trim().split('\n')
                for (line in lines) { def parts = line.trim().split('='); map[parts[0]] = parts[1] }
              }
              writeFile file: 'dynamic.auto.tfvars.json', text: groovy.json.JsonOutput.prettyPrint(groovy.json.JsonOutput.toJson([
                webhook_image: map['webhook'],
                ingest_image : map['ingest'],
                analyze_image: map['analyze'],
                clipper_image: map['clipper'],
                project_id   : GCP_PROJECT_ID,
                region       : GCP_REGION,
                yt_hub_secret: (env.DEPLOY_ENV == 'prod' ? YT_SECRET_PROD : YT_SECRET_TEST),
                redis_url    : EXT_REDIS_URL
              ]))
            }
            sh '''#!/usr/bin/env bash
            set -euo pipefail
            export PATH="$WORKSPACE/bin/google-cloud-sdk/bin:$PATH"
            terraform init -upgrade
            terraform workspace select ${DEPLOY_ENV} || terraform workspace new ${DEPLOY_ENV}
            terraform apply -auto-approve
            '''
          }
        }
      }
    }

    stage('Build & Push Images') {
      steps {
        script {
          def services = ['webhook','ingest','analyze','clipper','publish']
          def accountId = readFile('.account_id').trim()
          def registry = "${accountId}.dkr.ecr.${env.AWS_REGION}.amazonaws.com"
          // Build & push to ECR (AWS) with immutable tags, capture digests
          def imagesByDigest = [:]
          for (svc in services) {
            def repo = "ezclip-${svc}"
            def imageBase = "${registry}/${repo}"
            def tagSha = "${env.DEPLOY_ENV}-${env.SHORT_SHA}"
            def dockerfile = "services/${svc}/Dockerfile"
            sh "docker build -t ${imageBase}:${tagSha} -f ${dockerfile} ."
            sh "docker push ${imageBase}:${tagSha}"
            def digest = sh(returnStdout: true, script: "aws ecr describe-images --repository-name ${repo} --image-ids imageTag=${tagSha} --query 'imageDetails[0].imageDigest' --output text").trim()
            imagesByDigest[svc] = "${imageBase}@${digest}"
          }

          // Dynamic tfvars for AWS (use digests)
          writeFile file: 'infra/terraform/dynamic.auto.tfvars.json', text: groovy.json.JsonOutput.prettyPrint(groovy.json.JsonOutput.toJson([
            images: imagesByDigest
          ]))

          // Push selected images to GCP Artifact Registry for Cloud Run & Jobs
          withCredentials([string(credentialsId: 'gcp-project-id', variable: 'GCP_PROJECT_ID')]) {
            sh '''#!/usr/bin/env bash
            set -euo pipefail
            export PATH="$WORKSPACE/bin/google-cloud-sdk/bin:$PATH"
            gcloud auth configure-docker ${GCP_REGION}-docker.pkg.dev -q
            : > .gcp_images_digests
            for svc in webhook ingest analyze clipper; do
              SRC_IMG="${imagesByDigest[svc]}"
              SHA_TAG="${DEPLOY_ENV}-${SHORT_SHA}"
              TARGET="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${GCP_ARTIFACT_REPO}/ezclip-${svc}:${SHA_TAG}"
              docker pull "$SRC_IMG"
              docker tag "$SRC_IMG" "$TARGET"
              docker push "$TARGET"
              DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' "$TARGET")
              echo "$svc=$DIGEST" >> .gcp_images_digests
            done
            '''
          }
        }
      }
    }

    stage('Terraform Apply') {
      steps {
        withCredentials([
          string(credentialsId: 'yt-hub-secret-test', variable: 'YT_SECRET_TEST'),
          string(credentialsId: 'yt-hub-secret-prod', variable: 'YT_SECRET_PROD'),
          string(credentialsId: 'external-redis-url', variable: 'EXT_REDIS_URL')
        ]) {
          dir('infra/terraform') {
            sh '''#!/usr/bin/env bash
            set -euo pipefail
            export PATH="$WORKSPACE/bin:$PATH"
            SECRET_VAR=${DEPLOY_ENV}
            if [ "${DEPLOY_ENV}" = "prod" ]; then
              YT_SECRET="$YT_SECRET_PROD"
            else
              YT_SECRET="$YT_SECRET_TEST"
            fi
            terraform init -upgrade
            terraform workspace select ${DEPLOY_ENV} || terraform workspace new ${DEPLOY_ENV}
            terraform apply -auto-approve \
              -var-file=environments/${DEPLOY_ENV}.tfvars \
              -var environment=${DEPLOY_ENV} \
              -var yt_hub_secret="$YT_SECRET" \
              -var external_redis_url="$EXT_REDIS_URL"
            '''
          }
        }
      }
    }

    stage('Deploy Cloud Run (GCP)') {
      steps {
        withCredentials([
          file(credentialsId: 'gcp-sa-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS'),
          string(credentialsId: 'gcp-project-id', variable: 'GCP_PROJECT_ID')
        ]) {
          sh '''#!/usr/bin/env bash
          set -euo pipefail
          export PATH="$WORKSPACE/bin/google-cloud-sdk/bin:$PATH"
          gcloud auth activate-service-account --key-file "$GOOGLE_APPLICATION_CREDENTIALS"
          gcloud config set project "$GCP_PROJECT_ID"
          gcloud config set run/region "$GCP_REGION"
          IMG=$(grep '^webhook=' .gcp_images_digests | cut -d= -f2)
          gcloud run deploy ezclip-webhook --image "$IMG" --region "$GCP_REGION" --allow-unauthenticated
          gcloud run services describe ezclip-webhook --region "$GCP_REGION" --format 'value(status.url)' > .cloud_run_url
          echo "Cloud Run URL: $(cat .cloud_run_url)"
          '''
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'infra/terraform/plan*', allowEmptyArchive: true
    }
  }
}
