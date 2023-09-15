// https://github.com/octokit/octokit.js/#octokitrest-endpoint-methods
// TODO - graphql octokit
// TODO - use env file, use nats, pull services and run functions for each 

import { Octokit, App,  RequestError } from "octokit";
import { tempGetProjects } from "./src/get-projects.js"
import { getRepoDetails, repoLanguages, getAllRepos, getGithubPagesDetails } from "./src/github-details-with-octokit.js";
import { cloneRepository, removeClonedRepository} from "./src/clone-repo.js"
import { searchIgnoreFile, hasSecurityMd, hasApiDirectory, searchTests, hasDependabotYaml} from "./src/search-cloned-repo.js"
// import { getProjectPayload } from "./src/process-nats-messages.js"
import { connect, JSONCodec, jwtAuthenticator } from 'nats'
import { Database, aql } from "arangojs";

import * as fs from 'fs';
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

// Database connection 
const db = new Database({
  url: DB_URL,
  databaseName: DB_NAME,
  auth: { username: DB_USER, password: DB_PASS },
});

// Authenicate with GitHub 
const octokit = new Octokit({ 
    auth: token,
});

// NATs connection 
const nc = await connect({ 
  servers: NATS_URL,
  // authenticator: jwtAuthenticator(jwt), // Comment this out to use demo server
})
const jc = JSONCodec(); // for encoding NAT's messages

const sub = nc.subscribe(NATS_SUB_STREAM)
console.log('🚀 Connected to NATS server, and listening on', sub.subject, "channel...");

// ----- Subscribe to message stream 

// const sub = await js.subscribe(stream, opts);
// const jc = JSONCodec(); // for encoding NAT's messages
// const sub = nc.subscribe(NATS_SUB_STREAM)
// console.log('🚀 Connected to NATS server... listening to', sub.subject);

async function publish(payload) {
  nc.publish(NATS_PUB_STREAM, jc.encode(payload)) 
}


// const projects = tempGetProjects();
// This is a temporary work around - get the project list from service-discovery/known-service-list.json
// TODO - pull list from from DB, or nats (from DNS repo)
// Projects from dns repo being published on 'gitHubReposToScan' channel

async function scanGitHubRepos(project) {
      const payload = {}

      // TODO: simplify by 
      // const payload = {
      //   project_name: project.projectName,
      // }
      // const project = projects[6]; // temp work around so don't max out quota 
      payload.project_name = project.projectName
      const repo = project.sourceCodeRepository.split('/').pop();
      
    // From database or project json - pull out details for the scan:
      payload.project_name = project.projectName;
      payload.github_repository = project.sourceCodeRepository;

    // GitHub repo details with Octokit - TODO have this kickoff other scans, eg language specific requirements/ packages, api details
      const repoDetails = await getRepoDetails(owner, repo, octokit)
      const { clone_url, default_branch } = repoDetails;

      payload.repo_name =repoDetails.name;
      payload.repo_description =repoDetails.description;
      payload.repo_visibility = repoDetails.visibility;
      payload.repo_last_updated_at = repoDetails.updated_at; //TODO - there's also pushed at, but think this is for push to main - time since updated - re followups, tech debt, security
      payload.repo_last_pushed_at = repoDetails.pushed_at; // Days since active?
      payload.repo_default_branch = repoDetails.default_branch; // TODO - use in branch protection checks...
      payload.has_license = Boolean(repoDetails.license); 
      payload.repo_license_name = repoDetails.license ? repoDetails.license.name : undefined; // TODO can you have more than one LICENSE file?
      payload.has_github_pages = repoDetails.has_pages;
      payload.main_programming_language = repoDetails.language; //TODO - if python - timeout re luc message cpho, react robot.txt...
      payload.programming_languages_all = await repoLanguages(owner, repo, octokit) // might be interesting for some metrics
      // payload.branch_protection = await branchProtectionDetails(owner, repo, octokit, default_branch) // This doesn't appear to work - dns repo is enabled, but coming back false

    // TODO add:
      //  vunerability scanning 
      //  dependabot 
      //  Is Secret scanning enabled for that repo?
      //  Are there tests? Is coverage enabled?
      //  existence of an API - more details 
      //  REST/graphql
      //  More from Open data products spec: https://opendataproducts.org/
      //  PHAC data standards - what are these and where do we find?
      //  Main branch protection?
      
    // Search Repo contents by cloning, then searching 
      const clonedRepoPath = `./temp-cloned-repo/${repoDetails.name}`;

    // check if repo already cloned into the 'temp-cloned-repo' directory
      if (!fs.existsSync(clonedRepoPath)) {
        await cloneRepository(clone_url, repo); 
      } else {
        console.log("Cloned repo directory already exists. Skipping....");
        await removeClonedRepository(clonedRepoPath)
        await cloneRepository(clone_url, repo);
      }

    // Scan repo for file(s) and file contents
      payload.gitignore_details = await searchIgnoreFile(clonedRepoPath, ".gitignore");
      payload.dockerignore_details = await searchIgnoreFile(clonedRepoPath, ".dockerignore");
      payload.has_security_md = await hasSecurityMd(clonedRepoPath); 
      payload.unit_test_details = await searchTests(clonedRepoPath); // TODO - this is just basic is the folder there - also search for langauge specific libraries, coverage...
      payload.has_api_directory = await hasApiDirectory(clonedRepoPath); // TODO - this is basic look for Api folder - determine type by libraries by langauge - hard to tell 
      payload.has_dependabot_yaml = await hasDependabotYaml(clonedRepoPath);
    
      await removeClonedRepository(clonedRepoPath) 

      payload.repo_scan_timestamp = new Date();

      return { payload }
  };


process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
;(async () => {
  // TODO listen on projects NATs channel (with extracted projectName, and PHACDataHub codeSourceRepository)
  // TODO modify scanGitHubRepos to use repo/ projectname 
 
  for await (const message of sub) {
    console.log("")
    console.log('**************************************************************')
    const projectPayloadFromDnsRepo  = await jc.decode(message.data)
    console.log(projectPayloadFromDnsRepo)
    
    if (projectPayloadFromDnsRepo.sourceCodeRepository && projectPayloadFromDnsRepo.sourceCodeRepository.startsWith('https://github.com/PHACDataHub/')) {
    // if PHAC DataHub Repository, scan repo
      try {
        const repoScanResult = await scanGitHubRepos(projectPayloadFromDnsRepo);
        console.log("Repo Details payload to publish", JSON.stringify(repoScanResult))
        
        await publish(repoScanResult);
        console.log("published payload!");

        } catch (error) {
          console.error('An error occurred searching the GitHub repo:', error);
        }
    }
  }

})();

await nc.closed();
