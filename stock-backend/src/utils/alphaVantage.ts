import axios from 'axios';
import { Stock } from '../interfaces/stock';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';
const STOCKS: string[] = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA']; // Add all your symbols here

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchStockData(symbol: string): Promise<Stock | null> {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                function: 'TIME_SERIES_DAILY',
                symbol,
                apikey: API_KEY
            }
        });

        // Check for API errors
        if (response.data['Error Message']) {
            console.error(`API Error for ${symbol}:`, response.data['Error Message']);
            return null;
        }

        // Get the most recent day's data
        const timeSeriesData = response.data['Time Series (Daily)'];
        if (!timeSeriesData) return null;

        const latestDate = Object.keys(timeSeriesData)[0];
        const latestData = timeSeriesData[latestDate];

        // Extract the data properly
        return {
            symbol,
            name: symbol, // Alpha Vantage doesn't return company names, you'd need another API call
            price: parseFloat(latestData['4. close']),
            change: parseFloat(latestData['4. close']) - parseFloat(latestData['1. open']),
            changePercent: ((parseFloat(latestData['4. close']) - parseFloat(latestData['1. open'])) /
                parseFloat(latestData['1. open']) * 100).toFixed(2)
        };
    } catch (err) {
        console.error(`Error fetching stock data for ${symbol}:`, err);
        return null;
    }
}

export async function fetchMultipleStocks(symbols: string[] = STOCKS): Promise<Stock[]> {
    const results: Stock[] = [];

    // Process in batches of 5 to respect rate limits
    for (let i = 0; i < symbols.length; i += 5) {
        const batch = symbols.slice(i, i + 5);
        console.log(`Processing batch ${i/5 + 1}/${Math.ceil(symbols.length/5)}: ${batch.join(', ')}`);

        const batchPromises = batch.map(symbol => fetchStockData(symbol));
        const batchResults = await Promise.all(batchPromises);

        results.push(...batchResults.filter(Boolean) as Stock[]);

        // Wait 65 seconds before next batch (slightly more than required to be safe)
        if (i + 5 < symbols.length) {
            console.log('Rate limit reached. Waiting 65 seconds before next batch...');
            await delay(65000);
        }
    }

    console.log(`Fetched ${results.length} stocks successfully`);
    return results;
}