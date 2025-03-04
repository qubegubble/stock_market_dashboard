import app from './app';
import dotenv from "dotenv";
import { WebSocketService } from "./src/services/websocket.service";
import http from "http";

dotenv.config();
const server = http.createServer(app);

const webSocketService = new WebSocketService(server);

const PORT = process.env.PORT || 5000;
const STOCK_SYMBOLS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "BRK.B", "NVDA", "JPM", "V",
    "JNJ", "WMT", "UNH", "PG", "HD", "DIS", "MA", "BAC", "XOM", "VZ",
    "PFE", "KO", "INTC"
];

// Removed loading since API_KEY not available, Stock data is simulated
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Initiating stock data fetch in background...');
});