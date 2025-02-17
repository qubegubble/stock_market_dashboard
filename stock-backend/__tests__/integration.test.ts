import request from 'supertest';
import app from '../app';

describe('GET /api/stocks', () => {
    it('responds with json', async () => {
        const response = await request(app).get('/api/stocks');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });
});