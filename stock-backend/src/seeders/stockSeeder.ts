import StockModel from '../models/stock.model';
const stockSymbols = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "BRK.B", "NVDA", "JPM", "V",
    "JNJ", "WMT", "UNH", "PG", "HD", "DIS", "MA", "BAC", "XOM", "VZ",
    "PFE", "KO", "INTC"
];

function getRandomPrice(min: number, max: number): number {
    return +(Math.random() * (max - min) + min).toFixed(2);
}

function getRandomChangePercent(): number {
    return +(Math.random() * 6 - 3).toFixed(2);
}

export async function seedStocks(): Promise<void> {
    try {
        console.log('Seeding/updating stock data...');
        const now = new Date();
        const upsertPromises = stockSymbols.map(async (symbol) => {
            const changePercent = getRandomChangePercent();
            const price = getRandomPrice(50, 500);
            const change = +(price * (changePercent / 100)).toFixed(2);
            return StockModel.findOneAndUpdate(
                { symbol },
                {
                    symbol,
                    name: symbol,
                    price,
                    change,
                    changePercent,
                    lastUpdated: now,
                    updatedAt: now
                },
                {
                    upsert: true,
                    new: true
                }
            );
        });
        const results = await Promise.all(upsertPromises);
        console.log(`${results.length} stocks have been seeded or updated`);
    } catch (error) {
        console.error('Error seeding stocks:', error);
    }
}

export default seedStocks;