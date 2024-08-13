require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const port = 8080;

app.use(express.static('./dist'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use(express.json());

app.post('/graphql', async function (req, res) {
  const data = req.body;
  const url = `${process.env.GRAPHQL_HOST_SERVER}:${process.env.GRAPHQL_PORT_SERVER}/graphql`;
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    // mode: "cors", // no-cors, *cors, same-origin
    // cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: "same-origin", // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  const results = await response.json();
  res.send(results);
});

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
