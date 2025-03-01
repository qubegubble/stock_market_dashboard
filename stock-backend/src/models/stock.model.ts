import mongoose, { Schema, Document } from 'mongoose';
import { Stock } from '../interfaces/stock';

export interface StockDocument extends Stock, Document {}

const StockSchema: Schema = new Schema({
    symbol: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    change: { type: Number, required: true },
    changePercent: { type: Number, required: true },
});

export default mongoose.model<StockDocument>('Stock', StockSchema);