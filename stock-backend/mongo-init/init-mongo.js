const stockSymbols = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "BRK.B", "NVDA", "JPM", "V",
    "JNJ", "WMT", "UNH", "PG", "HD", "DIS", "MA", "BAC", "XOM", "VZ",
    "PFE", "KO", "INTC"
];

function getRandomPrice(min, max) {
    return +(Math.random() * (max - min) + min).toFixed(2);
}

function getRandomChangePercent() {
    return +(Math.random() * 6 - 3).toFixed(2);
}

const now = new Date();
const db = db.getSiblingDB('stockdb');

db.createCollection('stocks');

stockSymbols.forEach(symbol => {
    const changePercent = getRandomChangePercent();
    const price = getRandomPrice(50, 500);
    const change = +(price * (changePercent / 100)).toFixed(2);

    db.stocks.insertOne({
        symbol: symbol,
        name: symbol,
        price: price,
        change: change,
        changePercent: changePercent,
        createdAt: now,
        updatedAt: now,
        lastUpdated: now
    });

    print(`Added stock: ${symbol} at price $${price} with change ${change} (${changePercent}%)`);
});

print('Stock database initialization completed');