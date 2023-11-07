Container Scanning 

To pull from artifact registry, need Artifact Registry Reader (roles/artifactregistry.reader)
https://cloud.google.com/artifact-registry/docs/docker/pushing-and-pulling


Cloud Build scanning: 
https://cloud.google.com/artifact-analysis/docs/ods-cloudbuild

https://medium.com/ascentic-technology/secure-container-images-with-trivy-1ef12b5b9b4d


https://cloud.google.com/artifact-analysis/docs/os-scanning-automatically



Authenticating users GCP
https://cloud.google.com/nodejs/getting-started/authenticate-users
https://cloud.google.com/nodejs/docs/reference/google-auth-library/latest

Scan private containers (givebe permissions)
trivy cloudlifeacr.azurecr.io/myhealth.web:latest

INSTALL [gcloud](https://cloud.google.com/sdk/docs/install)
```
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates gnupg curl sudo
```

<!-- git ops


install: (https://aquasecurity.github.io/trivy/v0.18.3/installation/)
```
wget https://github.com/aquasecurity/trivy/releases/download/v0.18.3/trivy_0.18.3_Linux-64bit.deb
sudo dpkg -i trivy_0.18.3_Linux-64bit.deb
``` -->
https://cloud.google.com/artifact-analysis/docs/quickstart-scanning-os-manually
https://cloud.google.com/artifact-analysis/docs/quickstart-scanning-nodejs-automatically -ensure vunerability scanning in place in artifact registry - determine what's actually scanned

gcloud services enable containerscanning.googleapis.com  artifactregistry.googleapis.com

This is a good explaination
https://www.bluetab.net/en/container-vulnerability-scanning-with-trivy/
```
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/master/contrib/install.sh | sudo sh -s -- -b /usr/local/bin 
```
download artifact credential [utility helper](https://cloud.google.com/artifact-registry/docs/docker/authentication#standalone-helper) - if no gcloud, but ended up installing gcloud in the end.
```
curl -fsSL "https://github.com/GoogleCloudPlatform/docker-credential-gcr/releases/download/v${VERSION}/docker-credential-gcr_${OS}_${ARCH}-${VERSION}.tar.gz" \
| tar xz docker-credential-gcr \
&& chmod +x docker-credential-gcr && sudo mv docker-credential-gcr /usr/bin/
```
add to docker container registry
```
docker-credential-gcr configure-docker --registries=northamerica-northeast1-docker.pkg.dev```
docker-credential-gcr configure-docker --registries=northamerica-northeast2-docker.pkg.dev

Docker scout https://docs.docker.com/scout/

project id phx-01h1yptgmche7jcy01wzzpw2rf

using docker 

pull image 
```
docker pull aquasec/trivy
```
scan image
```
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image python:3.4-alpine
```
for file system 
```
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy fs .
```
run in server mode?

INSTALL gcloud cli----------------------------------------------------

https://cloud.google.com/sdk/docs/install
```
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates gnupg curl sudo
echo "deb [signed-by=/usr/share/keyrings/cloud.google.asc] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo tee /usr/share/keyrings/cloud.google.asc
sudo apt-get update && sudo apt-get install google-cloud-cli
```

(note in docker single run step)
```
RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] http://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg  add - && apt-get update -y && apt-get install google-cloud-cli -y
```
-----------------------------------------


https://medium.com/google-cloud/centrally-managing-artifact-registry-container-image-vulnerabilities-on-google-cloud-part-two-ad730e7cf649

```
gcloud auth login (will need to do this programatically - see above)
gcloud config set project 'phx-01h1yptgmche7jcy01wzzpw2rf'
gcloud services enable securitycenter.googleapis.com
gcloud services enable containerscanning.googleapis.com
gcloud services enable containeranalysis.googleapis.com 
```

```

gcloud iam service-accounts create scan-vuln \
--description="Service Account to create process image scan vulnerabilities" \
--display-name="Image Vulnerability Processor"
```
export project-id-source=phx-01h1yptgmche7jcy01wzzpw2rf
service-account-source=scan-vuln
```
gcloud projects add-iam-policy-binding phx-01h1yptgmche7jcy01wzzpw2rf --member=serviceAccount:scan-vuln@phx-01h1yptgmche7jcy01wzzpw2rf.iam.gserviceaccount.com \
--role=roles/containeranalysis.occurrences.viewer \
<!-- --role=roles/containeranalysis.occurrences.list -->
```
gcloud projects add-iam-policy-binding phx-01h1yptgmche7jcy01wzzpw2rf  --member=serviceAccount:scan-vuln@phx-01h1yptgmche7jcy01wzzpw2rf.iam.gserviceaccount.com --role=roles/containeranalysis.occurrences.list


<!-- gsutil iam ch serviceAccount:scan-vuln@phx-01h1yptgmche7jcy01wzzpw2rf.iam.gserviceaccount.com:objectCreator gs://<bucket-name>``` -->


https://cloud.google.com/artifact-analysis/docs/os-scanning-automatically
```
gcloud artifacts docker images list --show-occurrences \
northamerica-northeast1-docker.pkg.dev/phx-01h1yptgmche7jcy01wzzpw2rf/hello-world-app2/hello-world-three
```
most recent --show-occurrences-from=25

tag 
gcloud artifacts docker images describe \
LOCATION-docker.pkg.dev/PROJECT_ID/REPOSITORY/IMAGE_ID:TAG \
--show-package-vulnerability
```
gcloud artifacts docker images list --show-occurrences \
northamerica-northeast1-docker.pkg.dev/phx-01h1yptgmche7jcy01wzzpw2rf/hello-world-app2/hello-world-three --occurrence-filter=FILTER_EXPRESSION
```
FILTER_EXPRESSION https://cloud.google.com/artifact-analysis/docs/os-scanning-automatically#filtering
LOCATION-docker.pkg.dev/PROJECT_ID/REPOSITORY/IMAGE_ID


WITH API (https://cloud.google.com/artifact-analysis/docs/nodejs-scanning-automatically)
Occurrences:
```
 curl -X GET -H "Content-Type: application/json" -H \
    "Authorization: Bearer $(gcloud auth print-access-token)" \
    https://containeranalysis.googleapis.com/v1/projects/PROJECT_ID/occurrences
```

To get a summary of vulnerabilities in your project:


 curl -X GET -H "Content-Type: application/json" -H \
    "Authorization: Bearer $(gcloud auth print-access-token)" \
    https://containeranalysis.googleapis.com/v1/projects/PROJECT_ID/occurrences:vulnerabilitySummary
To get details on a specific occurrence:


 curl -X GET -H "Content-Type: application/json" -H \
    "Authorization: Bearer $(gcloud auth print-access-token)" \
    https://containeranalysis.googleapis.com/v1/projects/PROJECT_ID/occurrences/OCCURRENCE_ID


OR filter for KIND = VULNERABILITY

gcloud artifacts docker images list --show-occurrences \
northamerica-northeast1-docker.pkg.dev/phx-01h1yptgmche7jcy01wzzpw2rf/hello-world-app2/hello-world-three  --occurrence-filter=kind="VULNERABILITY"


gcloud artifacts docker images list --show-occurrences \
--occurrence-filter='kind="VULNERABILITY"' --format=json \
northamerica-northeast1-docker.pkg.dev/phx-01h1yptgmche7jcy01wzzpw2rf/hello-world-app2/hello-world-three  


----- Vulnerability summary for gcp project
curl -X GET -H "Content-Type: application/json" -H \
    "Authorization: Bearer $(gcloud auth print-access-token)" \
    https://containeranalysis.googleapis.com/v1/projects/phx-01h1yptgmche7jcy01wzzpw2rf/occurrences:vulnerabilitySummary


______________________________________________________________
trying this [tutorial](https://medium.com/google-cloud/centrally-managing-artifact-registry-container-image-vulnerabilities-on-google-cloud-part-one-d86fb4791601)

export SOURCE_PROJECT_ID=phx-01h1yptgmche7jcy01wzzpw2rf
export SHARED_PROJECT_ID=

----enable services
gcloud config set project phx-01h1yptgmche7jcy01wzzpw2rf
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerscanning.googleapis.com


----create bucket
gsutil mb -l us-central1 -p <project-id-shared> gs://<bucket-name>

-----create service account 

gcloud iam service-accounts create imageVulnProcessor \
--description="Service Account to create process image scan vulnerabilities" \
--display-name="Image Vulnerability Processor"

---- add permissions to read vulnerabilites 

gcloud projects add-iam-policy-binding phx-01h1yptgmche7jcy01wzzpw2rf --member=serviceAccount:imageVulnProcessor@phx-01h1yptgmche7jcy01wzzpw2rf.iam.gserviceaccount.com --role=roles/containeranalysis.occurrences.viewer
gsutil iam ch serviceAccount:imageVulnProcessor@phx-01h1yptgmche7jcy01wzzpw2rf.iam.gserviceaccount.com:objectCreator gs://containerVulnerabilities

--- create artifact registry (when pushed auto scanned with container scanning api)

gcloud artifacts repositories create <repo-name> --location=us-central1 --repository-format=docker --project=<project-id-source>

----create pub-sub container-analysis-occurances
gcloud pubsub topics create container-analysis-occurrences-v1 --project=phx-01h1yptgmche7jcy01wzzpw2rf 

--- create cloud function (https://cloud.google.com/functions/docs/create-deploy-http-python)
```
name: "projects/phx-01h41bw3b0xsf9rmpzmxbee2s9/occurrences/030e0ea0-bb58-474a-8aad-853fccaf3b59"
resource_uri: "https://northamerica-northeast1-docker.pkg.dev/phx-01h41bw3b0xsf9rmpzmxbee2s9/gcf-artifacts/image--vuln--cf--trigger@sha256:5812843cce5793adc1350c5865ef0946114bf98dc897312e9593da840bbc83b1"
note_name: "projects/goog-vulnz/notes/CVE-2020-21710"
kind: VULNERABILITY
create_time {
  seconds: 1699305325
  nanos: 363051000
}
update_time {
  seconds: 1699305325
  nanos: 363051000
}
vulnerability {
  severity: MEDIUM
  cvss_score: 5.5
  cvssv3 {
    base_score: 5.5
    exploitability_score: 1.8
    impact_score: 3.6
    attack_vector: ATTACK_VECTOR_LOCAL
    attack_complexity: ATTACK_COMPLEXITY_LOW
    privileges_required: PRIVILEGES_REQUIRED_NONE
    user_interaction: USER_INTERACTION_REQUIRED
    scope: SCOPE_UNCHANGED
    confidentiality_impact: IMPACT_NONE
    integrity_impact: IMPACT_NONE
    availability_impact: IMPACT_HIGH
  }
  package_issue {
    affected_cpe_uri: "cpe:/o:canonical:ubuntu_linux:18.04"
    affected_package: "ghostscript"
    affected_version {
      name: "9.26~dfsg+0"
      revision: "0ubuntu0.18.04.18"
      kind: NORMAL
      full_name: "9.26~dfsg+0-0ubuntu0.18.04.18"
    }
    fixed_cpe_uri: "cpe:/o:canonical:ubuntu_linux:18.04"
    fixed_package: "ghostscript"
    fixed_version {
      name: "9.26~dfsg+0"
      revision: "0ubuntu0.18.04.18+esm2"
      kind: NORMAL
      full_name: "9.26~dfsg+0-0ubuntu0.18.04.18+esm2"
    }
    fix_available: true
    package_type: "OS"
    effective_severity: MEDIUM
  }
  short_description: "CVE-2020-21710"
  long_description: "NIST vectors: CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:N/I:N/A:H"
  related_urls {
    url: "http://people.ubuntu.com/~ubuntu-security/cve/CVE-2020-21710"
    label: "More Info"
  }
  effective_severity: MEDIUM
  fix_available: true
  cvss_version: CVSS_VERSION_3
}
```