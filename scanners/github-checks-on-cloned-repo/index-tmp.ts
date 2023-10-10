import { hasDependabotYaml } from './src/has-dependabot-yaml.js'
import { hasSecurityMd } from './src/has-security-md.js'
import { searchTests, formTestsDirectoryPayload } from './src/has-tests-directory.js'
import { searchIgnoreFile } from './src/get-dotignore-details.js'
import { hasApiDirectory } from './src/has-api-directory.js'

interface RepoChecker{
    checkRepo(repoPath: string): Promise<any>
    // publishCheck(checkName: string): Promise<any>
}

class DotGitIgnoreDetails implements RepoChecker {
    async checkRepo(repoPath: string): Promise<any> {
        try {
            return await searchIgnoreFile(repoPath, ".gitignore")
        } catch (error) {
            throw error
        }
    }

    // async publishCheck(checkName: String): Promise<any> {
    //     console.log(yay")
    // }
}

class DotDockerIgnoreDetails implements RepoChecker {
    async checkRepo(repoPath: string): Promise<any> {
        try {
            return await searchIgnoreFile(repoPath, ".dockerignore")
          } catch (error) {
            throw error
          }
    }
}

class HasSecurityMd implements RepoChecker {
    async checkRepo(repoPath: string): Promise<any> {
        try {
            return await hasSecurityMd(repoPath);
        } catch (error) {
            throw error
        }
    }
}

class HasDependabotYaml implements RepoChecker {
    async checkRepo(repoPath: string): Promise<any> {
        try {
            return await hasDependabotYaml(repoPath);
        } catch (error) {
            throw error
        }
    }
}

class HasTestsDirectory implements RepoChecker {
    async checkRepo(repoPath: string): Promise<any> {
        try {
            const testDirectories = await searchTests(repoPath)
            return await formTestsDirectoryPayload(testDirectories)
        } catch (error) {
            throw error
        }
    }
}

class HasApiDirectory implements RepoChecker {
    async checkRepo(repoPath: string): Promise<any> {
        try {
          return await hasApiDirectory(repoPath);
        } catch (error) {
          throw error
        }
    }
}


class AllChecks{
    private checkers: RepoChecker[];
    constructor() {
        this.checkers = [
            new DotDockerIgnoreDetails(), 
            new DotGitIgnoreDetails(), 
            new HasApiDirectory(),
            new HasSecurityMd(),
            new HasDependabotYaml(),
            new HasTestsDirectory(),
        ]
    }
    async doAllChecks(repoPath: string): Promise<any[]> {
        const results: any[] = [];
        for (const checker of this.checkers) {
            const result = await checker.checkRepo(repoPath);
            results.push(result);
        }
        return results;
    }
}

async function doRepoCheck(repoChecker: RepoChecker, repoPath: string): Promise<any> {
    return await repoChecker.checkRepo(repoPath)
}

  const repoPath = '../../../temp-cloned-repo/repoName'

const dotIgnoreChecker = new DotGitIgnoreDetails()
const hasApiDirectoryChecker = new HasApiDirectory()
const dotDockerIgnoreChecker = new DotDockerIgnoreDetails()
const dotGitIgnoreChecker = new DotGitIgnoreDetails() 
const hasSecurityMdChecker = new HasSecurityMd()
const hasDependabotYamlChecker = new HasDependabotYaml()
const hasTestsDirectoryChecker = new HasTestsDirectory()
const allChecksChecker = new AllChecks()

// const result1 = await doRepoCheck(dotIgnoreChecker, repoPath);
// const result2 = await doRepoCheck(hasApiDirChecker, repoPath);

// console.log('Result of .gitignore check:', result1);
// console.log('Result of API directory check:', result2);



