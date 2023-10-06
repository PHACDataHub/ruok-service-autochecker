export async function getLicenseDetails(repoDetails) {
    if (repoDetails.license) {
        // console.log(repoDetails.license)
        // return({"hasLicense": true, "license": repoDetails.license.spdx_id})
        return({"license": repoDetails.license.spdx_id})
    } else {
        return({"license": null})
    }
}