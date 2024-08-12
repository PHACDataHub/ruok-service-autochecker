import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Flex, Box, Text, Heading, DataList } from '@radix-ui/themes'
import { DoubleArrowRightIcon } from '@radix-ui/react-icons'
import { servicesData } from '../assets/dummyData'
import CheckPasses from './CheckPasses'
const Service = () => {
  const { serviceName } = useParams()
  const service = servicesData.allServices.find(
    (service) => service.name === serviceName,
  )

  if (!service) {
    return <Text>The service could not be found.</Text>
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
        {service.name}
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
              Description
            </DataList.Label>
            <DataList.Value>{service.description}</DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label style={{ minWidth: '150px' }}>
              Web URL
            </DataList.Label>
            <DataList.Value>
              <Link
                to={service.webUrl}
                style={{ color: 'blue', textDecoration: 'underline' }}
              >
                {service.webUrl}
              </Link>
            </DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label style={{ minWidth: '150px' }}>
              Programming Language
            </DataList.Label>
            <DataList.Value>{service.programmingLanguage}</DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label style={{ minWidth: '150px' }}>
              License
            </DataList.Label>
            <DataList.Value>{service.license || 'N/A'}</DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label style={{ minWidth: '150px' }}>
              Visibility
            </DataList.Label>
            <DataList.Value>{service.visibility || 'N/A'}</DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </Box>

      <Heading size="3" style={{ marginTop: '24px', marginBottom: '16px' }}>
        Referencing Endpoints
      </Heading>
      <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
        {service.referencingEndpoints.map((endpoint, i) => (
          <li key={i} style={{ marginBottom: '16px' }}>
            <Link
              to={`/${service.name}/${endpoint.id}`}
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
        ))}
      </ul>

      <CheckPasses title="Hadolint Issues" checkPasses={service.hadolint} />
      <CheckPasses
        title="Vulnerability Alerts"
        checkPasses={service.vulnerabilityAlerts}
      />
      <CheckPasses
        title="Automated Security Fixes"
        checkPasses={service.automatedSecurityFixes}
      />
      <CheckPasses
        title="Dependabot YAML"
        checkPasses={service.hasDependabotYaml}
      />
      <CheckPasses title="Security MD" checkPasses={service.hasSecurityMd} />
      <CheckPasses title="Gitleaks" checkPasses={service.gitleaks} />
      <CheckPasses
        title="Trivy Repo Vulnerability"
        checkPasses={service.trivyRepoVulnerability}
      />
      <CheckPasses
        title="Branch Protection"
        checkPasses={service.branchProtection}
      />
    </Box>
  )
}

export default Service
