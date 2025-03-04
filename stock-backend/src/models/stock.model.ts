import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
    symbol: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    change: { type: Number, required: true },
    changePercent: { type: mongoose.Schema.Types.Mixed, required: true },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

const StockModel = mongoose.model('Stock', stockSchema);

export default StockModel;