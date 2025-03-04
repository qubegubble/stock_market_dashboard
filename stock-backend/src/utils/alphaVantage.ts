import axios from 'axios';
import { Stock } from '../interfaces/stock';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';
const RATE_LIMIT_DELAY_MS = 65000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchStockData(symbol: string): Promise<Stock | null> {
    try {
        console.log(`Fetching data for ${symbol}...`);
        const response = await axios.get(BASE_URL, {
            params: {
                function: 'TIME_SERIES_DAILY',
                symbol,
                apikey: API_KEY
            }
        });

        if (response.data['Error Message']) {
            console.error(`API Error for ${symbol}:`, response.data['Error Message']);
            return null;
        }

        if (response.data['Note']) {
            console.warn(`API Note for ${symbol}:`, response.data['Note']);
            return null;
        }

        const timeSeries = response.data['Time Series (Daily)'];
        if (!timeSeries || Object.keys(timeSeries).length === 0) {
            console.error(`No time series data returned for ${symbol}`);
            return null;
        }

        const mostRecentDate = Object.keys(timeSeries)[0];
        const recentData = timeSeries[mostRecentDate];

        const previousDate = Object.keys(timeSeries)[1];
        const previousData = timeSeries[previousDate];

        const currentPrice = parseFloat(recentData['4. close']);
        const previousPrice = parseFloat(previousData['4. close']);
        const change = currentPrice - previousPrice;
        const changePercent = (change / previousPrice) * 100;

        return {
            symbol,
            name: symbol,
            price: currentPrice,
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2))
        };
    } catch (err) {
        console.error(`Error fetching stock data for ${symbol}:`, err);
        return null;
    }
}

export async function fetchMultipleStocks(symbols: string[]): Promise<Stock[]> {
    const results: Stock[] = [];
    const failedSymbols: string[] = [];

    const BATCH_SIZE = 5;

    for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
        const batch = symbols.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(symbols.length/BATCH_SIZE)}: ${batch.join(', ')}`);

        for (const symbol of batch) {
            try {
                const stockData = await fetchStockData(symbol);
                if (stockData) {
                    results.push(stockData);
                } else {
                    failedSymbols.push(symbol);
                }

                await delay(1000);
            } catch (error) {
                console.error(`Failed to fetch ${symbol}:`, error);
                failedSymbols.push(symbol);
            }
        }

        if (i + BATCH_SIZE < symbols.length) {
            console.log(`Waiting ${RATE_LIMIT_DELAY_MS/1000} seconds before next batch...`);
            await delay(RATE_LIMIT_DELAY_MS);
        }
    }

    console.log(`Successfully fetched ${results.length} out of ${symbols.length} stocks`);
    if (failedSymbols.length > 0) {
        console.log(`Failed symbols: ${failedSymbols.join(', ')}`);
    }

    return results;
}