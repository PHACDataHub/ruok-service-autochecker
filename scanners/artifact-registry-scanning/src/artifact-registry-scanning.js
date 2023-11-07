/**
 // from https://cloud.google.com/artifact-analysis/docs/os-scanning-automatically#artifact-analysis-discovery-nodejs

* TODO(developer): Uncomment these variables before running the sample
 */


//  in shell
// gcloud config set project PROJECT_ID

const projectId = 'phx-01h1yptgmche7jcy01wzzpw2rf'// Your GCP Project ID
// If you are using Google Container Registry
// const imageUrl = 'https://gcr.io/my-project/my-repo/my-image@sha256:123' // Image to attach metadata to
// If you are using Google Artifact Registry

const imageUrl = 'https://northamerica-northeast1-docker.pkg.dev/phx-01h1yptgmche7jcy01wzzpw2rf/hello-world-app2/hello-world-three@d02289a4d62f' // Image to attach metadata to

// Import the library and create a client
// const {ContainerAnalysisClient} = require('@google-cloud/containeranalysis');
import { ContainerAnalysisClient } from '@google-cloud/containeranalysis';

const client = new ContainerAnalysisClient();

const formattedParent = client.getGrafeasClient().projectPath(projectId);

// Retrieves all the Occurrences associated with a specified image
const [occurrences] = await client.getGrafeasClient().listOccurrences({
  parent: formattedParent,
  filter: `resourceUrl = "${imageUrl}"`,
});

if (occurrences.length) {
  console.log(`Occurrences for ${imageUrl}`);
  occurrences.forEach(occurrence => {
    console.log(`${occurrence.name}:`);
  });
} else {
  console.log('No occurrences found.');
}