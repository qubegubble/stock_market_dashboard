import axios from 'axios';
import { Stock } from '../interfaces/stock';

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query?';
const STOCKS:string[] = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchStockData(symbol: string): Promise<Stock | null>{
    try{
        const response = await axios.get(BASE_URL, {
            params: {
                function: 'TIME_SERIES_DAILY',
                symbol,
                apikey: API_KEY
            }
        });
        const data = response.data['Time series (Daily)'][Object.keys(response.data['Time series (Daily)'])[0]];
        if(!data) return null;
        return{
            symbol: data['01. symbol'],
            name: data['02. open'],
            price: parseFloat(data['05. price']),
            change: parseFloat(data['09. change']),
            changePercent: parseFloat(data['10. change percent'])
        };
    }catch(err){
        console.error(`Error fetching stock data for ${symbol}:`, err);
        return null;
    }
}

async function fetchMultipleStocks():Promise<Stock[]> {
    const results: Stock[] = [];

    for (let i = 0; i < STOCKS.length; i++) {
        const stock = await fetchStockData(STOCKS[i]);
        if (stock) results.push(stock);

        // Respect AlphaVantage's free-tier rate limit (5 requests per minute)
        if ((i + 1) % 5 === 0) {
            console.log('Rate limit reached. Waiting 60 seconds...');
            await delay(60000);
        }
    }

    console.log('Fetched stock data:', results);
    return results;
}