import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Flex, Box, Text, Heading, DataList, Spinner } from '@radix-ui/themes';
import { DoubleArrowRightIcon } from '@radix-ui/react-icons';
import CheckPasses from './CheckPasses';
import { useQuery, NetworkStatus } from '@apollo/client';
import { Trans } from '@lingui/macro';
import {
  FETCH_REFERENCED_ENDPOINTS_QUERY,
  FETCH_SERVICE_QUERY,
} from '../GraphQL/queries';

const Service = () => {
  const { serviceName } = useParams();
  const { data, loading, error, networkStatus } = useQuery(
    FETCH_SERVICE_QUERY,
    {
      variables: { name: serviceName },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );

  const githubEndpoint = data?.service.githubEndpoint.url;

  const referencedEndpoints = useQuery(FETCH_REFERENCED_ENDPOINTS_QUERY, {
    skip: !githubEndpoint,
    variables: { url: githubEndpoint },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  if (networkStatus === NetworkStatus.refetch) return <Spinner />;
  if (loading) return <Spinner />;
  if (error) return <pre>{error.message}</pre>;

  if (referencedEndpoints.networkStatus === NetworkStatus.refetch)
    return <Spinner />;
  if (referencedEndpoints.loading) return <Spinner />;
  if (referencedEndpoints.error) return <pre>{error.message}</pre>;

  const service = data?.service;

  if (!service) {
    return <Text>The service could not be found.</Text>;
  }

  return (
    <Box style={{ padding: '24px' }}>
      <Heading
        size="8"
        style={{
          marginTop: '16px',
          marginBottom: '24px',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        {service.url}
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
              <Trans>Description</Trans>
            </DataList.Label>
            <DataList.Value>
              {service.githubEndpoint.description || 'N/A'}
            </DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label style={{ minWidth: '150px' }}>
              <Trans>Web URL</Trans>
            </DataList.Label>
            <DataList.Value>
              <Link
                to={service.webEndpoint.url}
                style={{ color: 'blue', textDecoration: 'underline' }}
              >
                {service.webEndpoint.url}
              </Link>
            </DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label style={{ minWidth: '150px' }}>
              <Trans>Programming Language(s)</Trans>
            </DataList.Label>
            <DataList.Value>
              {service.githubEndpoint.programmingLanguage.join(', ')}
            </DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label style={{ minWidth: '150px' }}>
              <Trans> License</Trans>
            </DataList.Label>
            <DataList.Value>
              {(service.githubEndpoint.license == 'null'
                ? 'N/A'
                : service.githubEndpoint.license) || 'N/A'}
            </DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label style={{ minWidth: '150px' }}>
              <Trans> Visibility</Trans>
            </DataList.Label>
            <DataList.Value>
              {service.githubEndpoint.visibility || 'N/A'}
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </Box>

      <Heading size="3" style={{ marginTop: '24px', marginBottom: '16px' }}>
        <Trans> Referencing Endpoints</Trans>
      </Heading>
      <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
        {referencedEndpoints.data !== undefined ? (
          []
            .concat(
              service.webEndpoint,
              referencedEndpoints.data.referencedEndpoints,
            )
            .map((endpoint, i) => (
              <li key={i} style={{ marginBottom: '16px' }}>
                <Link
                  to={`/${service.url}/${endpoint.Key}`}
                  state={{ url: endpoint.url, kind: endpoint.kind }}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Flex
                    align="center"
                    justify="between"
                    style={{
                      padding: '12px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <Text>{endpoint.url}</Text>
                    <DoubleArrowRightIcon />
                  </Flex>
                </Link>
              </li>
            ))
        ) : (
          <>Loading...</>
        )}
      </ul>

      <CheckPasses
        title="Hadolint Issues"
        titleElement={<Trans>Hadolint Issues</Trans>}
        checkPasses={service.githubEndpoint.hadolint}
      />
      <CheckPasses
        title="Vulnerability Alerts"
        titleElement={<Trans>Vulnerability Alerts</Trans>}
        checkPasses={service.githubEndpoint.vulnerabilityAlerts}
      />
      <CheckPasses
        title="Automated Security Fixes"
        titleElement={<Trans>Automated Security Fixes</Trans>}
        checkPasses={service.githubEndpoint.automatedSecurityFixes}
      />
      <CheckPasses
        title="Dependabot YAML"
        titleElement={<Trans>Dependabot YAML</Trans>}
        checkPasses={service.githubEndpoint.hasDependabotYaml}
      />
      <CheckPasses
        title="Security MD"
        titleElement={<Trans>Security MD</Trans>}
        checkPasses={service.githubEndpoint.hasSecurityMd}
      />
      <CheckPasses
        title="Gitleaks"
        titleElement={<Trans>Gitleaks</Trans>}
        checkPasses={service.githubEndpoint.gitleaks}
      />
      <CheckPasses
        title="Trivy Repo Vulnerability"
        titleElement={<Trans>Trivy Repo Vulnerability</Trans>}
        checkPasses={service.githubEndpoint.trivyRepoVulnerability}
      />
      <CheckPasses
        title="Branch Protection"
        titleElement={<Trans>Branch Protection</Trans>}
        checkPasses={service.githubEndpoint.branchProtection}
      />
    </Box>
  );
};

export default Service;
