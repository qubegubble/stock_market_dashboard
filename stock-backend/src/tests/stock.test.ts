import app from "../../app";
import request from 'supertest';
import axios from 'axios';

jest.mock('axios');

describe('Stock API', () => {
    it('GET /api/stocks should return a list of stocks', async () => {
        const mockStocks = [{ symbol: 'AAPL', name: 'Apple', price: 150 }];
        (axios.get as jest.Mock).mockResolvedValue({ data: mockStocks });

        const response = await request(app).get('/api/stocks');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockStocks);
    });

    it('GET /api/stocks/:symbol should return a specific stock', async () => {
        const mockStock = { symbol: 'AAPL', name: 'Apple', price: 150 };
        (axios.get as jest.Mock).mockResolvedValue({ data: mockStock });

        const response = await request(app).get('/api/stocks/AAPL');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockStock);
    });

    it('POST /api/stocks should create a new stock', async () => {
        const newStock = {
            symbol: 'TSLA',
            name: 'Tesla',
            price: 800,
            change: 10,
            changePercent: 1.25,
        };
        (axios.post as jest.Mock).mockResolvedValue({ data: newStock });

        const response = await request(app).post('/api/stocks').send(newStock);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(newStock);
    });
});