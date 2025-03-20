import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI

if(!MONGODB_URI){
    throw new Error("Please define the MONGODB_URI environment variable")
}

interface MongooseCache {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
}

const globalWithMongoose = globalThis as typeof globalThis & { mongooseCache?: MongooseCache }

let cached: MongooseCache = globalWithMongoose.mongooseCache || { conn: null, promise: null }

export async function connectDb(): Promise<mongoose.Connection> {
    if(cached.conn){
        return cached.conn
    }

    if(!cached.promise){
        cached.promise = mongoose.connect(MONGODB_URI!, {
            bufferCommands: false,
        }).then((mongoose) => {
            return mongoose.connection
        }).catch((err) => {
            console.error("mongoose connection failed, retrying in 5 seconds...")
            throw err
        })
    }

    cached.conn = await cached.promise
    globalWithMongoose.mongooseCache = cached

    return cached.conn
}
