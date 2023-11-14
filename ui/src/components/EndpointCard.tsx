import { Grid, Paper } from "@mui/material";
import React from "react";

import { Endpoint } from "../shared/CustomTypes";

export default function EndpointCard(endpoint: Endpoint): JSX.Element {
  return (
    <Grid
      item
      xl={1}
      lg={2}
      md={3}
      sm={6}
      xs={12}
    >
      <Paper>{endpoint.url}</Paper>
    </Grid>
  );
}