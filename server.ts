import express, { Request, Response } from 'express';
import data from './json/Data.json'
import cors from 'cors';
import path from 'path'


const app = express();
app.use(cors());

/** Production Code
app.use(express.static(path.join(__dirname, '/client/build')));

app.get('/courses', (req: Request, res: Response) => {
  res.send(data);
});

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
});


app.listen(process.env.PORT, () => {});
**/

app.get('/', (req: Request, res: Response) => {
  res.send('The server is running.');
});

app.get('/courses', (req: Request, res: Response) => {
  res.send(data);
})


app.listen(5000, () => {console.log('The server is running.')});
