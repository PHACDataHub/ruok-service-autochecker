import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const patterns = {
  database:
    /(?:mongodb|postgresql|mysql|arangodb|couchdb|redis|mariadb):\/\/[^\s"'<>]+/gi,
  cloudStorage: /(?:s3:\/\/|gs:\/\/|azure:\/\/)[^\s"'<>]+/gi,
  docker:
    /(?:FROM\s+)((?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?::[0-9]+)?\/)?[a-z0-9]+(?:[._-][a-z0-9]+)*(?:\/[a-z0-9]+(?:[._-][a-z0-9]+)*)*(?::[.\w-]+)?(?:@sha256:[a-fA-F0-9]{64})?)/g,
  messageBroker: /(?:kafka:\/\/|amqp:\/\/|mqtt:\/\/|pulsar:\/\/)[^\s"'<>]+/gi,
  emailService: /(?:smtp:\/\/|smtps:\/\/|imap:\/\/|pop3:\/\/)[^\s"'<>]+/gi,
  gitRepository:
    /(?:git@|https?:\/\/)([^\s"'<>]+)(?:\/|:)([^\s"'<>]+)\/([^\s"'<>]+)(\.git)/gi,
  endpoint: /(https?:\/\/[^\s"'<>]+(\.[a-z]{2,})?(:\d+)?[^\s"'<>]*)/gi,
};

const urls = new Set();

function searchFileForPatterns(fileContent, isDockerfile = false) {
  const results = [];

  if (isDockerfile) {
    const dockerMatches = [...fileContent.matchAll(patterns.docker)];
    dockerMatches.forEach((match) => {
      const url = match[1];

      if (!urls.has(`docker ${url}`)) {
        urls.add(`docker ${url}`);
        results.push({ kind: 'docker', url });
      }
    });
  } else {
    for (const [kind, regex] of Object.entries(patterns)) {
      if (kind !== 'docker') {
        const matches = [...fileContent.matchAll(regex)];
        matches.forEach((match) => {
          const url = match[0];
          if (!urls.has(`${kind} ${url}`)) {
            urls.add(`${kind} ${url}`);
            results.push({ kind, url });
          }
        });
      }
    }
  }

  return results;
}

async function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const isDocker = fileName.toLowerCase().includes('dockerfile');
    return searchFileForPatterns(content, isDocker);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

async function findPatternsInRepo(repoPath) {
  const filePaths = glob.sync(path.join(repoPath, '**/*'), {
    nocase: true,
    dot: true,
    ignore: [
      '**/node_modules/**',
      '**/*.lock',
      '**/package-lock.json',
      '**/yarn.lock',
      '**/renovate.json5',
      '**/cloudbuild.yaml',
      '**/README.md',
      '**/*.yaml',
      '**/*.yml',
      '**/*.svg',
      '**/*.ico',
      '**/.git/**',
    ],
  });
  console.log(filePaths);
  await fs.writeFileSync('test', JSON.stringify(filePaths, null, 2));
  const allResults = [];

  for (const filePath of filePaths) {
    // Ignore directories
    if (fs.statSync(filePath).isDirectory()) {
      continue;
    }
    const fileResults = await processFile(filePath);
    allResults.push(...fileResults);
  }

  return allResults;
}

export class ScanEndpoints extends CheckOnClonedRepoInterface {
  constructor(repoName, clonedRepoPath) {
    super(repoName, clonedRepoPath);
    this.repoName = repoName;
    this.clonedRepoPath = clonedRepoPath;
  }

  async doRepoCheck() {
    try {
      const patternResults = await findPatternsInRepo(this.clonedRepoPath);

      if (patternResults.length === 0) {
        return [];
      }

      return patternResults;
    } catch (error) {
      console.error(`Error during pattern scan:`, error.message);
      return [];
    }
  }
}
