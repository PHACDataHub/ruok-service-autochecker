import { React, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Flex, Box, Text, Heading, DataList, Spinner, Separator, Select } from '@radix-ui/themes';
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
  const [ uptime,setUptime ] = useState([]);
  const [ uptimeKind,setUptimeKind ] = useState(2);
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

  const fetchUptime = () => {
    let doc = '';
    let data = [];
    let respTimeMap = { 0 : "", 1 : "-day", 2 : "-week", 3 : "-month", 4 : "-year"};
    fetch('/uptime',{mode: "cors",referrerPolicy: "unsafe-url"}).then(function (response) {
        // The API call was successful!
        return response.text();
      }).then(function (html) {

        // Convert the HTML string into a document object
        let parser = new DOMParser();
        doc =  parser.parseFromString(html, 'text/html');
        let trs = doc.getElementsByTagName("table")[1].tBodies[0].getElementsByTagName("tr");
        Array.prototype.slice.call(trs).forEach(tr => {
            let statusString = tr.children[1].innerText;
            let serviceName = tr.children[2].innerText.split(/\.y.*ml/)[0];
            let responseTimes = [];
            let url = `https://raw.githubusercontent.com/niranjan-ramesh/upptime/master/graphs/${serviceName}/response-time`;
            for(let idx = 1;idx <= 5;idx++){
              let responseTime = tr.children[3].getElementsByTagName("a")[idx].firstChild.alt.split(" ").slice(-1)[0]; 
              responseTimes.push([responseTime,url+respTimeMap[idx-1]+'.png']);
            }
            // console.table(statusString,serviceName,responseTimes);
            data.push([statusString,serviceName,responseTimes]);
        });
        // console.log(data);
        let uptimeData = data.filter(el => el[1] === serviceName);
        setUptime((prevUptime) => uptimeData);
      }).catch(function (err) {
        // There was an error
        console.warn('Something went wrong.', err);
      });
  }

  useEffect(() => {
      console.log("inside use effect",uptime);
      fetchUptime();
      const interval = setInterval(() => {
        fetchUptime();
      }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
              <Flex gap="3" align="center">
                <Link
                  to={service.webEndpoint.url}
                  style={{ color: 'blue', textDecoration: 'underline' }}
                >
                  {service.webEndpoint.url}
                </Link>
                <Separator  orientation="vertical"/>
                {uptime.length > 0 ? uptime[0][0] : "NA"}
              </Flex>
            </DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label style={{ minWidth: '150px' }}>
              <Trans>Github Repo URL</Trans>
            </DataList.Label>
            <DataList.Value>
              <Flex gap="3" align="center">
                <Link
                  to={service.githubEndpoint.url}
                  style={{ color: 'blue', textDecoration: 'underline' }}
                >
                  {service.githubEndpoint.url}
                </Link>
              </Flex>
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
          <DataList.Item>
            <DataList.Label style={{ minWidth: '150px' }}>
              <Trans> Response Time</Trans>
            </DataList.Label>
            <DataList.Value>
              <Flex gap="3" align="center">
                <Link
                  to="https://niranjan-ramesh.github.io/upptime/"
                  style={{ color: 'blue', textDecoration: 'underline' }}
                >
                  <img height="30" src={uptime.length > 0 ? uptime[0][2][uptimeKind][1] : ""}></img>
                </Link>
                <Separator  orientation="vertical"/>
                <Link
                  to="https://niranjan-ramesh.github.io/upptime/"
                  style={{ color: 'blue', textDecoration: 'underline' }}
                >
                  {uptime.length > 0 ? uptime[0][2][uptimeKind][0]+'ms' : "NA"}
                </Link>
                <Separator  orientation="vertical"/>
                <Select.Root size="2" defaultValue="2" onValueChange={(e) => setUptimeKind(Number(e))}>
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="1">Day</Select.Item>
                    <Select.Item value="2">Week</Select.Item>
                    <Select.Item value="3">Month</Select.Item>
                    <Select.Item value="4">Year</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Flex>
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
