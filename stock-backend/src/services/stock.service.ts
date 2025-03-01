import StockModel from "../models/stock.model";
import { fetchStockData } from "../utils/alphaVantage";
import Stock from "../interfaces/stock";

export async function loadStocks(symbols: string[]): Promise<void>{
    const loadPromises = symbols.map(async (symbol) => {
        try{
            const stockData = await fetchStockData(symbol);
            if(stockData){
                const {symbol, name, price, change, changePercent} = stockData;
                await StockModel.findOneAndUpdate(
                    { symbol },
                    { symbol, name, price, change, changePercent },
                    { upsert: true, new: true }
                );
            }
        }catch(err){
            console.error(`Error loading stock data for ${symbol}:`, err);
        }
    });
    await Promise.all(loadPromises);
}

export async function getAllStocks(): Promise<Stock[]>{
    return StockModel.find();
}

export async function getStockBySymbol(symbol: string): Promise<Stock | null>{
    return StockModel.findOne({symbol});
}