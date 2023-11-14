import React from "react";

import { useLingui } from "@lingui/react";


import { Trans, Plural } from "@lingui/macro";


import { Grid, Paper, Typography } from "@mui/material";

import { useQuery, gql } from '@apollo/client';

import LocaleSwitcher from '../components/LocaleSwitcher';

import EndpointCard from '../components/EndpointCard';

import { Endpoint } from "../shared/CustomTypes";

const GET_LOCATIONS = gql`
query {
	endpoints(urls: ["https://github.com/PHACDataHub/ruok-service-autochecker"]) {
    url
  }
}
`;


export default function Home(): JSX.Element {
    const { i18n } = useLingui();
    const { loading, error, data } = useQuery(GET_LOCATIONS);

    if (loading) return <p>Loading...</p>;

    if (error) return <p>`Error! ${error.message}`</p>;

    const messages = [{}, {}];
    const messagesCount = messages.length;
    const lastLogin = new Date();




    const markAsRead = () => {
        console.log(data);
        alert("Marked as read.");
    };

    return (
        <div>
            <LocaleSwitcher />
            <Typography
                variant="h3"
                component="h1"
                gutterBottom
                align="center"
                color="primary"
            >
                <Trans>Monitored Endpoints</Trans>
            </Typography>
            <Typography>
                <Trans>
                    See all <a href="/unread">unread messages </a>
                    {" or "}
                    <a onClick={markAsRead}>mark them</a> as read.
                </Trans>
            </Typography>
            <p>
                <Plural value={messagesCount} one="There's # message in your inbox." other="There are # messages in your inbox." />
            </p>
            <Grid container>
                {data.endpoints.map((endpoint: Endpoint) => (
                    <EndpointCard
                        key={endpoint.url}
                        url={endpoint.url}
                    />
                ))}
            </Grid>
            < footer > <Trans>Last login on {i18n.date(lastLogin)}.</Trans></footer>
        </div>
    );
}