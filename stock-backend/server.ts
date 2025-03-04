import app from './app';
import dotenv from "dotenv";
import { WebSocketService } from "./src/services/websocket.service";
import http from "http";
import mongoose from "mongoose";
import { seedStocks } from "./src/seeders/stockSeeder";

dotenv.config();
const server = http.createServer(app);

const webSocketService = new WebSocketService(server);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stockdb';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        return seedStocks();
    })
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Initiating stock data fetch in background...');
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));