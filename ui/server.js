require('dotenv').config();
const path = require('path');
const express = require('express');
const jsdom = require("jsdom");
const app = express();
const port = 8080;

app.use(express.static('./dist'));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(express.json());

app.get("/uptime", async function (req, res) {
  let doc = '';
  let data = [];
  fetch('https://github.com/niranjan-ramesh/upptime/tree/master').then(function (response) {
    // The API call was successful!
    return response.text();
  }).then(function (html) {

    doc = html;
    res.header('Access-Control-Allow-Origin', '*');
    res.send(doc);

  }).catch(function (err) {
    // There was an error
    console.warn('Something went wrong.', err);
  });
});

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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
