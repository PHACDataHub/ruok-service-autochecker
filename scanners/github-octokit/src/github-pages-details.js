export async function getGithubPagesDetails(owner, repo, octokit) {
    try {
        const respGHPages = await octokit.request('GET /repos/{owner}/{repo}/pages', {
          owner: owner,
          repo: repo,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });
        console.log(respGHPages)
        console.log("url:", respGHPages.data.url);
        console.log("status:", respGHPages.data.status);
        console.log("https enforced:", respGHPages.data.https_enforced);
        console.log("protected domain state:", respGHPages.data.protected_domain_state)
        console.log("")
      } catch (error) {
        if (error.status === 404) {
          console.log("GitHub Pages are not found for this repository.");
          console.log("")
        } else {
          console.error("An error occurred while fetching GitHub Pages information:", error.message);
          console.log("")
        }
      }
    }