// interface https://www.google.com/search?q=medium+how+do+I+strategy+pattern+node&rlz=1C1GCEV_en___CA1049&oq=medium+how+do+I+strategy+pattern+node&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCTIwODkyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8#fpstate=ive&vld=cid:f4f87b93,vid:fxywUweIXY4,st:0


export class OctokitCheckStrategy {
    constructor(repoName, owner, octokit, branchName='main') {
        this.repo = repoName
        this.owner = owner
        this.octokit = octokit
        this.branch = branchName
    }

    async makeOctokitRequest() {
        try {
          const response = await this.octokit.request(this.endpoint, this.options);
          return response
        } catch (error) {
          console.error("An error occurred:", error.message);
          throw error
        }
      }

    async formatResponse() {
        return this.formatResponse
    }
}

