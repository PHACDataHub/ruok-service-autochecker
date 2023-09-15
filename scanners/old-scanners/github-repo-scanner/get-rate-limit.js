// Have been hitting limit - see where at, and how much is used per go
// https://github.com/octokit/octokit.js/#octokitrest-endpoint-methods
// TODO - graphql octokit
// TODO - use env file, use nats, pull services and run functions for each 

import { Octokit, App,  RequestError } from "octokit";
// import { tempGetProjects } from "./src/get-projects.js"
// import { getRepoDetails, repoLanguages, getAllRepos, getGithubPagesDetails } from "./src/github-details-with-octokit.js";
// import { cloneRepository, removeClonedRepository} from "./src/clone-repo.js"
// import { searchIgnoreFile, hasSecurityMd, hasApiDirectory, searchTests, hasDependabotYaml} from "./src/search-cloned-repo.js"
// // import { getProjectPayload } from "./src/process-nats-messages.js"
// import { connect, JSONCodec, jwtAuthenticator } from 'nats'
// import { Database, aql } from "arangojs";

// import * as fs from 'fs';
import dotenv from 'dotenv'
// import 'dotenv-safe/config.js'
dotenv.config()

const { 
  owner = 'PHACDataHub',
  token,
  PORT = 3003,
  HOST = '0.0.0.0',
  DB_NAME = "dataServices",
  // DB_URL = "http://database:8529",
  DB_URL = "http://0.0.0.0:8529",
  DB_USER = "root",
  DB_PASS = 'yourpassword',
  // NATS_URL = "demo.nats.io:4222", // Uncomment this to use demo server
  NATS_URL = "nats://0.0.0.0:4222",
  NATS_SUB_STREAM = "projects.>",
  NATS_PUB_STREAM = "githubRepoScan" 
} = process.env;

// Authenicate with GitHub 
const octokit = new Octokit({ 
  auth: token,
});

export async function licenceDetails(octokit) {

  const response = await octokit.request('GET /rate_limit', {
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  console.log(JSON.stringify(response.data))
}

await licenceDetails(octokit)