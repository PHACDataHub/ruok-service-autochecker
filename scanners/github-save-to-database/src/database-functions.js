
// import { gql} from 'graphql-request'

// export async function upsertIntoDatabase(serviceName, payload, graphQLClient) {
//     const mutation = gql`
//     mutation UpsertService($projectName: String!, $sourceCodeRepository: String, $_key: String, $containerRegistries: String, $serviceEndpointUrls: String) {
//         upsertService(payload: {
//             _key: $_key
//             projectName: $projectName,
//             sourceCodeRepository: $sourceCodeRepository,
//             containerRegistries: $containerRegistries,
//             serviceEndpointUrls: $serviceEndpointUrls
//         })
//     }`;

//     const variables = {
//         projectName: projectName,
//         sourceCodeRepository: sourceCodeRepository,
//         _key: serviceName, 
//         containerRegistries: containerRegistries, 
//         serviceEndpointUrls: serviceEndpointUrls
//     };       
    
//     try {
//         const data = await graphQLClient.request(mutation, variables)
//         console.log(data)
//         return data
//     } catch (err) {
//         console.error('Failed to save document:', err.message);
//   //         throw err; 
//     }
// }



import {  gql } from 'graphql-request'


export async function upsertGitHubScanIntoDatabase(serviceName, repoName, scanResults, graphQLClient) {
//   TODO update this to extract checks out of 'data' once check set complete - update schema
    
    const gitHubRepository = `https://github.com/PHACDataHub/${repoName}`
    // This is from the schema
    // _key: ${gitHubRepository},
    // serviceName: ${serviceName},
    // scanResults: ${scanResults},
    // const { gitHubRepository, serviceName, scanResults } = args;

    // This is the function call in index.js
    // await upsertGitHubScanIntoDatabase('serviceName', 'repoName', {'five': 5}, graphQLClient)

    const mutation = gql`
    mutation UpsertGitHubScan($_key: String!, $serviceName: String!, $scanResults: JSON) {
      upsertGitHubScan(
        _key: $gitHubRepository,
        serviceName: $serviceName,
        scanResults: $scanResults
      )
    }`;
    const variables = {
        _key: gitHubRepository,
        serviceName: serviceName, // forign key to services collection - //TODO make sourceCodeRepository array rather than string in services collection
        scanResults: scanResults // JSON for now - will split out when more complete
    };
                  
    try {
        const insertData = await graphQLClient.request(mutation, variables)
        console.log(insertData)
        return insertData
    } catch (err) {
        console.error('Failed to save GitHub Scan document:', err.message);
  //         throw err; // Rethrow the error for handling elsewhere if needed
    }
}

