// checkname is passed in to instanitate a particular strategy - all checks will perform all checks
// repoPath is the tmp directory of the cloned repository

// Note - this separate intializer is not needed if we're always using all-checks.js

import { HasApiDirectory } from './has-api-directory.js'
import { HasDependabotYaml } from './has-dependabot-yaml.js'
import { HasTestsDirectory } from './has-tests-directory.js'
import { HasSecurityMd } from "./has-security-md.js"
import { DotDockerIgnoreDetails, DotGitIgnoreDetails } from "./get-dotignore-details.js"
import { Gitleaks } from "./gitleaks.js"
import { Hadolint } from './hadolint.js'
import { TrivyRepo } from './trivy-repo.js'

import { AllChecks } from './all-checks.js'

export async function initializeChecker(checkName, repoName, repoPath) {
    switch (checkName) {
        case 'hasApiDirectory':
            return new HasApiDirectory(repoName, repoPath)
        case 'hasDependabotYaml':
            return new HasDependabotYaml(repoName, repoPath)
        case 'hasTestsDirectory':
            return new HasTestsDirectory(repoName, repoPath)
        case 'hasSecurityMd':
            return new HasSecurityMd(repoName, repoPath)
        case 'dotDockerIgnoreDetails':
            return new DotDockerIgnoreDetails(repoName, repoPath)
        case 'dotGitIgnoreDetails':
            return new DotGitIgnoreDetails(repoName, repoPath)
        case 'gitleaks':
            return new Gitleaks(repoName, repoPath)
        case 'hadolint':
            return new Hadolint(repoName, repoPath)
        case 'trivyRepo':
            return new TrivyRepo(repoName, repoPath)
        case 'allChecks':
            return new AllChecks(repoName, repoPath)
        default:
            throw new Error(`Unknown checker: ${checkName}`)
    }
}