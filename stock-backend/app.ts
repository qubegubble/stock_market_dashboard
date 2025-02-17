import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import stockRoutes from "./src/routes/stock.routes";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/api/stocks', stockRoutes);

export default app;