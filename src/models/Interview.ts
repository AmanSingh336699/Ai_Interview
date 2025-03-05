import mongoose, { Schema, Document } from "mongoose";

export interface IInterview extends Document {
    userId: string;
    role: string;
    experience: string;
    techStack: string;
    questions: string[];
    status: "ongoing" | "completed";
    currentIndex: number;
    response?: { question: string; answer: string; score: number, message: string }[];
    feedback?: { strengths: string[]; weaknesses: string[]; improvements: string[]; comment: string };
}

const interviewSchema = new Schema<IInterview>({
    userId: { type: String, required: true },
    role: { type: String, required: true },
    experience: { type: String, required: true },
    techStack: { type: String, required: true },
    currentIndex: { type: Number, default: 0 },
    questions: [
        { type: String, required: true } 
    ],
    status: { type: String, enum: ["ongoing", "completed"], default: "ongoing" },
    response: [
        { question: { type: String, required: true }, answer: { type: String, required: true }, score: Number, message: String, _id: false }
    ],
    feedback: {
        strengths: [String],
        weaknesses: [String],
        improvements: [String],
        comment: String
    },
}, { timestamps: true })

const Interview = mongoose.models.Interview || mongoose.model<IInterview>("Interview", interviewSchema)

export default Interview;