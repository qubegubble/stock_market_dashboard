import app from './app';
import {loadStocks} from "./src/services/stock.service";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;
const STOCK_SYMBOLS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META',
    'TSLA', 'NVDA', 'JPM', 'V', 'JNJ',
    // Add more symbols up to 50
];

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Lazy load stocks in background after server starts
    console.log('Initiating stock data fetch in background...');
    setTimeout(() => {
        loadStocks(STOCK_SYMBOLS)
            .then(() => console.log('Stock data loaded successfully'))
            .catch(err => console.error('Failed to load stock data:', err));
    }, 5000); // Wait 5 seconds after server start
});