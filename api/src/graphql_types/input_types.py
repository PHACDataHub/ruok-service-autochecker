from typing import List, Optional

import strawberry

from graphql_types.typedef import JSON

@strawberry.input
class CheckPassesInput:
    check_passes: Optional[bool] = None
    metadata: Optional[JSON] = None

# TODO: we should find a more elegant want to unify this. The issue is that
# the AXE accessibility reports have true/false/incomplete/null, where
# incomplete isn't a boolean, but indicates that the accessibility check can't
# be automated because human judgement is required.
@strawberry.input
class AccessibilityCheckPassesInput:
    check_passes: Optional[str] = None  # true, false, incomplete, or null
    metadata: Optional[JSON] = None

@strawberry.input
class EndpointInput:
    url: str
    kind: Optional[str] = None

@strawberry.input
class FilterCriteriaInput:
    url: Optional[str] = None
    kind: Optional[str] = None

@strawberry.input
class GithubEndpointInput:
    url: str
    kind: str
    owner: str
    repo: str
    description: Optional[str] = None
    visibility: Optional[str] = None
    license: Optional[str] = None
    api: Optional[bool] = None
    security_and_analysis: Optional[str] = None
    programming_language: Optional[List[str]] = None
    automated_security_fixes: Optional[CheckPassesInput] = None
    vulnerability_alerts: Optional[CheckPassesInput] = None
    branch_protection: Optional[CheckPassesInput] = None
    has_security_md: Optional[CheckPassesInput] = None
    has_dependabot_yaml: Optional[CheckPassesInput] = None
    gitleaks: Optional[CheckPassesInput] = None  
    hadolint: Optional[CheckPassesInput] = None 
    trivy_repo_vulnerability: Optional[CheckPassesInput] = None                                       


@strawberry.input
class AccessibilityInput:
    url: str
    area_alt: Optional[AccessibilityCheckPassesInput] = None
    aria_braille_equivalent: Optional[AccessibilityCheckPassesInput] = None
    aria_command_name: Optional[AccessibilityCheckPassesInput] = None
    aria_hidden_focus: Optional[AccessibilityCheckPassesInput] = None
    aria_input_field_name: Optional[AccessibilityCheckPassesInput] = None
    aria_meter_name: Optional[AccessibilityCheckPassesInput] = None
    aria_progressbar_name: Optional[AccessibilityCheckPassesInput] = None
    aria_required_children: Optional[AccessibilityCheckPassesInput] = None
    aria_required_parent: Optional[AccessibilityCheckPassesInput] = None
    aria_roledescription: Optional[AccessibilityCheckPassesInput] = None
    aria_toggle_field_name: Optional[AccessibilityCheckPassesInput] = None
    aria_tooltip_name: Optional[AccessibilityCheckPassesInput] = None
    audio_caption: Optional[AccessibilityCheckPassesInput] = None
    blink: Optional[AccessibilityCheckPassesInput] = None
    definition_list: Optional[AccessibilityCheckPassesInput] = None
    dlitem: Optional[AccessibilityCheckPassesInput] = None
    duplicate_id_aria: Optional[AccessibilityCheckPassesInput] = None
    frame_focusable_content: Optional[AccessibilityCheckPassesInput] = None
    frame_title_unique: Optional[AccessibilityCheckPassesInput] = None
    frame_title: Optional[AccessibilityCheckPassesInput] = None
    html_xml_lang_mismatch: Optional[AccessibilityCheckPassesInput] = None
    imageAlt: Optional[AccessibilityCheckPassesInput] = None
    input_button_name: Optional[AccessibilityCheckPassesInput] = None
    input_image_alt: Optional[AccessibilityCheckPassesInput] = None
    link_in_text_block: Optional[AccessibilityCheckPassesInput] = None
    list: Optional[AccessibilityCheckPassesInput] = None
    listitem: Optional[AccessibilityCheckPassesInput] = None
    marquee: Optional[AccessibilityCheckPassesInput] = None
    meta_refresh: Optional[AccessibilityCheckPassesInput] = None
    object_alt: Optional[AccessibilityCheckPassesInput] = None
    role_img_alt: Optional[AccessibilityCheckPassesInput] = None
    scrollable_region_focusable: Optional[AccessibilityCheckPassesInput] = None
    select_name: Optional[AccessibilityCheckPassesInput] = None
    server_side_image_map: Optional[AccessibilityCheckPassesInput] = None
    svg_img_alt: Optional[AccessibilityCheckPassesInput] = None
    td_headers_attr: Optional[AccessibilityCheckPassesInput] = None
    th_has_data_cells: Optional[AccessibilityCheckPassesInput] = None
    valid_lang: Optional[AccessibilityCheckPassesInput] = None
    video_caption: Optional[AccessibilityCheckPassesInput] = None
    no_autoplay_audio: Optional[AccessibilityCheckPassesInput] = None
    aria_allowed_attr: Optional[AccessibilityCheckPassesInput] = None
    aria_conditional_attr: Optional[AccessibilityCheckPassesInput] = None
    aria_deprecated_role: Optional[AccessibilityCheckPassesInput] = None
    aria_hidden_body: Optional[AccessibilityCheckPassesInput] = None
    aria_prohibited_attr: Optional[AccessibilityCheckPassesInput] = None
    aria_required_attr: Optional[AccessibilityCheckPassesInput] = None
    aria_roles: Optional[AccessibilityCheckPassesInput] = None
    aria_valid_attr_value: Optional[AccessibilityCheckPassesInput] = None
    aria_valid_attr: Optional[AccessibilityCheckPassesInput] = None
    button_name: Optional[AccessibilityCheckPassesInput] = None
    color_contrast: Optional[AccessibilityCheckPassesInput] = None
    document_title: Optional[AccessibilityCheckPassesInput] = None
    form_field_multiple_labels: Optional[AccessibilityCheckPassesInput] = None
    html_has_lang: Optional[AccessibilityCheckPassesInput] = None
    html_lang_valid: Optional[AccessibilityCheckPassesInput] = None
    label: Optional[AccessibilityCheckPassesInput] = None
    linkName: Optional[AccessibilityCheckPassesInput] = None
    meta_viewport: Optional[AccessibilityCheckPassesInput] = None
    nested_interactive: Optional[AccessibilityCheckPassesInput] = None
    bypass: Optional[AccessibilityCheckPassesInput] = None


@strawberry.input
class WebEndpointInput:
    url: str
    kind: str
    accessibility: Optional[List[AccessibilityInput]] = None

@strawberry.input
class ServiceInput:
    url: str
    kind: str = "Service"
    repoEndpoint : Optional[str] = None
    webEndpoint : Optional[str] = None

