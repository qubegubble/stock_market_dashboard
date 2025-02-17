import Stock from '../models/Stock';
import {Router, Request, Response} from 'express';
const router = Router();

interface StockParams{
  symbol: string;
}

/**
 * @route GET /api/stocks
 * @desc Get all stocks
 * */
router.get('/', async(req: Request, res: Response) => {
  try{
    const stocks = await Stock.find();
    res.json(stocks);
  }catch(err){
    res.status(500).json({message: (err as Error).message});
  }
});

/**
 * @route GET /api/stocks/:symbol
 * @desc Get a specific stock by symbol
 * */
router.get('/:symbol', async(req, res): Promise<any> =>{
  try{
    const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase()});
    if(!stock) return res.status(404).json({ message: 'Stock not found'});
    return res.json(stock);
  }catch(err){
    return res.status(500).json({ message: (err as Error).message});
  }
})

export default router;