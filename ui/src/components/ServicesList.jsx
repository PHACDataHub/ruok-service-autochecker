import React from 'react';
import { Flex, Box, Text, Card } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { DoubleArrowRightIcon } from '@radix-ui/react-icons';
import { servicesData } from '../assets/dummyData.js';

const ServicesList = () => {
  const data = servicesData;

  return (
    <Box padding="20px">
      <Flex direction="column" gap="20px">
        {data.allServices.map((service, i) => (
          <Link
            key={i}
            to={`/${service.name}`}
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
                  {service.name}
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
