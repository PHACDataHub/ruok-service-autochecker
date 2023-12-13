//src/octokit-check-context.js
// export class RepoChecker {
//     async makeOctokitRequest(processor){
//         return processor.makeOctokitRequest()
//     }
//     async formatResponse(processor){
//         return processor.formatResponse()
//     }
// }

export class RepoChecker {
    static async makeOctokitRequest(processor) {
        return processor.makeOctokitRequest();
    }

    static async formatResponse(processor) {
        return processor.formatResponse();
    }
}