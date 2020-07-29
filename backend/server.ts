//@ts-ignore
const express = require('express');
const data = require('/home/rithvik/Course-Visualizer/backend/neo4j/database.ts');
const cors = require('cors');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello!')
})

app.get('/courses', cors(), (req, res) => {
  data.GetData().then(data => res.send(data));
})

app.listen(5000, () => {console.log('Running!')});