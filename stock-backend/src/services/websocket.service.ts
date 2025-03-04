import { Server } from 'socket.io';
import http from 'http';
import { getAllStocks } from './stock.service';

export class WebSocketService {
    private io: Server;
    private updateInterval: NodeJS.Timeout | null = null;
    private subscribedClients: Map<string, Set<string>> = new Map();

    constructor(server: http.Server) {
        this.io = new Server(server, {
            cors: {
                origin: 'http://localhost:4200',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        this.setupSocketEvents();
        this.startStockUpdates();
    }

    private setupSocketEvents(): void {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('subscribe', (symbols: string[]) => {
                console.log(`Client ${socket.id} subscribed to:`, symbols);

                symbols.forEach(symbol => {
                    if (!this.subscribedClients.has(symbol)) {
                        this.subscribedClients.set(symbol, new Set());
                    }
                    this.subscribedClients.get(symbol)?.add(socket.id);
                    socket.join(symbol);
                });
            });

            socket.on('unsubscribe', (symbols: string[]) => {
                console.log(`Client ${socket.id} unsubscribed from:`, symbols);

                symbols.forEach(symbol => {
                    this.subscribedClients.get(symbol)?.delete(socket.id);
                    socket.leave(symbol);
                });
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
                this.subscribedClients.forEach((clients, symbol) => {
                    if (clients.has(socket.id)) {
                        clients.delete(socket.id);
                    }
                });
            });
        });
    }

    private startStockUpdates(): void {
        this.updateInterval = setInterval(async () => {
            try {
                const stocks = await getAllStocks();

                stocks.forEach(stock => {
                    const changePercent = (Math.random() * 4) - 2;
                    const priceChange = stock.price * (changePercent / 100);
                    const updatedStock = {
                        symbol: stock.symbol,
                        name: stock.name,
                        price: Number((stock.price + priceChange).toFixed(2)),
                        change: Number((stock.change + changePercent * 0.1).toFixed(2)),
                        lastUpdate: new Date()
                    };
                    this.io.to(stock.symbol).emit('stockUpdate', updatedStock);
                });
                this.io.emit('allStockUpdates', stocks.map(s => ({
                    symbol: s.symbol,
                    price: s.price,
                    change: s.change,
                    lastUpdate: new Date()
                })));

            } catch (error) {
                console.error('Error updating stock prices:', error);
            }
        }, 5000);
    }

    public stopStockUpdates(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}