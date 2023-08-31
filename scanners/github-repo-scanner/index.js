// https://github.com/octokit/octokit.js/#octokitrest-endpoint-methods
// TODO - graphql octokit
// TODO - use env file, use nats, pull services and run functions for each 

import { Octokit, App,  RequestError } from "octokit";
import { tempGetProjects } from "./src/get-projects.js"
import { getRepoDetails, repoLanguages, getAllRepos, getGithubPagesDetails } from "./src/github-details-with-octokit.js";
import { cloneRepository } from "./src/clone-repo.js"
import { searchIgnoreFile, hasSecurityMd, hasApiDirectory, searchTests, hasDependabotYaml} from "./src/search-cloned-repo.js"
import * as fs from 'fs';
import dotenv from 'dotenv'
// import 'dotenv-safe/config.js'
dotenv.config()

const { 
  owner = 'PHACDataHub',
  token
  } = process.env;

// Authenicate with GitHub
const octokit = new Octokit({ 
    auth: token,
});

const projects = tempGetProjects();
// This is a temporary work around - get the project list from service-discovery/known-service-list.json
// TODO - pull list from from DB, or nats (from DNS repo)

async function processProjects() {
    // for (const project of projects) {
      const payload = {}

      const project = projects[6]; // temp work around so don't max out quota 
      const repo = project.gitHubRepository.split('/').pop();

    // From database or project json - pull out details for the scan:
      payload.project_name = project.projectName;
      payload.github_repository = project.gitHubRepository;

    // TODO get optional fields from dns/ known services with try except/ optional handling 

    // GitHub repo details with Octokit - TODO have this kickoff other scans, eg language specific requirements/ packages, api details
      const repoDetails = await getRepoDetails(owner, repo, octokit)
      const { clone_url, default_branch } = repoDetails;

      payload.repo_name =repoDetails.name;
      payload.description =repoDetails.description;
      payload.visibility = repoDetails.visibility;
      payload.updated_at = repoDetails.updated_at; //TODO - there's also pushed at, but think this is for push to main - time since updated - re followups, tech debt, security
      payload.pushed_at = repoDetails.pushed_at; // Days since active?
      payload.default_branch = repoDetails.default_branch; // TODO - use in branch protection checks...
      payload.has_license = Boolean(repoDetails.license); 
      payload.license_name = repoDetails.license ? repoDetails.license.name : undefined; // TODO can you have more than one LICENSE file?
      payload.has_github_pages = repoDetails.has_pages;
      payload.language = repoDetails.language; //TODO - if python - timeout re luc message cpho, react robot.txt...
    
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

    // Not sure if this is relevent, but the following with get all langauges from repo
      payload.languages_all = await repoLanguages(owner, repo, octokit) // might be interesting for some metrics
      
    // Clone repo to search contents
      const clonedRepoPath = `./temp-cloned-repo/${repoDetails.name}`;

      if (!fs.existsSync(clonedRepoPath)) { // check if repo already cloned into the temp-cloned-repo directory
        await cloneRepository(clone_url, repo); // wait for clone_url to be resolved from repoDetails function
      } else {
        console.log("Cloned repo directory already exists. Skipping....");
        //TODO - change to rm -rf and reclone or just pull, but shouldn't exist as removed in later step - unless error
      }

    // Scan repo for file(s) and file contents
      payload.gitignore_details = await searchIgnoreFile(clonedRepoPath, ".gitignore");
      payload.dockerignore_details = await searchIgnoreFile(clonedRepoPath, ".dockerignore");
      payload.has_security_md = await hasSecurityMd(clonedRepoPath); 
      payload.unit_test_details = await searchTests(clonedRepoPath); // TODO - this is just basic is the folder there - also search for langauge specific libraries, coverage...
      payload.has_api_directory = await hasApiDirectory(clonedRepoPath); // TODO - this is basic look for Api folder - determine type by libraries by langauge - hard to tell 
      payload.has_dependabot_yaml = await hasDependabotYaml(clonedRepoPath);
    // Remove cloned repo

      console.log(payload)
  };

processProjects().catch(error => {
  console.error('An error occurred:', error);
});

