# Following this tutorial  https://medium.com/google-cloud/centrally-managing-artifact-registry-container-image-vulnerabilities-on-google-cloud-part-one-d86fb4791601
# for this we're using LilaKelland projectfor the source, and Observatory for  project_id_observatory

# NEED TO AUTHENTICATE FIRST

# ENV variables - from command line 
# PROJECT_ID_SOURCE is where artifact registry vulnerabilitys are fed from
export PROJECT_ID_SOURCE=phx-01h41bw3b0xsf9rmpzmxbee2s9  
export PROJECT_ID_SOURCE_2=phx-01h41bw3b0xsf9rmpzmxbee2s9
export PROJECT_ID_OBSERVATORY=phx-01he5zk45pe
export SERVICE_ACCOUNT_SOURCE=containerVuln
export BUCKET_NAME=vuln-reports
export REGION=northamerica-northeast1
export SOURCE_REPO_NAME=test-repo

# TODO 
export PATH_TO_CLOUD_FUNCTION=

# ENV variables - from script
# PROJECT_ID_SOURCE=phx-01h41bw3b0xsf9rmpzmxbee2s9
# PROJECT_ID_SOURCE_2=phx-01h41bw3b0xsf9rmpzmxbee2s9
# PROJECT_ID_OBSERVATORY=phx-01he5zk45pe
# SERVICE_ACCOUNT_SOURCE=containerVuln
# BUCKET_NAME=VulnReports
# REGION=northamerica-northeast1
# SOURCE_REPO_NAME=test_repo

# export SOURCE_REPO_NAME=northamerica-northeast1-docker.pkg.dev/phx-01h1yptgmche7jcy01wzzpw2rf/hello-world-app2/hello-world-three
# northamerica-northeast1-docker.pkg.dev/phx-01h1yptgmche7jcy01wzzpw2rf/hello-world-app2/hello-world-three

# Auth login (TODO set up service account with access )
# gcloud config set account `ACCOUNT` 

# Enable services 
gcloud config set project $PROJECT_ID_SOURCE
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerscanning.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable eventarc.googleapis.com
gcloud services enable monitoring 
gcloud services list --project=$PROJECT_ID_OBSERVATORY

# monitoring - enables logs for troubleshooting 

# Create service account for Cloud Function
gcloud iam service-accounts create $SERVICE_ACCOUNT_SOURCE \
--description="Service Account to create process image scan vulnerabilities" \
--display-name="Image Vulnerability Processor"

# Add permissions (Container Analysis Viewer)
gcloud projects add-iam-policy-binding $PROJECT_ID_SOURCE \
 --member=serviceAccount:$SERVICE_ACCOUNT_SOURCE@$PROJECT_ID_SOURCE.iam.gserviceaccount.com \
 --role=roles/containeranalysis.occurrences.viewer
 
# Create bucket (observatory)
gsutil mb -l $REGION -p $PROJECT_ID_OBSERVATORY gs://$BUCKET_NAME

# Add permissions (GCS Object Createor)
gsutil iam ch serviceAccount:$SERVICE_ACCOUNT_SOURCE@$PROJECT_ID_SOURCE.iam.gserviceaccount.com:objectCreator gs://$BUCKET_NAME
gsutil iam ch serviceAccount:176013304796-compute@developer.gserviceaccount.com:objectCreator gs://$BUCKET_NAME

# UH OH - it works now and not sure if this is needed
# gcloud projects add-iam-policy-binding $PROJECT_ID_OBSERVATORY \
#   --member=serviceAccount:$SERVICE_ACCOUNT_SOURCE@$PROJECT_ID_SOURCE.iam.gserviceaccount.com \
#   --role=roles/storage.objectCreator


# Create Artifact Registry (this should already exisit so not doing this step, but would need to change region)
gcloud artifacts repositories create $SOURCE_REPO_NAME \
 --location=$REGION \
 --repository-format=docker \
 --project=$PROJECT_ID_SOURCE

# Create Pub/Sub Topic (auto scanned when image pushed, and will set up to publish occurances to topic)
gcloud pubsub topics create container-analysis-occurrences-v1 \
    --project=$PROJECT_ID_SOURCE

# Create the cloud function (that's triggered by pub/sub topic to write to bucket) (main.py)
# https://cloud.google.com/functions/docs/create-deploy-gcloud#functions-clone-sample-repository-python
# https://cloud.google.com/functions/docs/deploy
# https://cloud.google.com/functions/docs/configuring/env-var

# TODO = replace cloud function with path to cloud function
gcloud functions deploy image-vuln-cf-trigger \
    --gen2 \
    --runtime=python38 \
    --region=$REGION \
    --source=cloud-function \
    --entry-point=image_vuln_pubsub_handler \
    --trigger-topic=container-analysis-occurrences-v1 \
    --set-env-vars BUCKET_NAME=$BUCKET_NAME \
    --allow-unauthenticated 

    
    # --allow-unauthenticated for testing, remove once working and authenticate
    
# REDEPLOY (TODO - need docker - doing this in local terminal )
gcloud auth configure-docker $REGION-docker.pkg.dev
docker build --tag nginx .
docker tag nginx $REGION-docker.pkg.dev/$PROJECT_ID_SOURCE/$SOURCE_REPO_NAME/nginx-test:staging28
docker push $REGION-docker.pkg.dev/$PROJECT_ID_SOURCE/$SOURCE_REPO_NAME/nginx-test:staging28


# Part 2 https://medium.com/google-cloud/centrally-managing-artifact-registry-container-image-vulnerabilities-on-google-cloud-part-two-ad730e7cf649
# (this directs to )
gcloud config set project PROJECT_ID_SOURCE
gcloud services enable securitycenter.googleapis.com

# https://cloud.google.com/artifact-analysis/docs/os-overview
