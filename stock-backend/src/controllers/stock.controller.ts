import { Router, Request, Response } from 'express';
import { getAllStocks, getStockBySymbol } from '../services/stock.service';

const router = Router();

/**
 * @swagger
 * /api/stocks:
 *   get:
 *     summary: Retrieve a list of stocks
 *     responses:
 *       200:
 *         description: A list of stocks.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Stock'
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const stocks = await getAllStocks();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});

/**
 * @swagger
 * /api/stocks/{symbol}:
 *   get:
 *     summary: Retrieve a single stock by symbol
 *     parameters:
 *       - in: path
 *         name: symbol
 *         schema:
 *           type: string
 *         required: true
 *         description: The stock symbol
 *     responses:
 *       200:
 *         description: A single stock.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stock'
 *       404:
 *         description: Stock not found
 */
router.get('/:symbol', async (req: Request, res: Response):Promise<any> => {
  try {
    const stock = await getStockBySymbol(req.params.symbol);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
});

export default router;