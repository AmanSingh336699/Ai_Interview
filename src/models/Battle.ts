import { UpdatedRankAnswer } from "@/utils/Types";
import mongoose, { Schema, Document } from "mongoose";

interface IPlayer {
    userId: string;
    name: string;
    score: number;
    avatar?: string;
}

export interface IBattle extends Document {
    battleCode: string;
    createdBy: string;
    topic: string;
    difficulty: string;
    maxPlayers: number;
    players: IPlayer[];
    AnswerRank: UpdatedRankAnswer[]
    questions: string[];
    currentIndex: number;
    status: "waiting" | "ongoing" | "completed"; 
    completedAt?: Date;
}

const BattleSchema = new Schema<IBattle>({
    battleCode: { type: String, required: true, unique: true },
    createdBy: { type: String, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, required: true },
    maxPlayers: { type: Number, required: true },
    players: [{ userId: String, name: String, avatar: { type: String, default: "" }, score: { type: Number, default: 0 }, _id: false}],
    questions: { type: [String], required: true },
    completedAt: { type: Date, default: Date.now, expires: 86400 },
    currentIndex: { type: Number, default: 0 },
    AnswerRank: [{ username: String, question: String, answer: String, _id: false }],
    status: { type: String, enum: ["waiting", "ongoing", "completed"], default: "waiting" },
}, { timestamps: true });

const Battle = mongoose.models.Battle || mongoose.model<IBattle>("Battle", BattleSchema);
export default Battle;