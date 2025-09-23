import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number,
};

const connection: ConnectionObject = {};

async function connectDB(): Promise<void> {
    if (connection.isConnected) {
        console.info("INFO: Database already connected");
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "");
        // console.debug("DEBUG: db:", db);
        connection.isConnected = db.connections[0].readyState;
        console.info("INFO: Database connected");
    }
    catch (error) {
        console.error("ERROR: Database connection failed\n", error);
        process.exit(1);
    }
}

export default connectDB;