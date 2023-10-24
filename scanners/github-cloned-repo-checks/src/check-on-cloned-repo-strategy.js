// interface https://www.google.com/search?q=medium+how+do+I+strategy+pattern+node&rlz=1C1GCEV_en___CA1049&oq=medium+how+do+I+strategy+pattern+node&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCTIwODkyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8#fpstate=ive&vld=cid:f4f87b93,vid:fxywUweIXY4,st:0


export class CheckOnClonedRepoStrategy {
    constructor(repoName, repoPath) {
        this.repoName = repoName
        this.clonedrepoPath = repoPath
        // this.clonedRepoPath = `../../temp-cloned-repo/${repoName}`
        console.log('***************checkonclonedrepostrategy', this.repoName, this.clonedrepoPath)
    }
    async doRepoCheck() {
        return this.doRepoCheck()
    }
    checkName() {
        return this.checkName()
    }
}



