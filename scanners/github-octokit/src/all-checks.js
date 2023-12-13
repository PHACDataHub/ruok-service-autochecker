import { GetRepoDetailsStrategy } from "./get-repo-details.js"
import { AutomatedSecurityFixesStrategy } from "./automated-security-fixes.js";
import { ProgrammingLanguagesStrategy } from "./all-langauges.js";
import { BranchProtectionStrategy } from "./branch-protection.js"
import { CodeContributorsStrategy } from "./code-contributors.js";
import { VunerabilityAlertsEnabledStrategy } from "./are-vunerability-alerts-enabled.js";
import { PullRequestProtectionStrategy } from "./pull-request-protection.js";

import { OctokitCheckStrategy } from './octokit-check-strategy.js'

export class AllChecksStrategy extends OctokitCheckStrategy {
  constructor(repoName, owner, octokit, branchName = 'main') {
    super(repoName, owner, octokit, branchName);
    this.checkers = [
        new GetRepoDetailsStrategy(repoName, owner, octokit, 'main'),
        new AutomatedSecurityFixesStrategy(repoName, owner, octokit, 'main'),
        new ProgrammingLanguagesStrategy(repoName, owner, octokit, 'main'), 
        new CodeContributorsStrategy(repoName, owner, octokit, 'main'),
        new VunerabilityAlertsEnabledStrategy(repoName, owner, octokit, 'main'),
        new PullRequestProtectionStrategy(repoName, owner, octokit, 'main'),
        new BranchProtectionStrategy(repoName, owner, octokit, 'main'),
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
