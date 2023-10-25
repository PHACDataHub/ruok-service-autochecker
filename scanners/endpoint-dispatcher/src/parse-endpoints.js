// endpoints-dispatcher/src/parse-endpoints.js
export async function getPhacDataHubGitHubRepo(payloadFromServiceDiscovery){
    if (
        payloadFromServiceDiscovery.sourceCodeRepository && 
        payloadFromServiceDiscovery.sourceCodeRepository.startsWith('https://github.com/PHACDataHub/')
        ) {
        return {
            // serviceName: payloadFromServiceDiscovery.serviceName, 
            sourceCodeRepository: payloadFromServiceDiscovery.sourceCodeRepository}
    } else {
        return false
    }
}

// export async function parseContainerRegistryUrls(payloadFromServiceDiscovery) {
//     const registryUrls = payloadFromServiceDiscovery.containerRegistries.split(',').map((url) => url.trim());
//     console.log(registryUrls)
//     return (containerUrls)
// }
export async function getArtifactContainerRegistries(payloadFromServiceDiscovery) {
    if (payloadFromServiceDiscovery.containerRegistries) {
        const registryString = payloadFromServiceDiscovery.containerRegistries;
        const registryArray = registryString.split(',').map((registry) => registry.trim());

        const filteredRegistries = registryArray.filter((registry) =>
            registry.startsWith('northamerica-northeast1-docker.pkg.dev/')
        );

        if (filteredRegistries.length > 0) {
            return filteredRegistries
        }
    }
    return false;
}


export async function getDockerHub(payloadFromServiceDiscovery){
    // pass
}

export async function getDomains(payloadFromServiceDiscovery){
    // pass
}

export async function getServiceUrls(payloadFromServiceDiscovery){
    if (payloadFromServiceDiscovery.serviceEndpointUrls) {
        const urlsString = payloadFromServiceDiscovery.serviceEndpointUrls;
        return urlsString.split(',').map((url) => url.trim());
    }
    return false;
}


// projectName: 'Hello Django',
// sourceCodeRepository: 'https://github.com/PHACDataHub/cloudrun-deployment-example',
// serviceEndpointUrls: 'https://hello-world-from-cloud-build-trigger-vlfae7w5dq-nn.a.run.app',
// containerRegistries: 'northamerica-northeast1-docker.pkg.dev/phx-01h1yptgmche7jcy01wzzpw2rf/hello-world-app'