
import {  gql } from 'graphql-request'

export async function getGitHubRepositoryFromServicesCollection(serviceName, graphQLClient){
  const query = gql`
  query getSourceCodeRepositoryByServiceName($serviceName: String!){
    getSourceCodeRepositoryByServiceName(serviceName: $serviceName)
  }`
  const variables = {
    serviceName: serviceName,
  }
  try {
    const getRepo = await graphQLClient.request(query, variables)
    return getRepo.getSourceCodeRepositoryByServiceName
  } catch (err) {
      console.error('Failed to save document:', err.message);
  //         throw err; 
  }
}

export async function upsertGitHubScanIntoDatabase(serviceName, gitHubRepository, scanResults, graphQLClient) {
  // const gitHubRepository = `https://github.com/PHACDataHub/${repoName}`

  const mutation = gql`
  mutation upsertGitHubScan($_key: String!, $gitHubRepository: String!, $scanResults: JSON) {
    upsertGitHubScan(_key: $_key
      gitHubRepository: $gitHubRepository,
      scanResults: $scanResults, 
    )
  }`;
  const variables = {
    _key: serviceName,
    gitHubRepository: gitHubRepository,
    scanResults: scanResults, 
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
