import express, {Express, Request} from 'express';

const app: Express = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello world');
});

export default app;