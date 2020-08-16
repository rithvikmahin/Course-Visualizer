import express, { Request, Response } from 'express';
import data from './json/Data.json'
import Courses from './types/json'
import cors from 'cors';
import path from 'path'

//const data = require('./neo4j/database.ts');

const app = express();
app.use(cors());

express.static(path.join(__dirname, '/client/build'));

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
});

app.get('/courses', (req: Request, res: Response) => {
  //data.GetData().then((data: Courses) => res.send(data));
  res.send(data);
});

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
});

app.listen(process.env.PORT, () => {console.log('The server is running.')});