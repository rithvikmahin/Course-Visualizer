import express, { Request, Response } from 'express';
import data from './json/Data.json'
import Courses from './types/json'
import cors from 'cors';

//const data = require('./neo4j/database.ts');

const app = express();
app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('The server is running.');
});

app.get('/courses', (req: Request, res: Response) => {
  //data.GetData().then((data: Courses) => res.send(data));
  res.send(data);
})


app.listen(process.env.PORT, () => {console.log('The server is running.')});