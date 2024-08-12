import React from 'react'
import { useParams } from 'react-router-dom'
import { Box, Text, Heading, Link, Badge, DataList } from '@radix-ui/themes'
import { endpointData } from '../assets/dummyData'

const containerStyle = {
  padding: '16px',
  margin: '1rem',
  borderWidth: '1px',
}

const renderAccessibilityCheck = (checkPasses) => {
  if (!checkPasses) {
    return (
      <Box>
        <Badge color="red" variant="solid">
          No scanner result for service
        </Badge>
      </Box>
    )
  }
  if (!checkPasses.checkPasses) {
    return (
      <Box style={{ marginBottom: '16px' }}>
        <Badge color="red" variant="solid">
          Issues Detected
        </Badge>
        <Box>
          <Box>
            <Text size="2">
              {checkPasses.metadata?.description || 'No description available.'}
            </Text>
          </Box>
          {checkPasses.metadata?.helpUrl && (
            <Link
              href={checkPasses.metadata.helpUrl}
              target="_blank"
              style={{ color: '#0070f3', textDecoration: 'underline' }}
            >
              Learn more
            </Link>
          )}
        </Box>
      </Box>
    )
  }
  return (
    <Badge color="green" variant="solid">
      All Okay
    </Badge>
  )
}

const EndpointDetails = () => {
  const { endpointId } = useParams()
  const endpoint = endpointData[endpointId]

  if (!endpoint) {
    return <Text>Endpoint not found</Text>
  }

  const accessibilityFields = {
    areaAlt: 'Area Alt',
    ariaBrailleEquivalent: 'Aria Braille Equivalent',
    ariaCommandName: 'Aria Command Name',
    ariaHiddenFocus: 'Aria Hidden Focus',
    ariaInputFieldName: 'Aria Input Field Name',
    ariaMeterName: 'Aria Meter Name',
    ariaProgressbarName: 'Aria Progressbar Name',
    ariaRequiredChildren: 'Aria Required Children',
    ariaRequiredParent: 'Aria Required Parent',
    ariaRoledescription: 'Aria Roledescription',
    ariaToggleFieldName: 'Aria Toggle Field Name',
    ariaTooltipName: 'Aria Tooltip Name',
    audioCaption: 'Audio Caption',
    blink: 'Blink',
    definitionList: 'Definition List',
    dlitem: 'Dlitem',
    duplicateIdAria: 'Duplicate Id Aria',
    frameFocusableContent: 'Frame Focusable Content',
    frameTitleUnique: 'Frame Title Unique',
    frameTitle: 'Frame Title',
    htmlXmlLangMismatch: 'Html Xml Lang Mismatch',
    imageAlt: 'Image Alt',
    inputButtonName: 'Input Button Name',
    inputImageAlt: 'Input Image Alt',
    linkInTextBlock: 'Link In Text Block',
    list: 'List',
    listitem: 'Listitem',
    marquee: 'Marquee',
    metaRefresh: 'Meta Refresh',
    objectAlt: 'Object Alt',
    roleImgAlt: 'Role Img Alt',
    scrollableRegionFocusable: 'Scrollable Region Focusable',
    selectName: 'Select Name',
    serverSideImageMap: 'Server Side Image Map',
    svgImgAlt: 'SVG Image Alt',
    tdHeadersAttr: 'TD Headers Attr',
    thHasDataCells: 'TH Has Data Cells',
    validLang: 'Valid Lang',
    videoCaption: 'Video Caption',
    noAutoplayAudio: 'No Autoplay Audio',
    ariaAllowedAttr: 'Aria Allowed Attr',
    ariaConditionalAttr: 'Aria Conditional Attr',
    ariaDeprecatedRole: 'Aria Deprecated Role',
    ariaHiddenBody: 'Aria Hidden Body',
    ariaProhibitedAttr: 'Aria Prohibited Attr',
    ariaRequiredAttr: 'Aria Required Attr',
    ariaRoles: 'Aria Roles',
    ariaValidAttrValue: 'Aria Valid Attr Value',
    ariaValidAttr: 'Aria Valid Attr',
    buttonName: 'Button Name',
    colorContrast: 'Color Contrast',
    documentTitle: 'Document Title',
    formFieldMultipleLabels: 'Form Field Multiple Labels',
    htmlHasLang: 'HTML Has Lang',
    htmlLangValid: 'HTML Lang Valid',
    label: 'Label',
    linkName: 'Link Name',
    metaViewport: 'Meta Viewport',
    nestedInteractive: 'Nested Interactive',
    bypass: 'Bypass',
  }

  return (
    <Box style={containerStyle}>
      <Heading size="4" style={{ marginBottom: '16px' }}>
        Endpoint Details
      </Heading>
      <Box
        style={{
          marginBottom: '24px',
          padding: '20px',
          borderWidth: '1px',
          borderRadius: '8px',
          backgroundColor: 'rgba(0, 0, 255, 0.1)',
        }}
      >
        <DataList.Root>
          <DataList.Item>
            <DataList.Label style={{ minWidth: '150px' }}>
              Endpoint ID
            </DataList.Label>
            <DataList.Value>{endpointId}</DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label style={{ minWidth: '150px' }}>Kind</DataList.Label>
            <DataList.Value>{endpoint.kind}</DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label style={{ minWidth: '150px' }}>URL</DataList.Label>
            <DataList.Value>{endpoint.url}</DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </Box>

      {endpoint.kind === 'Web' && (
        <Box>
          <Heading size="5" style={{ marginBottom: '8px' }}>
            Accessibility Details
          </Heading>
          {Object.entries(accessibilityFields).map(([fieldKey, fieldTitle]) => (
            <Box key={fieldKey} mb="4">
              <Heading size="3" mb="2">
                {fieldTitle}
              </Heading>
              {renderAccessibilityCheck(endpoint.accessibility[fieldKey])}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default EndpointDetails
