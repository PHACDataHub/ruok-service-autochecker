import { extractAnnotationsFromDnsRecords, consolidateProjectAnnotations } from '../extract-project-metadata-from-dns-repo'; 
import {expect} from '@jest/globals';
import * as path from 'path';
import { writeFile, mkdir, rm } from 'fs/promises';

describe('extractAnnotationsFromDnsRecords', () => {
    let tempDir

    beforeAll(async () => {
        const currentModuleDir = path.dirname(new URL(import.meta.url).pathname)

        // make temp dir
        tempDir = path.join(currentModuleDir, 'temp-cloned-repo', 'dns-records')
        await mkdir(tempDir, { recursive: true })
  
        const mockedDnsRecords = {
            'file1.yaml': '---\nmetadata:\n  annotations:\n    projectName: Project1\n    sourceCodeRepository: https://github.com/project1\n',
            'file2.yaml': '---\nmetadata:\n  annotations:\n    projectName: Project2\n    sourceCodeRepository: https://github.com/project2\n',
            // 'file2.yaml': '---\nmetadata:\n  annotations:\n    projectName: Project2\n    sourceCodeRepository: https://github.com/project2\n',
            // 'file2.yaml': '---\nmetadata:\n  annotations:\n    projectName: Project2\n    sourceCodeRepository: https://github.com/project2\n',
        };

        for (const [fileName, content] of Object.entries(mockedDnsRecords)) {
            await writeFile(path.join(tempDir, fileName), content)
        }
    })

    afterAll(async () => {
        // lean up temp directory
        await rm(tempDir, { recursive: true, force: true })
    });

    it('should extract annotations from DNS records', async () => {
        const annotations = await extractAnnotationsFromDnsRecords('./__tests__/temp-cloned-repo/dns-records');

        expect(annotations).toHaveLength(2);

        expect(annotations).toContainEqual({
            projectName: 'Project1',
            sourceCodeRepository: 'https://github.com/project1',
        });

        expect(annotations).toContainEqual({
            projectName: 'Project2',
            sourceCodeRepository: 'https://github.com/project2',
        });
    });
});
describe('consolidateProjectAnnotations', () => {
    it('should consolidate project annotations', async () => {
        const sampleAnnotations = [
            {
                projectName: 'Project1',
                sourceCodeRepository: 'https://github.com/project1',
                serviceEndpointUrls: 'https://service1.com',
                containerRegistries: undefined,
                domain: 'domain1.com',
            },
            {
                projectName: 'Project1',
                sourceCodeRepository: 'https://github.com/project1',
                serviceEndpointUrls: 'https://service1.com',
                containerRegistries: undefined,
                domain: 'domain2.com',
            },
            {
                projectName: 'Project2',
                sourceCodeRepository: 'https://github.com/project2',
                serviceEndpointUrls: undefined,
                containerRegistries: 'https://container1.com',
                domain: 'domain3.com',
            },
            {
                projectName: 'Project2',
                sourceCodeRepository: 'https://github.com/project2',
                containerRegistries: 'https://container1.com',
                domain: 'domain4.com',
            },
            {
                projectName: 'Project2',
                sourceCodeRepository: 'https://github.com/project2',
                containerRegistries: 'https://container1.com',
                domain: 'domain5.com',
            },
        ];
        const consolidatedProjects = await consolidateProjectAnnotations(sampleAnnotations);
        console.log(consolidatedProjects);

        expect(consolidatedProjects).toHaveLength(2);
        expect(Array.isArray(consolidatedProjects)).toBe(true);

        expect(consolidatedProjects[0]).toEqual({
            projectName: 'Project1',
            sourceCodeRepository: 'https://github.com/project1',
            serviceEndpointUrls: 'https://service1.com',
            domains: ['domain1.com', 'domain2.com'], // Include domains in the assertion
        });
        expect(consolidatedProjects[1]).toEqual({
            projectName: 'Project2',
            sourceCodeRepository: 'https://github.com/project2',
            containerRegistries: 'https://container1.com',
            domains: ['domain3.com', 'domain4.com', 'domain5.com'], // Include domains in the assertion
        });
    });
});