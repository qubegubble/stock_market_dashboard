import mongoose from 'mongoose';

interface IStock extends Document{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
}

const StockSchema = new mongoose.Schema({
    symbol: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    price: {type: Number, required: true},
    change: {type: Number, required: true},
    changePercent: {type: Number, required: true},
},{timestamps: true});

export default mongoose.model<IStock>('Stock', StockSchema);