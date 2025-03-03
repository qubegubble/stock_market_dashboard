// src/app.ts
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/swagger';
import stockRouter from './src/controllers/stock.controller';
import authRouter from './src/controllers/auth.controller';
import mongoose from "mongoose";
import cors from 'cors';
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:4200', // Replace with your Angular app's URL
    credentials: true, // Allow cookies and authentication headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount your routes
app.use('/api/stocks', stockRouter);

app.use('/api/auth', authRouter);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/stockdb')
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB:', err);
      process.exit(1);
    });
export default app;