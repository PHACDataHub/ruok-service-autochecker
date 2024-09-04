import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Text,
  Heading,
  Link,
  Badge,
  DataList,
  Spinner,
} from '@radix-ui/themes';
import { Trans } from '@lingui/macro';
import {
  FETCH_GITHUB_URL_QUERY,
  FETCH_WEB_URL_QUERY,
} from '../GraphQL/queries';
import { useQuery, NetworkStatus } from '@apollo/client';

const containerStyle = {
  padding: '16px',
  margin: '1rem',
  borderWidth: '1px',
};

const renderAccessibilityCheck = (checkPasses) => {
  if (!checkPasses) {
    return (
      <Box>
        <Badge color="red" variant="solid">
          No scanner result for service
        </Badge>
      </Box>
    );
  }
  if (!checkPasses.checkPasses) {
    return (
      <Box style={{ marginBottom: '16px' }}>
        <Badge color="red" variant="solid">
          <Trans>Issues Detected</Trans>
        </Badge>
        <Box>
          <Box>
            <Text size="2">
              {checkPasses.metadata?.description || (
                <Trans>'No description available.'</Trans>
              )}
            </Text>
          </Box>
          {checkPasses.metadata?.helpUrl && (
            <Link
              href={checkPasses.metadata.helpUrl}
              target="_blank"
              style={{ color: '#0070f3', textDecoration: 'underline' }}
            >
              <Trans>Learn more</Trans>
            </Link>
          )}
        </Box>
      </Box>
    );
  }
  return (
    <Badge color="green" variant="solid">
      <Trans>All Okay</Trans>
    </Badge>
  );
};

const EndpointDetails = () => {
  const { endpointId } = useParams();
  const { url, kind } = useLocation().state;

  const endpoint = { endpointId, url, kind };

  const query =
    endpoint.kind == 'Web' ? FETCH_WEB_URL_QUERY : FETCH_GITHUB_URL_QUERY;
  const endpointDetails = useQuery(query, {
    variables: { url: endpoint.url },
    fetchPolicy: 'network-only',
  });

  if (endpointDetails.networkStatus === NetworkStatus.refetch)
    return <Spinner />;
  if (endpointDetails.loading) return <Spinner />;
  if (endpointDetails.error) return <pre>{error.message}</pre>;
  ('/');
  if (!endpoint) {
    return (
      <Text>
        <Trans>Endpoint not found</Trans>
      </Text>
    );
  }

  const accessibilityFields = {
    areaAlt: <Trans>Area Alt</Trans>,
    ariaBrailleEquivalent: <Trans>Aria Braille Equivalent</Trans>,
    ariaCommandName: <Trans>Aria Command Name</Trans>,
    ariaHiddenFocus: <Trans>Aria Hidden Focus</Trans>,
    ariaInputFieldName: <Trans>Aria Input Field Name</Trans>,
    ariaMeterName: <Trans>Aria Meter Name</Trans>,
    ariaProgressbarName: <Trans>Aria Progressbar Name</Trans>,
    ariaRequiredChildren: <Trans>Aria Required Children</Trans>,
    ariaRequiredParent: <Trans>Aria Required Parent</Trans>,
    ariaRoledescription: <Trans>Aria Roledescription</Trans>,
    ariaToggleFieldName: <Trans>Aria Toggle Field Name</Trans>,
    ariaTooltipName: <Trans>Aria Tooltip Name</Trans>,
    audioCaption: <Trans>Audio Caption</Trans>,
    blink: <Trans>Blink</Trans>,
    definitionList: <Trans>Definition List</Trans>,
    dlitem: <Trans>Dlitem</Trans>,
    duplicateIdAria: <Trans>Duplicate Id Aria</Trans>,
    frameFocusableContent: <Trans>Frame Focusable Content</Trans>,
    frameTitleUnique: <Trans>Frame Title Unique</Trans>,
    frameTitle: <Trans>Frame Title</Trans>,
    htmlXmlLangMismatch: <Trans>Html Xml Lang Mismatch</Trans>,
    imageAlt: <Trans>Image Alt</Trans>,
    inputButtonName: <Trans>Input Button Name</Trans>,
    inputImageAlt: <Trans>Input Image Alt</Trans>,
    linkInTextBlock: <Trans>Link In Text Block</Trans>,
    list: <Trans>List</Trans>,
    listitem: <Trans>Listitem</Trans>,
    marquee: <Trans>Marquee</Trans>,
    metaRefresh: <Trans>Meta Refresh</Trans>,
    objectAlt: <Trans>Object Alt</Trans>,
    roleImgAlt: <Trans>Role Img Alt</Trans>,
    scrollableRegionFocusable: <Trans>Scrollable Region Focusable</Trans>,
    selectName: <Trans>Select Name</Trans>,
    serverSideImageMap: <Trans>Server Side Image Map</Trans>,
    svgImgAlt: <Trans>SVG Image Alt</Trans>,
    tdHeadersAttr: <Trans>TD Headers Attr</Trans>,
    thHasDataCells: <Trans>TH Has Data Cells</Trans>,
    validLang: <Trans>Valid Lang</Trans>,
    videoCaption: <Trans>Video Caption</Trans>,
    noAutoplayAudio: <Trans>No Autoplay Audio</Trans>,
    ariaAllowedAttr: <Trans>Aria Allowed Attr</Trans>,
    ariaConditionalAttr: <Trans>Aria Conditional Attr</Trans>,
    ariaDeprecatedRole: <Trans>Aria Deprecated Role</Trans>,
    ariaHiddenBody: <Trans>Aria Hidden Body</Trans>,
    ariaProhibitedAttr: <Trans>Aria Prohibited Attr</Trans>,
    ariaRequiredAttr: <Trans>Aria Required Attr</Trans>,
    ariaRoles: <Trans>Aria Roles</Trans>,
    ariaValidAttrValue: <Trans>Aria Valid Attr Value</Trans>,
    ariaValidAttr: <Trans>Aria Valid Attr</Trans>,
    buttonName: <Trans>Button Name</Trans>,
    colorContrast: <Trans>Color Contrast</Trans>,
    documentTitle: <Trans>Document Title</Trans>,
    formFieldMultipleLabels: <Trans>Form Field Multiple Labels</Trans>,
    htmlHasLang: <Trans>HTML Has Lang</Trans>,
    htmlLangValid: <Trans>HTML Lang Valid</Trans>,
    label: <Trans>Label</Trans>,
    linkName: <Trans>Link Name</Trans>,
    metaViewport: <Trans>Meta Viewport</Trans>,
    nestedInteractive: <Trans>Nested Interactive</Trans>,
    bypass: <Trans>Bypass</Trans>,
  };

  return (
    <Box style={containerStyle}>
      <Heading size="4" style={{ marginBottom: '16px' }}>
        <Trans>Endpoint Details</Trans>
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
            <Trans>Accessibility Details</Trans>
          </Heading>
          {endpointDetails.data.webEndpoint.accessibility.length > 0 ? (
            endpointDetails.data.webEndpoint.accessibility.map(
              (accessibility) => {
                return (
                  <Box key={accessibility.url} mb="4">
                    <Heading size="4">URL : {accessibility.url}</Heading>
                    {Object.entries(accessibilityFields).map(
                      ([fieldKey, fieldTitle]) => (
                        <Box key={fieldKey} mb="4">
                          <Heading size="3" mb="2">
                            {fieldTitle}
                          </Heading>
                          {renderAccessibilityCheck(accessibility[fieldKey])}
                        </Box>
                      ),
                    )}
                  </Box>
                );
              },
            )
          ) : (
            <Heading size="3">N/A</Heading>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EndpointDetails;
