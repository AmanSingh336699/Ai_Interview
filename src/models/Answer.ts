import mongoose, { Schema } from "mongoose";

export interface IAnswer {
    battleCode: string;
    userId: string;
    questionIndex: string;
    answer: string;
    createdAt?: Date;
    completedAt?: Date;
    score: number;
}

const answerSchema = new Schema<IAnswer>({
    battleCode: { type: String, required: true },
    userId: { type: String, required: true },
    questionIndex: { type: String, required: true },
    answer: { type: String, required: true },
    score: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: Date.now, index: { expires: "1h" } }
});

const Answer = mongoose.models.Answer || mongoose.model<IAnswer>("Answer", answerSchema);
export default Answer;