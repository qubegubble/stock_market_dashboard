import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import stockRoutes from './src/routes/stock.routes';

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000 as number;
const MONGODB_URI = process.env.MONGODB_URI as string;

app.use(express.json());
app.use(cors());
app.use('/api/stocks', stockRoutes);

mongoose.connect(MONGODB_URI, {

}).then(() => { console.log('Connected to MongoDB') }).catch((err) => { console.log(err) });


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});