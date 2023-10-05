export async function getMainLanguage(repoDetails) {
    if (repoDetails.language) {
        return({"mainLanguage": repoDetails.language})
    } else {
        return({"mainLanguage": null})
    }
}