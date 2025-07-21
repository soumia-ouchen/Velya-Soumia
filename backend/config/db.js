import mongoose from "mongoose";

// Connexion à MongoDB
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
        });
        console.log(`🟢 MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("🔴 Error connecting to MONGODB:", error.message);
    }
};
