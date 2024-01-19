# Checks

When a repository event webhook is received, Observatory performs a series of automated scans. The **Endpoint Scanner** components of the Observatory system perform the actual scans on given endpoints.

![ruok-architecture](diagrams/architecture-simple.svg)

Broadly speaking, these checsk can be broken into the following categories.

| Check Type                | Purpose                                                                                                                     | Strategy                                                                                                                                              |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Remote Repository Checks  | Verify compliance with source code repositories on remotes such as [GitHub](https://github.com).                            | [GitHub Octokit API](https://github.com/octokit/octokit.js)                                                                                           |
| Repository Content Checks | Perform scans on the contents of the repository.                                                                            | Deep clone the repository and use automated scanning tools (e.g. [Gitleaks](https://github.com/gitleaks/gitleaks)).                                   |
| URL Scanning Checks       | Perform security and compliance checks against the live instance(s) of the product                                          | Various automated scanning tools that interact with a public URL (e.g. [axe-core](https://github.com/dequelabs/axe-core) for accessibility scanning). |
| Container Image Checks    | Gather container image data from GCP. |   GCP API                                   |


Observatory uses GraphQL as a layer to unify the data model for reporting on ITSG-33 and related compliance requirements. Roughly speaking, Observatory's "scanners" can be thought of as writing many pieces of security information about a given product. Similarly, the same data model exposed by the GraphQL API can be queried to report on the status of various compliance requirements.

![GraphQL API](../diagrams/scanners.svg)

Note our assumption that one repository may deploy services behind multiple URLs and each repository may build more than one OCI image.

The sections below expand on each Check Type in greater detail, and also show the parts of our GraphQL schema that expose these Check Types.

## Remote Repository Checks

There are many idioms, best practices, and security requirements for remote source code repositories. Observatory automatically performs a number of these checks using information retrievable from the [GitHub Octokit API](https://github.com/octokit/octokit.js).

### Vulnerability Alerts Enabled

> TODO

### Automated Security Fixes Enabled

> TODO

### Branch Protection Enabled

> TODO


## Repository Content Checks

A number of checks are performed by scanning a deep clone of the repository's contents. The purpose of these checks is to perform scanning on all of the source code, configuration, etc. contained in the repository.


### Has `Security.md`

A best practice with any open source code repository is to provide instructions via a `Security.md` file at the project root for how security vulnerabilities should be reported (see [GitHub's code security documentation](https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository) for more information). This check verifies whether a repository contains a `Security.md` file.

**Remediation**

Include a file called `Security.md` at the root of your repository explaining how security vulnerabilities should be reported to the repository owner. For example, there may be an email address where vulnerability reports should be sent, and explicit instructions to *not* document security vulnerabilities in the repository issues.

**Data Example**

```jsonc
{
    // ...
    "has_security_md":{
        "check_passes": true,
        "metadata": null,
    }
    // ...
}
```
**Pass Criteria** 
A SECURITY.md, txt or rtf (not-case-sensitive) file is at the root of the GitHub repository. 
**metadata** for this will always be null.

### Gitleaks Report

[Gitleaks](https://github.com/gitleaks/gitleaks) detects if secrets that have been commited at any point in the repository's history.  

**Remediation**

Remove the leak from the [commit history](https://blog.gitguardian.com/rewriting-git-history-cheatsheet/).

If the 'leak' detected is not a secret, only a false positive, include a [.gitleaksignore](https://github.com/gitleaks/gitleaks/tree/master#gitleaksignore) file at the root of your repository containing that item.

For preventative protection, consider using 'gitleaks protect' [pre-commit]((https://github.com/gitleaks/gitleaks/tree/master#pre-commit)) or using the [gitleaks GitHub Action](https://github.com/gitleaks/gitleaks-action).

**Data Example**
```jsonc
{
    // ...
  gitleaks: {
    check_passes: false,
    metadata: {
      leaks_found: true,
      number_of_leaks: 2,
      commits_scanned: 466,
      details: [
        {
            description: 'Private Key',
            file: 'scanners/github-cloned-repo-checks/src/fake-secret',
            start_line: 28,
            end_line: 28,
            start_column: 14,
            end_column: 53
            commit: '29c1850108f543f5eaab26ed052508fa0b45bb74',
            author: '=',
            email: 'my.email@gmail.com',
        },
     // ...
      ]
    }
  }
      // ...
}

```

### File Size Check

> TODO

### `Hadolint` Dockerfile Linting

[`Hadolint`](https://github.com/hadolint/hadolint) is a linter for Dockerfiles. This scanner analyzes the Dockerfiles in the source code repository, and flags any best practices rules that have been broken. 

**Remediation**

Follow the guidelines outlined in the results message to update the Dockerfiles.  If your team has decided to not follow a particular rule in certain instances, you can clear the warning in this scanner by including an [inline ignore tag](https://github.com/hadolint/hadolint#inline-ignores) at the Dockerfile location where you would like to have the rule check by-passed.


**Data Example**
```jsonc
{
    // ...
   hadolint: {
      check_passes: false
      metadata: [
        {
          dockerfile: "ui/Dockerfile",
          rules_violated: [
            {
                code: "DL1000",
                level: "error",
                line: 41,
                message: "unexpected '#'\nexpecting a new line followed by the next instruction"
            }
          ]
        },
        {
          dockerfile: "scanners/web-endpoint-checks/Dockerfile",
          rules_violated: [
            {
                code: "DL3008",
                level: "warning",
                line: 11,
                message: "Pin versions in apt get install. Instead of `apt-get install <package>` use `apt-get install <package>=<version>`"
            },
        // ...
          ]
        }
      ]
      // ...
    }

```
### `Trivy` Repository Vunerability Scanning

[`Trivy`](https://github.com/aquasecurity/trivy) is a security scanner we're using in this case to scan software dependencies against known vunerabilities.  It offers a remote Git repository scanner, that works for public repositories. Since we have some private repositories, we're using the filesystem scan on the cloned repository instead. 

**Remediation**

Update the dependencies as indicated if there is a fixed version. Follow the URL for more information on the found vunerability. 

**Data Example**
```jsonc
{
    // ...
    trivy_repo_vulnerability: {
      check_passes: false
      metadata: [
        {
          library: "librarya",
          vulnerability_ID: "CVE-2023-xxxx",
          severity: "MEDIUM",
          installed_version: "41.0.x",
          fixed_version: "41.0.y",
          title: "librarya is a package designed to expose  ...",
          url: "https://avd.aquasec.com/nvd/cve-2023-xxxx"
        },
        {
          library: "librayb",
          vulnerability_ID: "GHSA-v8gr-xxxx-xxxx",
          severity: "LOW",
          installed_version: "41.0.x",
          fixed_version: "41.0.y",
          title: "Vulnerable OpenSSL included in libraryb",
          url: "https://github.com/advisories/GHSA-v8gr-xxxx-xxxx"
        },
        // ...
      ]
    }
  // ...
}

```


> TODO

## URL (Service) Scanning Checks

Some products have one or more services exposed through URLs. URL compliance checks perform a series of automated accessibility and security compliance checks using information that can be retrieved via these public URLs.


## Container Image Checks

Any products that build and deploy OCI images perform a series of checks on the built image artifact(s).


