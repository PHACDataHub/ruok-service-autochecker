
import { request, gql, GraphQLClient } from 'graphql-request'
export async function formatPayloadForDatabase(payload) {
    pass
}


export function replaceNonJetstreamCompatibleCharacters(projectName){
    // Jeststream subjects must only contain A-Z, a-z, 0-9, `-`, `_`, `/`, `=` or `.` and cannot start with `.`
// This replaces these characters with '_' (for now)
// Need to use something like this as want to use filename as part of the subject
    const lowerProjectName = projectName.toLowerCase();
    return lowerProjectName.replace(/[^a-z-\d_/=.]/gi, "_").replace(' ', '_');
}

// export async function insertIntoDatabase(payload, collectionName, db ) {
//     try {
//         const collection = db.collection(collectionName);
//         const _key = replaceNonJetstreamCompatibleCharacters(payload.projectName)
//         console.log(_key)
//         // const result = collection.save(payload)
//         console.log('Document saved with key:', result._key);
//         return result._key; // Return the inserted document's key
//     } catch (err) {
//         console.error('Failed to save document:', err.message);
//         throw err; // Rethrow the error for handling elsewhere if needed
//     }

// }

export async function upsertIntoDatabase(project, graphQLClient) {
    const  { projectName, sourceCodeRepository, containerRegistries, serviceEndpointUrls, domains } = project;
    const serviceName = replaceNonJetstreamCompatibleCharacters(projectName)
  
    const mutation = gql`
    mutation UpsertService($projectName: String!, $sourceCodeRepository: String, $_key: String, $containerRegistries: String, $serviceEndpointUrls: String, $domains: [String]) {
      upsertService(
        _key: $_key
        projectName: $projectName,
        sourceCodeRepository: $sourceCodeRepository,
        containerRegistries: $containerRegistries,
        serviceEndpointUrls: $serviceEndpointUrls,
        domains: $domains
      )
    }`;
    const variables = {
      projectName: projectName,
      sourceCodeRepository: sourceCodeRepository,
      _key: serviceName, 
      containerRegistries: containerRegistries, 
      serviceEndpointUrls: serviceEndpointUrls,
      domains: domains
    };
                  
    try {
        const insertData = await graphQLClient.request(mutation, variables)
        console.log(insertData)
        return insertData
    } catch (err) {
        console.error('Failed to save document:', err.message);
  //         throw err; // Rethrow the error for handling elsewhere if needed
    }
  }
  