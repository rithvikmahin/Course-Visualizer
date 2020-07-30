import express, { Request, Response } from 'express';
import Courses from './types/json'
import cors from 'cors';

const data = require('./neo4j/database.ts');
const app = express();
app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('');
});

app.get('/courses', (req: Request, res: Response) => {
  data.GetData().then((data: Courses) => res.send(data));
})


app.listen(5000, () => {console.log('The server is running.')});