import React from 'react';
import { Box, Heading, Text, Badge } from '@radix-ui/themes';

const CheckPasses = ({ title, checkPasses }) => {
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
          <Box key={index} style={{ marginBottom: '16px' }}>
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
                  <Box key={ruleIndex} style={{ marginBottom: '8px' }}>
                    <Text color="red.800" fontSize="sm">
                      {rule.message} (Line {rule.line})
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
        <Box key={index} style={{ marginBottom: '8px' }}>
          <Text fontWeight="bold">{leak.Description}</Text>
          <Text fontSize="sm">
            File: {leak.File}, Line: {leak.StartLine}-{leak.EndLine}, Commit:{' '}
            {leak.Commit}
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
        <Box key={index} style={{ marginBottom: '16px' }}>
          <Text
            fontWeight="bold"
            fontSize="md"
            mb="2"
            style={{ color: '#d9534f' }}
          >
            {vuln.library} ({vuln.severity}): {vuln.title}
          </Text>
          <Box style={{ marginBottom: '8px' }}>
            <Text fontSize="sm" mb="1">
              {`Upgrade version ${vuln.installed_version} to ${vuln.fixed_version}`}
            </Text>
            <Box>
              <a
                href={vuln.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#007bff', textDecoration: 'underline' }}
              >
                More info
              </a>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );

  const renderBranchProtection = (metadata) => (
    <Box
      style={{
        backgroundColor:
          metadata.rules.length > 0
            ? 'rgba(0, 255, 0, 0.1)'
            : 'rgba(255, 0, 0, 0.1)',
        padding: '16px',
        borderRadius: '8px',
        border: `1px solid ${metadata.rules.length > 0 ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)'}`,
        marginTop: '8px',
      }}
    >
      {metadata.rules.length > 0 ? (
        <Text fontSize="sm">Protection rules are correctly applied.</Text>
      ) : (
        <Text fontSize="sm" color="red.600">
          No protection rules are configured.
        </Text>
      )}
    </Box>
  );

  const renderSecurityMD = () => (
    <Box
      style={{
        backgroundColor: metadata
          ? 'rgba(0, 255, 0, 0.1)'
          : 'rgba(255, 0, 0, 0.1)',
        padding: '16px',
        borderRadius: '8px',
        border: `1px solid ${metadata ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)'}`,
        marginTop: '8px',
      }}
    >
      <Text fontSize="sm" color="red.600">
        Security documentation file is missing.
      </Text>
    </Box>
  );

  const renderDependabotYAML = () => (
    <Box
      style={{
        backgroundColor: metadata
          ? 'rgba(0, 255, 0, 0.1)'
          : 'rgba(255, 0, 0, 0.1)',
        padding: '16px',
        borderRadius: '8px',
        border: `1px solid ${metadata ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)'}`,
        marginTop: '8px',
      }}
    >
      <Text fontSize="sm" color="red.600">
        Dependabot configuration file is missing.
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
      <Text fontSize="sm">Automated Security fixes are disabled</Text>
    </Box>
  );

  const renderDefault = () => (
    <Badge color="green" variant="solid">
      All Okay
    </Badge>
  );

  const renderIssues = (checkPasses) => {
    if (!checkPasses) {
      return (
        <Badge color="red" variant="solid">
          No scanner result for service
        </Badge>
      );
    }
    const metadata = checkPasses.metadata;
    if (!(checkPasses.checkPasses === "true") && metadata)
      return (
        <Box>
          <Badge color="red" variant="solid">
            Issues detected
          </Badge>
          {title === 'Hadolint Issues' && renderHadolintIssues(metadata)}
          {title === 'Gitleaks' && renderGitleaksDetails(metadata.details)}
          {title === 'Trivy Repo Vulnerability' &&
            renderTrivyVulnerabilities(metadata)}
          {title === 'Branch Protection' && renderBranchProtection(metadata)}
          {title === 'Security.md' && renderSecurityMD(checkPasses)}
          {title === 'Dependabot YAML' && renderDependabotYAML()}
          {title === 'Automated Security Fixes' &&
            renderAutomatedSecurityFixes(metadata)}
        </Box>
      );

    return renderDefault();
  };

  return (
    <Box mb="4">
      <Heading size="5" mb="2">
        {title}
      </Heading>
      {renderIssues(checkPasses)}
    </Box>
  );
};
export default CheckPasses;
