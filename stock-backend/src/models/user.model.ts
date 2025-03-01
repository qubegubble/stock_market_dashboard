import mongoose,{Document, Schema} from "mongoose";
import bcrypt from "bcrypt";

export interface User{
    username: string;
    password: string;
    createdAt: Date;
}

export interface UserDocument extends User, Document{
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    createdAt: {type: Date, default: Date.now}
});

UserSchema.pre<UserDocument>("save", async function(next){
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean>{
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<UserDocument>("User", UserSchema);