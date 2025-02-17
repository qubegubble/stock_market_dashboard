import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import stockRoutes from './src/routes/stock.routes';

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use('/api/stocks', stockRoutes);

// @ts-ignore
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch((err: any) => console.error('MongoDB connection error: ', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});