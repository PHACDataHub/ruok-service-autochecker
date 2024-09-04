import React from 'react';
import { Box, Heading, Text, Badge } from '@radix-ui/themes';
import { Trans } from '@lingui/macro';

const CheckPasses = ({ title, titleElement, checkPasses }) => {
  const renderHadolintIssues = (issues) => {
    const filteredIssues = issues.filter(
      (issue) => issue.rules_violated.length > 0,
    );
    if (filteredIssues.length === 0) return null;

    return (
      <Box
        style={{
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 0, 0, 0.2)',
          marginTop: '8px',
        }}
      >
        {filteredIssues.map((issue, index) => (
          <Box key={index} style={{ marginbottom: '16px' }}>
            <Text
              fontWeight="bold"
              fontSize="md"
              mb="1"
              style={{ color: '#d9534f' }}
            >
              Dockerfile: {issue.dockerfile}
            </Text>
            {issue.rules_violated.length > 0 && (
              <Box style={{ paddingLeft: '16px' }}>
                {issue.rules_violated.map((rule, ruleIndex) => (
                  <Box key={ruleIndex} style={{ marginbottom: '8px' }}>
                    <Text color="red.800" fontSize="sm">
                      <Trans>
                        {rule.message} Line {rule.line}
                      </Trans>
                    </Text>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    );
  };

  const renderGitleaksDetails = (details) => (
    <Box
      style={{
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 0, 0, 0.2)',
        marginTop: '8px',
      }}
    >
      {details.map((leak, index) => (
        <Box key={index} style={{ marginbottom: '16px' }}>
          <Box>
            <Text whitespace="pre-line" fontWeight="bold" marginbottom="4px">
              {leak.Description}
            </Text>
          </Box>
          <Text fontSize="sm" whitespace="pre-line">
            <Trans>
              \n File: {leak.File} \n Line: {leak.StartLine} - {leak.EndLine} \n
              Commit: {leak.Commit}
            </Trans>
          </Text>
        </Box>
      ))}
    </Box>
  );

  const renderTrivyVulnerabilities = (vulnerabilities) => (
    <Box
      style={{
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 0, 0, 0.3)',
        marginTop: '16px',
      }}
    >
      {vulnerabilities.map((vuln, index) => (
        <Box key={index} style={{ marginbottom: '16px' }}>
          <Text
            fontWeight="bold"
            fontSize="md"
            mb="2"
            style={{ color: '#d9534f' }}
          >
            {vuln.library} ({vuln.severity}): {vuln.title}
          </Text>
          <Box style={{ marginbottom: '8px' }}>
            <Text fontSize="sm" mb="1">
              <Trans>
                Upgrade version {vuln.installed_version} to {vuln.fixed_version}
              </Trans>
            </Text>
            <Box>
              <a
                href={vuln.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#007bff', textDecoration: 'underline' }}
              >
                <Trans>More info</Trans>
              </a>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );

  const renderBranchProtection = () => (
    <Box
      style={{
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 0, 0, 0.2)',
        marginTop: '8px',
      }}
    >
      <Text fontSize="sm" color="red.600">
        <Trans>No protection rules are configured.</Trans>
      </Text>
    </Box>
  );

  const renderSecurityMD = () => (
    <Box
      style={{
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 0, 0, 0.2)',
        marginTop: '8px',
      }}
    >
      <Text fontSize="sm" color="red.600">
        <Trans>Security documentation file is missing.</Trans>
      </Text>
    </Box>
  );

  const renderVulnerabilityAlerts = () => (
    <Box
      style={{
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 0, 0, 0.2)',
        marginTop: '8px',
      }}
    >
      <Text fontSize="sm" color="red.600">
        <Trans>Vulnerability alerts are not configured.</Trans>
      </Text>
    </Box>
  );

  const renderDependabotYAML = () => (
    <Box
      style={{
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        padding: '16px',
        borderRadius: '8px',
        border: 'rgba(255, 0, 0, 0.2)',
        marginTop: '8px',
      }}
    >
      <Text fontSize="sm" color="red.600">
        <Trans>Dependabot configuration file is missing.</Trans>
      </Text>
    </Box>
  );

  const renderAutomatedSecurityFixes = () => (
    <Box
      style={{
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 0, 0, 0.2)',
        marginTop: '8px',
      }}
    >
      <Text fontSize="sm">
        <Trans>Automated Security fixes are disabled</Trans>
      </Text>
    </Box>
  );

  const renderDefault = () => (
    <Badge color="green" variant="solid">
      <Trans>All Okay</Trans>
    </Badge>
  );

  const renderIssues = (checkPasses) => {
    if (!checkPasses) {
      return (
        <Badge color="red" variant="solid">
          <Trans>No scanner result for service</Trans>
        </Badge>
      );
    }
    const metadata = checkPasses.metadata;
    if (!(checkPasses.checkPasses === 'true')) {
      return (
        <Box>
          <Badge color="red" variant="solid">
            <Trans>Issues detected</Trans>
          </Badge>
          {title === 'Hadolint Issues' &&
            metadata &&
            renderHadolintIssues(metadata)}
          {title === 'Gitleaks' &&
            metadata &&
            renderGitleaksDetails(metadata.details)}
          {title === 'Trivy Repo Vulnerability' &&
            metadata &&
            renderTrivyVulnerabilities(metadata)}
          {title === 'Branch Protection' && renderBranchProtection()}
          {title === 'Security MD' && renderSecurityMD()}
          {title === 'Dependabot YAML' && renderDependabotYAML()}
          {title === 'Automated Security Fixes' &&
            renderAutomatedSecurityFixes(metadata)}
          {title === 'Vulnerability Alerts' && renderVulnerabilityAlerts()}
        </Box>
      );
    }

    return renderDefault();
  };
  console.log(title);
  console.log(checkPasses);
  return (
    <Box mb="4">
      <Heading size="5" mb="2">
        {titleElement}
      </Heading>
      {renderIssues(checkPasses)}
    </Box>
  );
};
export default CheckPasses;
