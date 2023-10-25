// extract-project-metadata-from-dns-repo
import * as fs from 'fs';
import * as yaml from 'js-yaml'; 
import * as path from 'path';
import { fileURLToPath } from 'url'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function extractAnnotationsFromDnsRecords(clonedRepoPath='./temp-cloned-repo/dns/dns-records') {
    const dir = path.join(__dirname, clonedRepoPath);
    const files = fs.readdirSync(dir);
    const results = [];

    for (const file of files) {
        try {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            // Check if it's a file and not a directory
            if (stat.isFile()) {
                // Read yaml file
                const fileContents = fs.readFileSync(filePath, 'utf8');

                // Parse (some have --- eg. ops.alpha.canada.ca and this loads all of the yaml in file)
                const yamlDocuments = yaml.loadAll(fileContents);

                for (const yamlData of yamlDocuments) {
                    // Extract the projectName and sourceCodeRepository
                    const annotations = yamlData.metadata?.annotations;
                    const projectName = annotations?.projectName;
                    const sourceCodeRepository = annotations?.sourceCodeRepository;
                    const serviceEndpointUrls = annotations?.serviceEndpointUrls;
                    const containerRegistries = annotations?.containerRegistries;
                    const apmId = annotations?.apmId;
                    const domain = yamlData.spec?.name;

                    results.push({
                        projectName,
                        sourceCodeRepository,
                        serviceEndpointUrls,
                        containerRegistries,
                        apmId,
                        domain
                    });
    
                }
            }
        } catch (error) {
            console.error("Error reading or parsing YAML file:", error);
        }
    }
    return results;
}

export async function consolidateProjectAnnotations(results) {
    // Collect domains by project (one dnsRecord/ domain, one to many projects to domain)
    const domainsByProject = {};
    for (const result of results) {
        const { projectName, domain } = result;
        if (projectName !== undefined && domain !== undefined) {
            if (!domainsByProject[projectName]) {
                domainsByProject[projectName] = [domain];
            } else {
                domainsByProject[projectName].push(domain);
            }
        }
    }

    const consolidatedResults = [];
    for (const result of results) {
        // included domain here to be able to exclude it from rest later
        // projectName and sourceCodeRepository are the key 
        const { projectName, sourceCodeRepository, domain, ...rest } = result;

        if (projectName !== undefined && sourceCodeRepository !== undefined) {
            // using projectName:sourceCodeRepository as assuming this is unique *** does this assumption hold??
            // Also assuming these are both defined - TODO force manadatory fields for dns repo
            const key = `${projectName}:${sourceCodeRepository}`
            const newResult = {
                projectName,
                sourceCodeRepository,
            };

            // Include non-undefined fields
            for (const field in rest) {
                if (rest[field] !== undefined) {
                    newResult[field] = rest[field];
                }
            }
            // Add domains collected before for project
            if (domainsByProject[projectName]) {
                newResult.domains = domainsByProject[projectName];
            }

            // Add only new keys
            if (!consolidatedResults.find((item) => item.projectName === projectName)) {
                consolidatedResults.push(newResult);
            } else {
                // Merge additional fields if the key already exists
                const existingResult = consolidatedResults.find((item) => item.projectName === projectName);
                Object.assign(existingResult, newResult);
            }
        }
    }
    console.log(consolidatedResults)
    return consolidatedResults;
}



