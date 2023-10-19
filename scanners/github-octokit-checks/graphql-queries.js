// https://www.npmjs.com/package/@octokit/graphql
// https://docs.github.com/en/graphql/reference/interfaces#node
// introspection https://docs.github.com/en/graphql/guides/introduction-to-graphql#discovering-the-graphql-api

// https://github.com/github/platform-samples/tree/master/graphql/queries


// https://docs.github.com/en/graphql/reference/interfaces#repositoryinfo

// {
//     repository(owner: "PHACDataHub", name: "ruok-service-autochecker") {
//      issues(last: 3) {
//             edges {
//               node {
//                 title
//               }
//             }
//           }
//         }
//       }

https://docs.github.com/en/graphql/reference/interfaces#repositoryinfo

import 'dotenv-safe/config.js'

const { NATS_URL, GITHUB_TOKEN } = process.env;
import { graphql } from '@octokit/graphql';

const token = 'GITHUB_TOKEN'; // Replace with your GitHub Personal Access Token
const owner = 'PHACDataHub'; // Replace with the repository owner's username
const repo = 'ruok-service-autochecker'; // Replace with the repository name
const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: GITHUB_TOKEN,
  },
});

// follow collin's code - use octokit.query
const query = `
query GetRepositoryInfo($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    name
    description
    isArchived
    isPrivate
    licenseInfo{name}
    codeowners{__typename}
    pushedAt
    updatedAt
    visibility
    resourcePath
    defaultBranchRef {
      name
      # target {
      #   ... on Commit {
      #     history {
      #       totalCount
      #     }
      #   }
      # }
    }
    # stargazers {
    #   totalCount
    # }
    # watchers {
    #   totalCount
    # }
    # forks {
    #   totalCount
    # }
    # issues {
    #   totalCount
    # }
  }
}
`
const { repository } = await graphqlWithAuth(`
  {
    repository(owner: "PHACDataHub", name: "ruok-service-autochecker") {
      issues(last: 3) {
        edges {
          node {
            title
          }
        }
      }
    }
  }
`);


// const query = `
//   query GetRepositoryInfo($owner: String!, $repo: String!) {
//     repository(owner: $owner, name: $repo) {
//       name
//       description
//       isArchived
//       isPrivate
//       defaultBranchRef {
//         name
//         target {
//           ... on Commit {
//             history {
//               totalCount
//             }
//           }
//         }
//       }
//       stargazers {
//         totalCount
//       }
//       watchers {
//         totalCount
//       }
//       forks {
//         totalCount
//       }
//       issues {
//         totalCount
//       }
//     }
//   }
// `;

// const result = await graphqlWithAuth(query, {
//   owner,
//   repo,
// }, {
//   headers: {
//     authorization: `token ${token}`,
//   },
// });

// console.log('Repository Information:', result.repository);