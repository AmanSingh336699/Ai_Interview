import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI

if(!MONGODB_URI){
    throw new Error("Please define the MONGODB_URI environment variable")
}

let cached = global.mongoose as { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null }

if(!cached){
    cached = global.mongoose = { conn: null, promise: null }
}

export async function connectDb(){
    if(cached.conn){
        return cached.conn
    }

    if(!cached.promise){
        mongoose.set("strictQuery", false)
        const opts = {
            bufferCommands: true,
            maxPoolSize: 10
        }

        cached.promise = mongoose.connect(MONGODB_URI as string, opts).then(() => mongoose.connection)
    }

    try {
        cached.conn = await cached.promise
        console.log("mongoose connecting")
    } catch (_error) {
        cached.promise = null
        console.error("mongoose connection failed, retrying in 5 seconds...")
        throw _error
    }

    return cached.conn
}