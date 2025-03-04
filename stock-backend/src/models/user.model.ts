import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
    name?: string;
    firstName?: string;
    email: string;
    password: string;
    savedStocks: string[];
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    name: { type: String },
    firstName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    savedStocks: { type: [String], default: [] }
}, { timestamps: true });

UserSchema.pre('save', async function(this: IUser, next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

UserSchema.methods.comparePassword = async function(this: IUser, candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);