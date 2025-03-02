import mongoose, { Schema, Document } from "mongoose";

interface IInterview extends Document {
    userId: string;
    role: string;
    experience: string;
    techStack: string;
    questions: string[];
    status: "ongoing" | "completed";
    response?: { question: string; answer: string; score: number }[];
    feedback?: { strengths: string[]; weaknesses: string[]; improvements: string[]; comment: string };
    currentIndex: number;
}

const interviewSchema = new Schema<IInterview>({
    userId: { type: String, required: true },
    role: { type: String, required: true },
    experience: { type: String, required: true },
    techStack: { type: String, required: true },
    questions: [
        { type: String, required: true } 
    ],
    status: { type: String, enum: ["ongoing", "completed"], default: "ongoing" },
    response: [
        { question: { type: String, required: true }, answer: { type: String, required: true }, score: Number, _id: false }
    ],
    feedback: {
        strengths: [String],
        weaknesses: [String],
        improvements: [String],
        comment: String
    },
    currentIndex: { type: Number, default: 0 }
}, { timestamps: true })

const Interview = mongoose.models.Interview || mongoose.model<IInterview>("Interview", interviewSchema)

export default Interview;