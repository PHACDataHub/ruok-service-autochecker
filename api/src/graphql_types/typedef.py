from typing import NewType, List, Optional

import strawberry


@strawberry.type
class Endpoint:
    url: str


JSON = strawberry.scalar(
    NewType("JSON", object),
    description="The `JSON` scalar type represents JSON values as specified by ECMA-404",
    serialize=lambda v: v,
    parse_value=lambda v: v,
)


@strawberry.type
class CheckPasses:
    check_passes: Optional[bool]
    metadata: Optional[JSON]

@strawberry.type
class AccessibilityCheckPasses:
    check_passes: Optional[str]  # true, false, incomplete, or null
    metadata: Optional[JSON]

@strawberry.type
class GithubEndpoint(Endpoint):
    url: str
    kind: str
    _key: str
    owner: str
    repo: str
    license: str
    visibility: str
    programming_language: List[str]
    automated_security_fixes: CheckPasses
    vulnerability_alerts: CheckPasses
    branch_protection: CheckPasses
    has_security_md: CheckPasses
    has_dependabot_yaml: CheckPasses
    gitleaks: CheckPasses

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
