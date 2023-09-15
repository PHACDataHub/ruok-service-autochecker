// Temporary solution - placeholder to get projects to start scan. Will be pulled from 
// dns repo, and stored in arrangoDB in the future

import * as fs from 'fs';
import * as path from 'path';

export function tempGetProjects() {
  const filePath = "../service-discovery/known-service-list.json";
  // const filePath = path.join(__dirname, '../service-discovery/known-service-list.json');

  try {
    const jsonContents = fs.readFileSync(filePath, 'utf8');
    const projects = JSON.parse(jsonContents);
    console.log(projects)
    return projects;
  } catch (error) {
    console.error('Error reading or parsing JSON file:', error);
    return null;
  }
}
// const projects = tempGetProjects()

export function extractRepoScanInfo(projects) {
  const payload = {}
  for (const project of projects) {
    payload.projectName = project.projectName
    if (project.sourceCodeRepository && project.sourceCodeRepository.startsWith('https://github.com/PHACDataHub/')) {
      payload.gitHubRepo = project.sourceCodeRepository.split('/').pop();
    }
    console.log(payload)
    // add to queue group
  }
  
  return (payload)
}









