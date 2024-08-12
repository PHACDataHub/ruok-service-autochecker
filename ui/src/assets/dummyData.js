const servicesData = {
  allServices: [
    {
      name: 'observatory-alpha-phac-gc-ca',
      webUrl: 'https://service-1-ui.com',
      webUrlId: 'service-1-ui',
      license: 'MIT',
      visibility: 'public',
      owner: 'owner-1',
      repo: 'repo-1',
      programmingLanguage: 'JavaScript',
      description: 'Service 1 Description',
      gitleaks: {
        checkPasses: false,
        metadata: {
          leaksFound: true,
          numberOfLeaks: 1,
          commitsScanned: 610,
          details: [
            {
              Description: 'GitHub Personal Access Token',
              File: 'scanners/github-octokit-checks/app.js',
              StartLine: 10,
              EndLine: 10,
              StartColumn: 39,
              EndColumn: 78,
              Commit: 'de35a4b238a136ac6f98955d6087e89dfe5d2c25',
              Author: 'LilaKelland',
              Email: 'lila.kelland@gmail.com',
            },
          ],
        },
      },
      hadolint: {
        checkPasses: false,
        metadata: [
          {
            dockerfile: 'ui/Dockerfile',
            rules_violated: [
              {
                code: 'DL1000',
                level: 'error',
                line: 9,
                message:
                  "unexpected '/'\nexpecting '\\', a new line followed by the next instruction, or at least one space",
              },
            ],
          },
          {
            dockerfile: 'scanners/web-endpoint/Dockerfile',
            rules_violated: [
              {
                code: 'DL3008',
                level: 'warning',
                line: 20,
                message:
                  'Pin versions in apt get install. Instead of `apt-get install <package>` use `apt-get install <package>=<version>`',
              },
            ],
          },
          {
            dockerfile: 'scanners/github-octokit/Dockerfile',
            rules_violated: [],
          },
          {
            dockerfile: 'scanners/github-cloned-repo/Dockerfile',
            rules_violated: [],
          },
          {
            dockerfile: 'jobs/dns-scanner/Dockerfile',
            rules_violated: [],
          },
          {
            dockerfile: 'graph-updater/Dockerfile',
            rules_violated: [],
          },
          {
            dockerfile: 'event-collectors/github-webhook-server/Dockerfile',
            rules_violated: [
              {
                code: 'DL3018',
                level: 'warning',
                line: 8,
                message:
                  'Pin versions in apk add. Instead of `apk add <package>` use `apk add <package>=<version>`',
              },
            ],
          },
          {
            dockerfile: 'api/Dockerfile',
            rules_violated: [],
          },
        ],
      },
      vulnerabilityAlerts: {
        checkPasses: true,
        metadata: null,
      },
      trivyRepoVulnerability: {
        checkPasses: false,
        metadata: [
          {
            library: 'black',
            vulnerability_ID: 'CVE-2024-21503',
            severity: 'MEDIUM',
            installed_version: '23.10.1',
            fixed_version: '24.3.0',
            title:
              'psf/black: ReDoS via the lines_with_leading_tabs_expanded() function in strings.py file',
            url: 'https://avd.aquasec.com/nvd/cve-2024-21503',
          },
          {
            library: 'certifi',
            vulnerability_ID: 'CVE-2024-39689',
            severity: 'LOW',
            installed_version: '2023.7.22',
            fixed_version: '2024.07.04',
            title:
              'python-certifi: Remove root certificates from `GLOBALTRUST` from the root store',
            url: 'https://avd.aquasec.com/nvd/cve-2024-39689',
          },
          {
            library: 'cryptography',
            vulnerability_ID: 'CVE-2023-50782',
            severity: 'HIGH',
            installed_version: '41.0.6',
            fixed_version: '42.0.0',
            title:
              'python-cryptography: Bleichenbacher timing oracle attack against RSA decryption - incomplete fix for CVE-2020-25659',
            url: 'https://avd.aquasec.com/nvd/cve-2023-50782',
          },
        ],
      },
      hasDependabotYaml: {
        checkPasses: true,
        metadata: null,
      },
      hasSecurityMd: {
        checkPasses: true,
        metadata: null,
      },
      automatedSecurityFixes: {
        checkPasses: true,
        metadata: {
          enabled: true,
          paused: true,
        },
      },
      branchProtection: {
        checkPasses: false,
        metadata: {
          rules: [],
        },
      },
      referencingEndpoints: [
        { id: 'web-endpoint-1', url: 'https://service-1-ui.com', kind: 'Web' },
        { id: 'endpoint-1', url: 's3://service-1-bucket', kind: 'AWS S3' },
        {
          id: 'endpoint-2',
          url: 'https://service-1-api-endpoint.com',
          kind: 'API',
        },
      ],
    },
    {
      name: 'backstage-alpha-phac-aspc-gc-ca',
      webUrl: 'https://service-2-ui.com',
      webUrlId: 'service-2-ui',
      license: 'Apache-2.0',
      visibility: 'private',
      owner: 'owner-2',
      repo: 'repo-2',
      programmingLanguage: 'Python',
      description: 'Service 2 Description',
      automatedSecurityFixes: {
        checkPasses: false,
        metadata: {
          enabled: false,
          paused: null,
        },
      },
      branchProtection: {
        checkPasses: false,
        metadata: {
          rules: [],
        },
      },
      gitleaks: {
        checkPasses: false,
        metadata: {
          commitsScanned: 264,
          details: [
            {
              Description: 'Private Key',
              File: 'bootstrap/README.md',
              StartLine: 194,
              EndLine: 196,
              StartColumn: 4,
              EndColumn: 31,
              Commit: 'bc95b1716b1380afa9623bbf0263dcfa4b85af1d',
              Author: 'Sean Poulter',
              Email: 'sean.poulter@focisolutions.com',
            },
            {
              Description: 'Private Key',
              File: 'bootstrap/README.md',
              StartLine: 127,
              EndLine: 129,
              StartColumn: 7,
              EndColumn: 34,
              Commit: '147b4a61d4360955a9dffe76af465a2c17ba8887',
              Author: 'Sean Poulter',
              Email: 'sean.poulter@focisolutions.com',
            },
          ],
          leaksFound: true,
          numberOfLeaks: 2,
        },
      },
      hadolint: {
        checkPasses: false,
        metadata: [
          {
            dockerfile:
              'bootstrap/crossplane/templates/terrafrom/build/Dockerfile',
            rules_violated: [
              {
                code: 'DL3018',
                level: 'warning',
                line: 12,
                message:
                  'Pin versions in apk add. Instead of `apk add <package>` use `apk add <package>=<version>`',
              },
              {
                code: 'SC2006',
                level: 'style',
                line: 12,
                message:
                  'Use $(...) notation instead of legacy backticks `...`.',
              },
            ],
          },
          {
            dockerfile: 'backstage/packages/backend/Dockerfile',
            rules_violated: [
              {
                code: 'DL3008',
                level: 'warning',
                line: 15,
                message:
                  'Pin versions in apt get install. Instead of `apt-get install <package>` use `apt-get install <package>=<version>`',
              },
              {
                code: 'DL3008',
                level: 'warning',
                line: 23,
                message:
                  'Pin versions in apt get install. Instead of `apt-get install <package>` use `apt-get install <package>=<version>`',
              },
              {
                code: 'DL3060',
                level: 'info',
                line: 45,
                message:
                  '`yarn cache clean` missing after `yarn install` was run.',
              },
            ],
          },
        ],
      },
      hasDependabotYaml: {
        checkPasses: false,
        metadata: null,
      },
      hasSecurityMd: {
        checkPasses: false,
        metadata: null,
      },
      trivyRepoVulnerability: {
        checkPasses: false,
        metadata: [
          {
            library: '@azure/identity',
            vulnerability_ID: 'CVE-2024-35255',
            severity: 'MEDIUM',
            installed_version: '4.2.0',
            fixed_version: '4.2.1',
            title:
              'azure-identity: Azure Identity Libraries Elevation of Privilege Vulnerability in github.com/Azure/azure-sdk-for-go/sdk/azidentity',
            url: 'https://avd.aquasec.com/nvd/cve-2024-35255',
          },
          {
            library: '@azure/msal-node',
            vulnerability_ID: 'CVE-2024-35255',
            severity: 'MEDIUM',
            installed_version: '2.9.1',
            fixed_version: '2.9.2',
            title:
              'azure-identity: Azure Identity Libraries Elevation of Privilege Vulnerability in github.com/Azure/azure-sdk-for-go/sdk/azidentity',
            url: 'https://avd.aquasec.com/nvd/cve-2024-35255',
          },
          {
            library: '@grpc/grpc-js',
            vulnerability_ID: 'CVE-2024-37168',
            severity: 'MEDIUM',
            installed_version: '1.10.8',
            fixed_version: '1.10.9, 1.9.15, 1.8.22',
            title:
              'grps-js: allocate memory for incoming messages well above configured limits',
            url: 'https://avd.aquasec.com/nvd/cve-2024-37168',
          },
        ],
      },
      vulnerabilityAlerts: {
        checkPasses: false,
        metadata: null,
      },
      referencingEndpoints: [
        { id: 'web-endpoint-2', url: 'https://service-2-ui.com', kind: 'Web' },
        {
          id: 'endpoint-3',
          url: 'mysql://service-2-db-endpoint',
          kind: 'Database',
        },
        {
          id: 'endpoint-4',
          url: 'https://service-2-api-endpoint.com',
          kind: 'API',
        },
      ],
    },
    {
      name: 'catalogue-alpha-phac-aspc-gc-ca',
      webUrl: 'https://service-3-ui.com',
      webUrlId: 'service-3-ui',
      license: 'GPL-3.0',
      visibility: 'public',
      owner: 'owner-3',
      repo: 'repo-3',
      programmingLanguage: 'Ruby',
      description: 'Service 3 Description',
      automatedSecurityFixes: {
        checkPasses: false,
        metadata: {
          enabled: false,
          paused: null,
        },
      },
      branchProtection: {
        checkPasses: false,
        metadata: {
          rules: [],
        },
      },
      gitleaks: {
        checkPasses: false,
        metadata: {
          commitsScanned: 1129,
          details: [
            {
              Description: 'Generic API Key',
              File: 'phacend/risk/tests.py',
              StartLine: 20,
              EndLine: 20,
              StartColumn: 73,
              EndColumn: 98,
              Commit: '43112118640c1ebea9df4304e049580d76cac03a',
              Author: 'GeordinR',
              Email: 'geordinraganold@gmail.com',
            },
            {
              Description: 'Generic API Key',
              File: 'phacend/risk/tests_urls.py',
              StartLine: 44,
              EndLine: 44,
              StartColumn: 17,
              EndColumn: 45,
              Commit: '43112118640c1ebea9df4304e049580d76cac03a',
              Author: 'GeordinR',
              Email: 'geordinraganold@gmail.com',
            },
            {
              Description: 'Generic API Key',
              File: 'phacend/phacend/settings.py',
              StartLine: 28,
              EndLine: 28,
              StartColumn: 2,
              EndColumn: 84,
              Commit: 'ff5ab49071a0ff8841bd9d62dc6f21b6c21a5466',
              Author: 'GeordinR',
              Email: 'geordinraganold@gmail.com',
            },
            {
              Description: 'Generic API Key',
              File: 'phacend/phacend/settings.py',
              StartLine: 24,
              EndLine: 24,
              StartColumn: 2,
              EndColumn: 84,
              Commit: 'd391bbdc1850d2d61c2f1f2943b6d1fd28f599ec',
              Author: 'Andrew Gibson',
              Email: 'andrew@simcoe.is',
            },
          ],
          leaksFound: true,
          numberOfLeaks: 4,
        },
      },
      hadolint: {
        checkPasses: false,
        metadata: [
          {
            dockerfile: 'phacend/Dockerfile.prod',
            rules_violated: [
              {
                code: 'DL3018',
                level: 'warning',
                line: 44,
                message:
                  'Pin versions in apk add. Instead of `apk add <package>` use `apk add <package>=<version>`',
              },
              {
                code: 'DL3003',
                level: 'warning',
                line: 51,
                message: 'Use WORKDIR to switch to a directory',
              },
            ],
          },
          {
            dockerfile: 'phacend/Dockerfile',
            rules_violated: [
              {
                code: 'DL3008',
                level: 'warning',
                line: 14,
                message:
                  'Pin versions in apt get install. Instead of `apt-get install <package>` use `apt-get install <package>=<version>`',
              },
            ],
          },
          {
            dockerfile: 'pgadmin/Dockerfile',
            rules_violated: [
              {
                code: 'DL3018',
                level: 'warning',
                line: 12,
                message:
                  'Pin versions in apk add. Instead of `apk add <package>` use `apk add <package>=<version>`',
              },
            ],
          },
        ],
      },
      hasDependabotYaml: {
        checkPasses: false,
        metadata: null,
      },
      hasSecurityMd: {
        checkPasses: false,
        metadata: null,
      },
      trivyRepoVulnerability: {
        checkPasses: false,
        metadata: [
          {
            library: 'Django',
            vulnerability_ID: 'CVE-2023-31047',
            severity: 'CRITICAL',
            installed_version: '4.1.7',
            fixed_version: '3.2.19, 4.1.9, 4.2.1',
            title:
              'python-django: Potential bypass of validation when uploading multiple files using one form field',
            url: 'https://avd.aquasec.com/nvd/cve-2023-31047',
          },
          {
            library: 'Django',
            vulnerability_ID: 'CVE-2023-36053',
            severity: 'HIGH',
            installed_version: '4.1.7',
            fixed_version: '3.2.20, 4.1.10, 4.2.3',
            title:
              'python-django: Potential regular expression denial of service vulnerability in EmailValidator/URLValidator',
            url: 'https://avd.aquasec.com/nvd/cve-2023-36053',
          },
        ],
      },
      vulnerabilityAlerts: {
        checkPasses: false,
        metadata: null,
      },
      referencingEndpoints: [
        { id: 'web-endpoint-3', url: 'https://service-3-ui.com', kind: 'Web' },
        { id: 'endpoint-5', url: 's3://service-3-bucket', kind: 'AWS S3' },
        {
          id: 'endpoint-6',
          url: 'https://service-3-api-endpoint.com',
          kind: 'API',
        },
      ],
    },
    {
      name: 'service-4',
      webUrl: 'https://service-4-ui.com',
      webUrlId: 'service-4-ui',
      license: 'BSD-3-Clause',
      visibility: 'public',
      owner: 'owner-4',
      repo: 'repo-4',
      programmingLanguage: 'Go',
      description: 'Service 4 Description',
      automatedSecurityFixes: { checkPasses: true, metadata: {} },
      branchProtection: { checkPasses: true, metadata: {} },
      gitleaks: { checkPasses: true, metadata: {} },
      hadolint: { checkPasses: true, metadata: {} },
      hasDependabotYaml: { checkPasses: true, metadata: {} },
      hasSecurityMd: { checkPasses: true, metadata: {} },
      vulnerabilityAlerts: { checkPasses: true, metadata: {} },
      trivyRepoVulnerability: { checkPasses: true, metadata: {} },
      referencingEndpoints: [
        { id: 'web-endpoint-4', url: 'https://service-4-ui.com', kind: 'Web' },
        {
          id: 'endpoint-7',
          url: 'https://service-4-api-endpoint.com',
          kind: 'API',
        },
      ],
    },
  ],
}

const endpointData = {
  'endpoint-1': {
    url: 's3://service-1-bucket',
    kind: 'AWS S3',
    security: {
      encryption: 'AES-256',
      accessControl: 'Private',
      checkPasses: true,
      metadata: {},
    },
  },
  'endpoint-2': {
    url: 'https://service-1-api-endpoint.com',
    kind: 'API',
    security: {
      authentication: 'OAuth 2.0',
      rateLimiting: 'Enabled',
      checkPasses: true,
      metadata: {},
    },
  },
  'endpoint-3': {
    url: 'mysql://service-2-db-endpoint',
    kind: 'Database',
    security: {
      encryption: 'AES-256',
      accessControl: 'Database Roles',
      checkPasses: true,
      metadata: {},
    },
  },
  'endpoint-4': {
    url: 'https://service-2-api-endpoint.com',
    kind: 'API',
    security: {
      authentication: 'API Key',
      rateLimiting: 'Enabled',
      checkPasses: true,
      metadata: {},
    },
  },
  'endpoint-5': {
    url: 's3://service-3-bucket',
    kind: 'AWS S3',
    security: {
      encryption: 'AES-256',
      accessControl: 'Private',
      checkPasses: true,
      metadata: {},
    },
  },
  'endpoint-6': {
    url: 'https://service-3-api-endpoint.com',
    kind: 'API',
    security: {
      authentication: 'OAuth 2.0',
      rateLimiting: 'Enabled',
      checkPasses: true,
      metadata: {},
    },
  },
  'endpoint-7': {
    url: 'https://service-4-api-endpoint.com',
    kind: 'API',
    security: {
      authentication: 'API Key',
      rateLimiting: 'Enabled',
      checkPasses: true,
      metadata: {},
    },
  },
  'web-endpoint-1': {
    url: 'https://web-service-1.com',
    kind: 'Web',
    accessibility: {
      areaAlt: {
        checkPasses: null,
        metadata: {
          description:
            'Ensures <area> elements of image maps have alternate text',
          helpUrl:
            'https://dequeuniversity.com/rules/axe/4.8/area-alt?application=axe-puppeteer',
        },
      },
      ariaAllowedAttr: {
        checkPasses: null,
        metadata: {
          description: "Ensures an element's role supports its ARIA attributes",
          helpUrl:
            'https://dequeuniversity.com/rules/axe/4.8/aria-allowed-attr?application=axe-puppeteer',
        },
      },
      ariaBrailleEquivalent: {
        checkPasses: null,
        metadata: {
          description:
            'Ensure aria-braillelabel and aria-brailleroledescription have a non-braille equivalent',
          helpUrl:
            'https://dequeuniversity.com/rules/axe/4.8/aria-braille-equivalent?application=axe-puppeteer',
        },
      },
      ariaCommandName: {
        checkPasses: null,
        metadata: {
          description:
            'Ensures every ARIA button, link and menuitem has an accessible name',
          helpUrl:
            'https://dequeuniversity.com/rules/axe/4.8/aria-command-name?application=axe-puppeteer',
        },
      },
      ariaConditionalAttr: {
        checkPasses: null,
        metadata: {
          description:
            "Ensures ARIA attributes are used as described in the specification of the element's role",
          helpUrl:
            'https://dequeuniversity.com/rules/axe/4.8/aria-conditional-attr?application=axe-puppeteer',
        },
      },
      ariaDeprecatedRole: {
        checkPasses: null,
        metadata: {
          description: 'Ensures elements do not use deprecated roles',
          helpUrl:
            'https://dequeuniversity.com/rules/axe/4.8/aria-deprecated-role?application=axe-puppeteer',
        },
      },
      ariaHiddenBody: {
        checkPasses: null,
        metadata: {
          description:
            'Ensures aria-hidden="true" is not present on the document body.',
          helpUrl:
            'https://dequeuniversity.com/rules/axe/4.8/aria-hidden-body?application=axe-puppeteer',
        },
      },
      ariaHiddenFocus: {
        checkPasses: null,
        metadata: {
          description:
            'Ensures aria-hidden elements are not focusable nor contain focusable elements',
          helpUrl:
            'https://dequeuniversity.com/rules/axe/4.8/aria-hidden-focus?application=axe-puppeteer',
        },
      },
      ariaInputFieldName: {
        checkPasses: null,
        metadata: {
          description: 'Ensures every ARIA input field has an accessible name',
          helpUrl:
            'https://dequeuniversity.com/rules/axe/4.8/aria-input-field-name?application=axe-puppeteer',
        },
      },
      ariaMeterName: {
        checkPasses: null,
        metadata: {
          description: 'Ensures every ARIA meter node has an accessible name',
          helpUrl:
            'https://dequeuniversity.com/rules/axe/4.8/aria-meter-name?application=axe-puppeteer',
        },
      },
      imageAlt: {
        checkPasses: true,
        metadata: {
          description: 'Ensures every ARIA meter node has an accessible name',
          helpUrl:
            'https://dequeuniversity.com/rules/axe/4.8/aria-meter-name?application=axe-puppeteer',
        },
      },
    },
  },
  'web-endpoint-2': {
    url: 'https://web-service-2.com',
    kind: 'Web',
    accessibility: {
      areaAlt: {
        checkPasses: false,
        metadata: [{ issues: 'Some images are missing alternative text.' }],
      },
      ariaBrailleEquivalent: { checkPasses: true, metadata: {} },
      ariaCommandName: { checkPasses: true, metadata: {} },
      ariaHiddenFocus: { checkPasses: true, metadata: {} },
      ariaInputFieldName: {
        checkPasses: false,
        metadata: [{ issues: 'Some input fields lack ARIA labels.' }],
      },
      ariaMeterName: { checkPasses: true, metadata: {} },
      ariaProgressbarName: { checkPasses: true, metadata: {} },
      ariaRequiredChildren: { checkPasses: true, metadata: {} },
      ariaRequiredParent: { checkPasses: true, metadata: {} },
      ariaRoledescription: { checkPasses: true, metadata: {} },
      ariaToggleFieldName: {
        checkPasses: false,
        metadata: [{ issues: 'Inconsistent ARIA toggle field names.' }],
      },
      ariaTooltipName: { checkPasses: true, metadata: {} },
      audioCaption: { checkPasses: true, metadata: {} },
      blink: { checkPasses: true, metadata: {} },
      definitionList: { checkPasses: true, metadata: {} },
      dlitem: { checkPasses: true, metadata: {} },
      duplicateIdAria: { checkPasses: true, metadata: {} },
      frameFocusableContent: { checkPasses: true, metadata: {} },
      frameTitleUnique: { checkPasses: true, metadata: {} },
      frameTitle: { checkPasses: true, metadata: {} },
      htmlXmlLangMismatch: { checkPasses: true, metadata: {} },
      imageAlt: { checkPasses: true, metadata: {} },
      inputButtonName: { checkPasses: true, metadata: {} },
      inputImageAlt: { checkPasses: true, metadata: {} },
      linkInTextBlock: { checkPasses: true, metadata: {} },
      list: { checkPasses: true, metadata: {} },
      listitem: { checkPasses: true, metadata: {} },
      marquee: { checkPasses: true, metadata: {} },
      metaRefresh: { checkPasses: true, metadata: {} },
      objectAlt: { checkPasses: true, metadata: {} },
      roleImgAlt: { checkPasses: true, metadata: {} },
      scrollableRegionFocusable: { checkPasses: true, metadata: {} },
      selectName: { checkPasses: true, metadata: {} },
      serverSideImageMap: { checkPasses: true, metadata: {} },
      svgImgAlt: { checkPasses: true, metadata: {} },
      tdHeadersAttr: { checkPasses: true, metadata: {} },
      thHasDataCells: { checkPasses: true, metadata: {} },
      validLang: { checkPasses: true, metadata: {} },
      videoCaption: { checkPasses: true, metadata: {} },
      noAutoplayAudio: { checkPasses: true, metadata: {} },
      ariaAllowedAttr: { checkPasses: true, metadata: {} },
      ariaConditionalAttr: { checkPasses: true, metadata: {} },
      ariaDeprecatedRole: { checkPasses: true, metadata: {} },
      ariaHiddenBody: { checkPasses: true, metadata: {} },
      ariaProhibitedAttr: { checkPasses: true, metadata: {} },
      ariaRequiredAttr: { checkPasses: true, metadata: {} },
      ariaRoles: { checkPasses: true, metadata: {} },
      ariaValidAttrValue: { checkPasses: true, metadata: {} },
      ariaValidAttr: { checkPasses: true, metadata: {} },
      buttonName: { checkPasses: true, metadata: {} },
      colorContrast: { checkPasses: true, metadata: {} },
      documentTitle: { checkPasses: true, metadata: {} },
      formFieldMultipleLabels: { checkPasses: true, metadata: {} },
      htmlHasLang: { checkPasses: true, metadata: {} },
      htmlLangValid: { checkPasses: true, metadata: {} },
      label: { checkPasses: true, metadata: {} },
      linkName: { checkPasses: true, metadata: {} },
      metaViewport: { checkPasses: true, metadata: {} },
      nestedInteractive: { checkPasses: true, metadata: {} },
      bypass: { checkPasses: true, metadata: {} },
    },
  },
  'web-endpoint-3': {
    url: 'https://web-service-3.com',
    kind: 'Web',
    accessibility: {
      areaAlt: { checkPasses: true, metadata: {} },
      ariaBrailleEquivalent: { checkPasses: true, metadata: {} },
      ariaCommandName: {
        checkPasses: false,
        metadata: [{ issues: 'Some ARIA command names are not descriptive.' }],
      },
      ariaHiddenFocus: { checkPasses: true, metadata: {} },
      ariaInputFieldName: { checkPasses: true, metadata: {} },
      ariaMeterName: { checkPasses: true, metadata: {} },
      ariaProgressbarName: { checkPasses: true, metadata: {} },
      ariaRequiredChildren: { checkPasses: true, metadata: {} },
      ariaRequiredParent: { checkPasses: true, metadata: {} },
      ariaRoledescription: { checkPasses: true, metadata: {} },
      ariaToggleFieldName: {
        checkPasses: false,
        metadata: {
          issues: ['Inconsistent ARIA toggle field names and labels.'],
        },
      },
      ariaTooltipName: { checkPasses: true, metadata: {} },
      audioCaption: {
        checkPasses: false,
        metadata: { issues: 'Some audio elements lack captions.' },
      },
      blink: { checkPasses: true, metadata: {} },
      definitionList: { checkPasses: true, metadata: {} },
      dlitem: { checkPasses: true, metadata: {} },
      duplicateIdAria: { checkPasses: true, metadata: {} },
      frameFocusableContent: { checkPasses: true, metadata: {} },
      frameTitleUnique: { checkPasses: true, metadata: {} },
      frameTitle: { checkPasses: true, metadata: {} },
      htmlXmlLangMismatch: { checkPasses: true, metadata: {} },
      imageAlt: { checkPasses: true, metadata: {} },
      inputButtonName: { checkPasses: true, metadata: {} },
      inputImageAlt: { checkPasses: true, metadata: {} },
      linkInTextBlock: { checkPasses: true, metadata: {} },
      list: { checkPasses: true, metadata: {} },
      listitem: { checkPasses: true, metadata: {} },
      marquee: { checkPasses: true, metadata: {} },
      metaRefresh: { checkPasses: true, metadata: {} },
      objectAlt: { checkPasses: true, metadata: {} },
      roleImgAlt: { checkPasses: true, metadata: {} },
      scrollableRegionFocusable: { checkPasses: true, metadata: {} },
      selectName: { checkPasses: true, metadata: {} },
      serverSideImageMap: { checkPasses: true, metadata: {} },
      svgImgAlt: { checkPasses: true, metadata: {} },
      tdHeadersAttr: { checkPasses: true, metadata: {} },
      thHasDataCells: { checkPasses: true, metadata: {} },
      validLang: { checkPasses: true, metadata: {} },
      videoCaption: {
        checkPasses: false,
        metadata: { issues: 'Some video elements lack captions.' },
      },
      noAutoplayAudio: { checkPasses: true, metadata: {} },
      ariaAllowedAttr: { checkPasses: true, metadata: {} },
      ariaConditionalAttr: { checkPasses: true, metadata: {} },
      ariaDeprecatedRole: { checkPasses: true, metadata: {} },
      ariaHiddenBody: { checkPasses: true, metadata: {} },
      ariaProhibitedAttr: { checkPasses: true, metadata: {} },
      ariaRequiredAttr: { checkPasses: true, metadata: {} },
      ariaRoles: { checkPasses: true, metadata: {} },
      ariaValidAttrValue: { checkPasses: true, metadata: {} },
      ariaValidAttr: { checkPasses: true, metadata: {} },
      buttonName: { checkPasses: true, metadata: {} },
      colorContrast: { checkPasses: true, metadata: {} },
      documentTitle: { checkPasses: true, metadata: {} },
      formFieldMultipleLabels: { checkPasses: true, metadata: {} },
      htmlHasLang: { checkPasses: true, metadata: {} },
      htmlLangValid: { checkPasses: true, metadata: {} },
      label: { checkPasses: true, metadata: {} },
      linkName: { checkPasses: true, metadata: {} },
      metaViewport: { checkPasses: true, metadata: {} },
      nestedInteractive: { checkPasses: true, metadata: {} },
      bypass: { checkPasses: true, metadata: {} },
    },
  },
  'web-endpoint-4': {
    url: 'https://web-service-4.com',
    kind: 'Web',
    accessibility: {
      areaAlt: { checkPasses: true, metadata: {} },
      ariaBrailleEquivalent: { checkPasses: true, metadata: {} },
      ariaCommandName: { checkPasses: true, metadata: {} },
      ariaHiddenFocus: { checkPasses: true, metadata: {} },
      ariaInputFieldName: { checkPasses: true, metadata: {} },
      ariaMeterName: { checkPasses: true, metadata: {} },
      ariaProgressbarName: { checkPasses: true, metadata: {} },
      ariaRequiredChildren: { checkPasses: true, metadata: {} },
      ariaRequiredParent: {
        checkPasses: false,
        metadata: {
          issues: 'Some required parent ARIA attributes are missing.',
        },
      },
      ariaRoledescription: { checkPasses: true, metadata: {} },
      ariaToggleFieldName: { checkPasses: true, metadata: {} },
      ariaTooltipName: { checkPasses: true, metadata: {} },
      audioCaption: { checkPasses: true, metadata: {} },
      blink: { checkPasses: true, metadata: {} },
      definitionList: { checkPasses: true, metadata: {} },
      dlitem: { checkPasses: true, metadata: {} },
      duplicateIdAria: { checkPasses: true, metadata: {} },
      frameFocusableContent: { checkPasses: true, metadata: {} },
      frameTitleUnique: {
        checkPasses: false,
        metadata: { issues: 'Frame titles are not unique across the site.' },
      },
      frameTitle: { checkPasses: true, metadata: {} },
      htmlXmlLangMismatch: { checkPasses: true, metadata: {} },
      imageAlt: { checkPasses: true, metadata: {} },
      inputButtonName: { checkPasses: true, metadata: {} },
      inputImageAlt: { checkPasses: true, metadata: {} },
      linkInTextBlock: { checkPasses: true, metadata: {} },
      list: { checkPasses: true, metadata: {} },
      listitem: { checkPasses: true, metadata: {} },
      marquee: { checkPasses: true, metadata: {} },
      metaRefresh: { checkPasses: true, metadata: {} },
      objectAlt: { checkPasses: true, metadata: {} },
      roleImgAlt: { checkPasses: true, metadata: {} },
      scrollableRegionFocusable: { checkPasses: true, metadata: {} },
      selectName: { checkPasses: true, metadata: {} },
      serverSideImageMap: { checkPasses: true, metadata: {} },
      svgImgAlt: { checkPasses: true, metadata: {} },
      tdHeadersAttr: { checkPasses: true, metadata: {} },
      thHasDataCells: { checkPasses: true, metadata: {} },
      validLang: { checkPasses: true, metadata: {} },
      videoCaption: { checkPasses: true, metadata: {} },
      noAutoplayAudio: { checkPasses: true, metadata: {} },
      ariaAllowedAttr: { checkPasses: true, metadata: {} },
      ariaConditionalAttr: { checkPasses: true, metadata: {} },
      ariaDeprecatedRole: { checkPasses: true, metadata: {} },
      ariaHiddenBody: { checkPasses: true, metadata: {} },
      ariaProhibitedAttr: { checkPasses: true, metadata: {} },
      ariaRequiredAttr: { checkPasses: true, metadata: {} },
      ariaRoles: { checkPasses: true, metadata: {} },
      ariaValidAttrValue: { checkPasses: true, metadata: {} },
      ariaValidAttr: { checkPasses: true, metadata: {} },
      buttonName: { checkPasses: true, metadata: {} },
      colorContrast: { checkPasses: true, metadata: {} },
      documentTitle: { checkPasses: true, metadata: {} },
      formFieldMultipleLabels: { checkPasses: true, metadata: {} },
      htmlHasLang: { checkPasses: true, metadata: {} },
      htmlLangValid: { checkPasses: true, metadata: {} },
      label: { checkPasses: true, metadata: {} },
      linkName: { checkPasses: true, metadata: {} },
      metaViewport: { checkPasses: true, metadata: {} },
      nestedInteractive: { checkPasses: true, metadata: {} },
      bypass: { checkPasses: true, metadata: {} },
    },
  },
}

module.exports = {
  servicesData,
  endpointData,
}
