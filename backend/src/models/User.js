import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    displayName: { type: String },
    email: { type: String },
    picture: { type: String },
});

const User = mongoose.model('User', userSchema);
export default User;