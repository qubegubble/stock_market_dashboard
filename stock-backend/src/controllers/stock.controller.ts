import { Router, Request, Response } from 'express';
import { getAllStocks, getStockBySymbol } from '../services/stock.service';
import { authenticateUser } from "../middlewares/auth.middleware";

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
 *       500:
 *         description: Server error
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
 * /api/stocks/search:
 *   get:
 *     summary: Search stocks by name or symbol
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: The search query
 *     responses:
 *       200:
 *         description: List of matched stocks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Stock'
 *       400:
 *         description: Missing search query
 *       500:
 *         description: Server error
 */
router.get('/search', async (req: Request, res: Response): Promise<any> => {
  try {
    const query = req.query.q as string;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const allStocks = await getAllStocks();
    const searchTerm = query.toLowerCase();

    const results = allStocks.filter(stock =>
        stock.symbol.toLowerCase().includes(searchTerm) ||
        stock.name.toLowerCase().includes(searchTerm)
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search stocks' });
  }
});

/**
 * @swagger
 * /api/stocks/user-stocks:
 *   get:
 *     summary: Get user's saved stocks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's saved stocks with historical data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StockWithData'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Server error
 */
router.get('/user-stocks', authenticateUser, async (req: Request, res: Response):Promise<any> => {
  try {
    console.log('User from request:', req.user._id);
    console.log('User saved stocks:', req.user.savedStocks);

    const userStocks = Array.isArray(req.user.savedStocks) ? req.user.savedStocks : [];

    if (userStocks.length === 0) {
      return res.json([]);
    }
    const stocks = await Promise.all(
        userStocks.map(async (symbol: string) => {
          try {
            const stock = await getStockBySymbol(symbol);
            if (!stock) {
              return {
                symbol,
                name: symbol,
                price: 0,
                change: 0,
                data: []
              };
            }
            return {
              symbol: stock.symbol,
              name: stock.name,
              price: stock.price,
              change: stock.change,
              data: generateMockHistoricalData(symbol)
            };
          } catch (err) {
            console.error(`Error fetching stock ${symbol}:`, err);
            return {
              symbol,
              name: symbol,
              price: 0,
              change: 0,
              data: []
            };
          }
        })
    );

    res.json(stocks);
  } catch (error: any) {
    console.error('Failed to fetch user stocks:', error);
    res.status(500).json({ error: `Failed to fetch user stocks: ${error.message || 'Unknown error'}` });
  }
});

/**
 * @swagger
 * /api/stocks/user-stocks:
 *   post:
 *     summary: Save user's stocks to dashboard
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stocks:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Stock'
 *     responses:
 *       200:
 *         description: Stocks saved successfully
 *       400:
 *         description: Invalid request format
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Server error
 */
router.post('/user-stocks', authenticateUser, async (req: Request, res: Response):Promise<any> => {
  try {
    const { stocks } = req.body;
    if (!stocks) {
      return res.status(400).json({ error: 'No stocks provided' });
    }

    if (!Array.isArray(stocks)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }
    console.log('Saving stocks for user:', req.user._id);
    console.log('Raw stocks data:', stocks);
    const symbols = stocks
        .filter(stock => stock && stock.symbol)
        .map(stock => stock.symbol);

    console.log('Filtered symbols to save:', symbols);
    if (symbols.length === 0) {
      return res.status(400).json({ error: 'No valid stock symbols provided' });
    }

    try {
      req.user.savedStocks = symbols;
      await req.user.save();

      console.log('Successfully saved stocks:', symbols);
      res.json({ success: true, message: 'Stocks saved successfully' });
    } catch (saveError: any) {
      console.error('Error saving to database:', saveError);
      res.status(500).json({ error: `Database save error: ${saveError.message || 'Unknown database error'}` });
    }
  } catch (error: any) {
    console.error('Failed to process request:', error);
    res.status(500).json({ error: `Failed to save stocks: ${error.message || 'Unknown error'}` });
  }
});

/**
 * @swagger
 * /api/stocks/details/{symbol}:
 *   get:
 *     summary: Get detailed stock information with historical data
 *     parameters:
 *       - in: path
 *         name: symbol
 *         schema:
 *           type: string
 *         required: true
 *         description: The stock symbol
 *     responses:
 *       200:
 *         description: Stock details with historical data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StockWithData'
 *       404:
 *         description: Stock not found
 *       500:
 *         description: Server error
 */
router.get('/details/:symbol', async (req: Request, res: Response):Promise<any> => {
  try {
    const stock = await getStockBySymbol(req.params.symbol);

    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const stockWithData = {
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.change,
      data: generateMockHistoricalData(stock.symbol)
    };

    res.json(stockWithData);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch stock details' });
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
 *         description: A single stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stock'
 *       404:
 *         description: Stock not found
 *       500:
 *         description: Server error
 */
router.get('/:symbol', async (req: Request, res: Response): Promise<any> => {
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

/**
 * @swagger
 * components:
 *   schemas:
 *     Stock:
 *       type: object
 *       properties:
 *         symbol:
 *           type: string
 *           description: Stock symbol
 *         name:
 *           type: string
 *           description: Company name
 *         price:
 *           type: number
 *           description: Current stock price
 *         change:
 *           type: number
 *           description: Price change percentage
 *       required:
 *         - symbol
 *         - name
 *         - price
 *         - change
 *     StockDataPoint:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date of the data point
 *         value:
 *           type: number
 *           description: Stock price value
 *     StockWithData:
 *       allOf:
 *         - $ref: '#/components/schemas/Stock'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StockDataPoint'
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

function generateMockHistoricalData(symbol: string) {
  const data = [];
  const now = new Date();
  const seed = symbol.charCodeAt(0) + symbol.charCodeAt(symbol.length - 1);

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const randomFactor = Math.sin(i * 0.1 + seed) * 10;
    const value = 100 + randomFactor + (Math.random() * 10);

    data.push({
      date: date,
      value: value
    });
  }

  return data;
}

export default router;