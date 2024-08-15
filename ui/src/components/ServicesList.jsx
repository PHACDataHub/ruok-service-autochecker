import React from 'react';
import { Flex, Box, Text, Card, Spinner } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { DoubleArrowRightIcon } from '@radix-ui/react-icons';
import { servicesData } from '../assets/dummyData.js';
import { FILTER_QUERY } from '../GraphQL/queries.js';
import { useQuery, gql, NetworkStatus } from "@apollo/client";

const ServicesList = () => {
  // const data = servicesData;
  const kind = "Service";
  const { data, loading, error, refetch, networkStatus } = 
                    useQuery(
                            FILTER_QUERY,
                            {
                                variables : { kind },
                                fetchPolicy : "network-only",
                                notifyOnNetworkStatusChange: true,
                            },
  )

  if (networkStatus === NetworkStatus.refetch) return <Spinner />
  if (loading) return <Spinner />
  if (error) return <pre>{error.message}</pre>

  return (
    <Box padding="20px">
      <Flex direction="column" gap="20px">
        {data.filter.map((service, i) => (
          <Link
            key={i}
            to={`/${service.url}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Card
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = 'scale(1.02)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = 'scale(1.0)')
              }
            >
              <Flex align="center" justify="between">
                <Text as="div" size="2" weight="bold">
                  {service.url}
                </Text>
                <DoubleArrowRightIcon />
              </Flex>
            </Card>
          </Link>
        ))}
      </Flex>
    </Box>
  );
};

export default ServicesList;
