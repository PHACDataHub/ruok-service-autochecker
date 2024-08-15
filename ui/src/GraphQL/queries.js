import { gql } from "@apollo/client";

export const ALL_ENDPOINTS_QUERY = gql`
    query ALLENDPOINTS 
    { 
        allEndpoints { 
            url 
            kind
        }
    }
`;

export const FETCH_GITHUB_URL_QUERY = gql`
    query FETCH_GITHUB_URL($url: String!)
    {
        githubEndpoint(url: $url) {
            url
            kind
            license
            visibility
            owner
            repo
            Key
            automatedSecurityFixes {
            checkPasses
            metadata
            }
            branchProtection {
            checkPasses
            metadata
            }
            programmingLanguage
            description
            gitleaks {
            checkPasses
            metadata
            }
            hadolint {
            checkPasses
            metadata
            }
            hasDependabotYaml {
            checkPasses
            metadata
            }
            hasSecurityMd {
            checkPasses
            metadata
            }
            vulnerabilityAlerts {
            checkPasses
            metadata
            }
        }
    }
`

export const FETCH_WEB_URL_QUERY = gql`
    query FETCH_WEB_URL($url: String!)
    {
        webEndpoint(url: $url) {
            url
            kind
            accessibility {
                url
                areaAlt { 
                    checkPasses 
                    metadata 
                }
                ariaBrailleEquivalent {
					checkPasses
					metadata
				}
                ariaCommandName {
					checkPasses
					metadata
				}
                ariaHiddenFocus {
					checkPasses
					metadata
				}
                ariaInputFieldName {
					checkPasses
					metadata
				}
                ariaMeterName {
					checkPasses
					metadata
				}
                ariaProgressbarName{
					checkPasses
					metadata
				}
                ariaRequiredChildren {
					checkPasses
					metadata
				}
                ariaRequiredParent {
                    checkPasses
                    metadata
                }
                ariaRoledescription {
					checkPasses
					metadata
				}
                ariaToggleFieldName {
					checkPasses
					metadata
				}
                ariaTooltipName {
					checkPasses
					metadata
				}
                audioCaption {
					checkPasses
					metadata
				}
                blink {
					checkPasses
					metadata
				}
                definitionList {
					checkPasses
					metadata
				}
                dlitem {
					checkPasses
					metadata
				}
                duplicateIdAria {
					checkPasses
					metadata
				}
                frameFocusableContent {
					checkPasses
					metadata
				}
                frameTitleUnique {
                    checkPasses
                    metadata
                }
                frameTitle {
					checkPasses
					metadata
				}
                htmlXmlLangMismatch {
					checkPasses
					metadata
				}
                imageAlt {
					checkPasses
					metadata
				}
                inputButtonName {
					checkPasses
					metadata
				}
                inputImageAlt {
					checkPasses
					metadata
				}
                linkInTextBlock {
					checkPasses
					metadata
				}
                list {
					checkPasses
					metadata
				}
                listitem {
					checkPasses
					metadata
				}
                marquee {
					checkPasses
					metadata
				}
                metaRefresh {
					checkPasses
					metadata
				}
                objectAlt {
					checkPasses
					metadata
				}
                roleImgAlt {
					checkPasses
					metadata
				}
                scrollableRegionFocusable {
					checkPasses
					metadata
				}
                selectName {
					checkPasses
					metadata
				}
                serverSideImageMap {
					checkPasses
					metadata
				}
                svgImgAlt {
					checkPasses
					metadata
				}
                tdHeadersAttr {
					checkPasses
					metadata
				}
                thHasDataCells {
					checkPasses
					metadata
				}
                validLang {
					checkPasses
					metadata
				}
                videoCaption {
					checkPasses
					metadata
				}
                noAutoplayAudio {
					checkPasses
					metadata
				}
                ariaAllowedAttr {
					checkPasses
					metadata
				}
                ariaConditionalAttr {
					checkPasses
					metadata
				}
                ariaDeprecatedRole {
					checkPasses
					metadata
				}
                ariaHiddenBody {
					checkPasses
					metadata
				}
                ariaProhibitedAttr {
					checkPasses
					metadata
				}
                ariaRequiredAttr {
					checkPasses
					metadata
				}
                ariaRoles {
					checkPasses
					metadata
				}
                ariaValidAttrValue {
					checkPasses
					metadata
				}
                ariaValidAttr {
					checkPasses
					metadata
				}
                buttonName {
					checkPasses
					metadata
				}
                colorContrast {
					checkPasses
					metadata
				}
                documentTitle {
					checkPasses
					metadata
				}
                formFieldMultipleLabels {
					checkPasses
					metadata
				}
                htmlHasLang {
					checkPasses
					metadata
				}
                htmlLangValid {
					checkPasses
					metadata
				}
                label {
					checkPasses
					metadata
				}
                linkName {
					checkPasses
					metadata
				}
                metaViewport {
					checkPasses
					metadata
				}
                nestedInteractive {
					checkPasses
					metadata
				}
                bypass {
					checkPasses
					metadata
				}
            }
        }
    }
`

export const FETCH_RELATED_ENDPOINTS_QUERY = gql`
    query FETCH_RELATED_ENDPOINTS($url: String!)
    {
        endpoints(urls: [$url]) {
            url
        }
    }
`

export const FETCH_REFERENCED_ENDPOINTS_QUERY = gql`
    query FETCH_REFERENCED_ENDPOINTS_QUERY($url: String!)
    {
        referencedEndpoints(url: $url) {
            kind
            url
            Key
        }
    }
`

export const FETCH_SERVICE_QUERY = gql`
    query FETCH_SERVICE_QUERY($name: String!)
    {
        service(name: $name) {
            url
            githubEndpoint {
                url
                license
                visibility
                programmingLanguage
                api
                description
                automatedSecurityFixes {
                    checkPasses
                    metadata
                }
                branchProtection {
                    checkPasses
                    metadata
                }
                gitleaks {
                    checkPasses
                    metadata
                }
                hadolint {
                    checkPasses
                    metadata
                }
                hasDependabotYaml {
                    checkPasses
                    metadata
                }
                trivyRepoVulnerability {
                    checkPasses
                    metadata
                }
                vulnerabilityAlerts {
                    checkPasses
                    metadata
                }
                hasSecurityMd {
                    checkPasses
                    metadata
                }
            }
            webEndpoint {
                Key
                url
                kind
            }
        }
    }
`

export const FILTER_QUERY = gql`
    query FILTER_QUERY($kind: String!)
    {
        filter(criteria: {kind: $kind}){
            url
        }
    }
`