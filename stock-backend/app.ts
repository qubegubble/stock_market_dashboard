// src/app.ts
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/swagger';
import stockRouter from './src/controllers/stock.controller';
import authRouter from './src/controllers/auth.controller';
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 3000;
const mongoDb = process.env.MONGODB_URI || 'mongodb://localhost/stockdb';

app.use(express.json());

// Serve the Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount your routes
app.use('/api/stocks', stockRouter, authRouter);

mongoose.connect(mongoDb, {
}).then(() => {
  console.log("Connected to MongoDB")
}).catch((err) => {
  console.error(`Failed to connect to MongoDB: ${err}`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
export default app;