import React from "react";
import { createRoot } from "react-dom/client";

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

import { messages as enMessages } from "./locales/en/messages";
import { messages as frMessages } from "./locales/fr/messages";

import Home from "./pages/Home";

i18n.load({
  "en": enMessages,
  "fr": frMessages,
});

i18n.activate("en");

// TODO: remove hard-coded URL
const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
});

const App = () => (
  <ApolloProvider client={client}>
    <I18nProvider i18n={i18n}>
      <Router>
        <Routes>
          <Route
            element={<Home />}
            path="/"
          >
          </Route>
        </Routes>
      </Router>
    </I18nProvider>
  </ApolloProvider>
);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
