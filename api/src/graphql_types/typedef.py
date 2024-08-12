from typing import NewType, List, Optional

import strawberry


@strawberry.type
class Endpoint:
    url: str
    kind: Optional[str] = None

@strawberry.type
class Edge:
    _key: str = None
    _id: str = None
    from_url : Endpoint
    to_url : Endpoint

JSON = strawberry.scalar(
    NewType("JSON", object),
    description="The `JSON` scalar type represents JSON values as specified by ECMA-404",
    serialize=lambda v: v,
    parse_value=lambda v: v,
)


@strawberry.type
class CheckPasses:
    check_passes: Optional[bool]
    metadata: Optional[JSON] = None

@strawberry.type
class AccessibilityCheckPasses:
    check_passes: Optional[str]  # true, false, incomplete, or null
    metadata: Optional[JSON] = None
 
@strawberry.type
class GithubEndpoint(Endpoint):
    url: str
    kind: Optional[str] = None
    _key: str
    owner: Optional[str] = None
    repo: Optional[str] = None
    license: Optional[str] = None
    api: Optional[bool] = None
    visibility: Optional[str] = None
    description: Optional[str] = None
    programming_language: Optional[List[str]] = None
    automated_security_fixes: Optional[CheckPasses] = None
    vulnerability_alerts: Optional[CheckPasses] = None
    branch_protection: Optional[CheckPasses] = None
    has_security_md: Optional[CheckPasses] = None
    has_dependabot_yaml: Optional[CheckPasses] = None
    gitleaks: Optional[CheckPasses] = None
    hadolint: Optional[CheckPasses] = None
    trivy_repo_vulnerability: Optional[CheckPasses] = None

@strawberry.type
class Accessibility:
    url: str
    area_alt: Optional[CheckPasses]
    aria_braille_equivalent: Optional[CheckPasses]
    aria_command_name: Optional[CheckPasses]
    aria_hidden_focus: Optional[CheckPasses]
    aria_input_field_name: Optional[CheckPasses]
    aria_meter_name: Optional[CheckPasses]
    aria_progressbar_name: Optional[CheckPasses]
    aria_required_children: Optional[CheckPasses]
    aria_required_parent: Optional[CheckPasses]
    aria_roledescription: Optional[CheckPasses]
    aria_toggle_field_name: Optional[CheckPasses]
    aria_tooltip_name: Optional[CheckPasses]
    audio_caption: Optional[CheckPasses]
    blink: Optional[CheckPasses]
    definition_list: Optional[CheckPasses]
    dlitem: Optional[CheckPasses]
    duplicate_id_aria: Optional[CheckPasses]
    frame_focusable_content: Optional[CheckPasses]
    frame_title_unique: Optional[CheckPasses]
    frame_title: Optional[CheckPasses]
    html_xml_lang_mismatch: Optional[CheckPasses]
    imageAlt: Optional[CheckPasses]
    input_button_name: Optional[CheckPasses]
    input_image_alt: Optional[CheckPasses]
    link_in_text_block: Optional[CheckPasses]
    list: Optional[CheckPasses]
    listitem: Optional[CheckPasses]
    marquee: Optional[CheckPasses]
    meta_refresh: Optional[CheckPasses]
    object_alt: Optional[CheckPasses]
    role_img_alt: Optional[CheckPasses]
    scrollable_region_focusable: Optional[CheckPasses]
    select_name: Optional[CheckPasses]
    server_side_image_map: Optional[CheckPasses] 
    svg_img_alt: Optional[CheckPasses] 
    td_headers_attr: Optional[CheckPasses]
    th_has_data_cells: Optional[CheckPasses]
    valid_lang: Optional[CheckPasses] 
    video_caption: Optional[CheckPasses] 
    no_autoplay_audio: Optional[CheckPasses] 
    aria_allowed_attr: Optional[CheckPasses] 
    aria_conditional_attr: Optional[CheckPasses] 
    aria_deprecated_role: Optional[CheckPasses] 
    aria_hidden_body: Optional[CheckPasses] 
    aria_prohibited_attr: Optional[CheckPasses] 
    aria_required_attr: Optional[CheckPasses] 
    aria_roles: Optional[CheckPasses] 
    aria_valid_attr_value: Optional[CheckPasses] 
    aria_valid_attr: Optional[CheckPasses] 
    button_name: Optional[CheckPasses] 
    color_contrast: Optional[CheckPasses] 
    document_title: Optional[CheckPasses] 
    form_field_multiple_labels: Optional[CheckPasses] 
    html_has_lang: Optional[CheckPasses] 
    html_lang_valid: Optional[CheckPasses] 
    label: Optional[CheckPasses] 
    linkName: Optional[CheckPasses] 
    meta_viewport: Optional[CheckPasses] 
    nested_interactive: Optional[CheckPasses] 
    bypass: Optional[CheckPasses] 

@strawberry.type
class WebEndpoint(Endpoint):
    url: str
    kind: str
    _key: str
    accessibility: Optional[List[Accessibility]]

@strawberry.type
class Service(Endpoint):
    url: str
    kind: str
    _key: str
    webEndpoint : Optional[WebEndpoint] = None
    githubEndpoint : Optional[GithubEndpoint] = None