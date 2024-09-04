// require('dotenv').config();

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Theme } from '@radix-ui/themes';
import './styles.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { messages as enMessages } from './locales/en/messages';
import { messages as frMessages } from './locales/fr/messages';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import ServicesList from './components/ServicesList';
import Service from './components/Service';
import EndpointDetails from './components/EndpointDetails';
import Layout from './layout/Layout';

const client = new ApolloClient({
  //  uri: `${process.env.GRAPHQL_HOST_UI}:${process.env.GRAPHQL_PORT_UI}/graphql`,
  uri: `${process.env.GRAPHQL_UI_URI}`,
  cache: new InMemoryCache(),
});

i18n.load({
  en: enMessages,
  fr: frMessages,
});

i18n.activate('en');

const container = document.getElementById('react-root');
const root = createRoot(container);

root.render(
  <ApolloProvider client={client}>
    <React.StrictMode>
      <I18nProvider i18n={i18n}>
        <Theme>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route exact path="/" element={<ServicesList />} />
                <Route path="/:serviceName" element={<Service />} />
                <Route
                  path="/:serviceName/:endpointId"
                  element={<EndpointDetails />}
                />
              </Route>
            </Routes>
          </Router>
        </Theme>
      </I18nProvider>
    </React.StrictMode>
    ,
  </ApolloProvider>,
);
