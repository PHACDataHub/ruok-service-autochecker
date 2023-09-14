// extract-project-metadata-from-dns-repo
import * as fs from 'fs';
import * as yaml from 'js-yaml'; 
import * as path from 'path';
import { fileURLToPath } from 'url'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function extractAnnotationsFromDnsRecords(clonedRepoPath='./temp-cloned-repo/dns/dns-records') {
    //TODO pull out domains as well! 
    // clonedRepoPath = 'temp-cloned-repo/dns/dns-records'
    // const dir = path.join(__dirname, 'temp-cloned-repo', 'dns', 'dns-records');
    const dir = path.join(__dirname, clonedRepoPath);
    // const dir = clonedRepoPath
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

                    results.push({
                        projectName,
                        sourceCodeRepository,
                        serviceEndpointUrls,
                        containerRegistries,
                        apmId
                    });
                }
            }
        } catch (error) {
            console.error("Error reading or parsing YAML file:", error);
        }
    }
    return results;
}

// const dnsRecordsAnnotations = await extractAnnotationsFromDnsRecords();
// console.log(dnsRecordsAnnotations)


export async function consolidateProjectAnnotations(results) {
    // consolidates project and github results, removes undefined results
    const uniqueResults = {};
    
    for (const result of results) {
        const { projectName, sourceCodeRepository, ...rest } = result;

        if (projectName !== undefined && sourceCodeRepository !== undefined) {
            const key = `${projectName}:${sourceCodeRepository}`;

            const newResult = {
                projectName,
                sourceCodeRepository,
            };

            // Include non-undefined fields from the rest of the object
            for (const field in rest) {
                if (rest[field] !== undefined) {
                    newResult[field] = rest[field];
                }
            }
            // Add only new keys
            if (!uniqueResults[key]) {
                uniqueResults[key] = newResult;
            } else {
                // Merge additional fields if the key already exists
                uniqueResults[key] = {
                    ...uniqueResults[key],
                    ...newResult,
                };
            }
        }
    }
return Object.values(uniqueResults);
}


// const projects = extractUniqueAnnotations(dnsRecordsAnnotations)
// console.log(projects)





