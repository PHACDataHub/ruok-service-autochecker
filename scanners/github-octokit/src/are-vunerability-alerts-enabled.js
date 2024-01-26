
// vunerability alerts aka dependabot alerts
import { OctokitCheckStrategy } from './octokit-check-strategy.js'

export class VunerabilityAlertsEnabledStrategy extends OctokitCheckStrategy {
    constructor(repoName, owner, octokit) {
        super(repoName, owner, octokit);

        this.endpoint = '/repos/{owner}/{repo}/vulnerability-alerts'
        this.options = {
            owner: this.owner,
            repo: this.repo,
            headers: {
            'X-GitHub-Api-Version': '2022-11-28',
            },
        };
    }

    async formatResponse() {
        try {
            const response = await this.makeOctokitRequest();
            if (response.status == 204) {
                return {
                    checkPasses: true, 
                    metadata: null
                }   
            }
        } catch (error) {
            if (error.message == 'Vulnerability alerts are disabled.'){
                return {
                    checkPasses: false,
                    metadata: null
                }  
            } else {
                throw {
                    'dependabot_alerts_enabled': `error: ${error.message}`  
                }
            }
        }
    }
}