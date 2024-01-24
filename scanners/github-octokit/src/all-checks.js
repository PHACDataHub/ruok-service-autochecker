import { GetRepoDetailsStrategy } from "./get-repo-details.js"
import { AutomatedSecurityFixesStrategy } from "./automated-security-fixes.js";
import { ProgrammingLanguagesStrategy } from "./all-langauges.js";
import { BranchProtectionStrategy } from "./branch-protection.js"
import { CodeContributorsStrategy } from "./code-contributors.js";
import { VunerabilityAlertsEnabledStrategy } from "./are-vunerability-alerts-enabled.js";
// import { PullRequestProtectionStrategy } from "./pull-request-protection.js";

import { OctokitCheckStrategy } from './octokit-check-strategy.js'

export class AllChecksStrategy extends OctokitCheckStrategy {
  constructor(repoName, owner, octokit) {
    super(repoName, owner, octokit);
    this.checkers = [
        new GetRepoDetailsStrategy(repoName, owner, octokit),
        new AutomatedSecurityFixesStrategy(repoName, owner, octokit),
        new ProgrammingLanguagesStrategy(repoName, owner, octokit), 
        new CodeContributorsStrategy(repoName, owner, octokit),
        new VunerabilityAlertsEnabledStrategy(repoName, owner, octokit),
        // new PullRequestProtectionStrategy(repoName, owner, octokit, 'main'),
        new BranchProtectionStrategy(repoName, owner, octokit),
      ];
    }
    async formatResponse() {
        const checkResults = await Promise.all(
          this.checkers.map(async (checker) => {
            const result = await checker.formatResponse();
            return { [checker.constructor.name]: result };
          })
        );
    
        const results = Object.assign({}, ...checkResults);
        return results;
      }
    }
