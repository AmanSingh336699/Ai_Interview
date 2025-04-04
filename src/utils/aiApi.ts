import { OpenAI } from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY })
if (!process.env.GEMINI_AI_KEY) {
    throw new Error("GEMINI_AI_KEY is not defined");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_KEY)


async function aiRequest(prompt: string, max_tokens: number = 300){
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens,
        })
        let text = response?.choices[0]?.message?.content?.trim()
        text = text?.replace(/```json|```/g, "").trim()
        return text || "No response from openai."
    } catch (_error) {
        console.error("OpenAI failed switching to Gemini:", _error)
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
            const result = await model.generateContent(prompt)
            let text = result.response.text()
            text = text.replace(/```json|```/g, "").trim()
            return text || "No response from Gemini."
        } catch (geminiError) {
            console.error("Gemini also failed:", geminiError)
            return "Failed to generate response from both OpenAI and Gemini."
        }
    }
}

export async function generateAIQuestions(role: string, experience: string, techStack: string){
    const prompt = `You are an AI interview simulator. Generate **10 technical interview questions** for a candidate applying for a ${role} role with ${experience} years of experience in ${techStack}.  
    Guidelines:
    - Ensure questions **match candidate's experience level**.
    - No duplicate, irrelevant, or overly simple questions.
    - Questions should cover **theoretical + practical + scenario-based** topics.
    - Return questions in **JSON format**:
    {
    "questions": [
        "Question 1",
        "Question 2",
        "...",
        "Question 10"
    ]
    }`

    const response = await aiRequest(prompt, 1000)
    try {
        return JSON.parse(response)?.questions || ["No questions generated"]
    } catch {
        return response.split("\n")
    }
}

export async function evaluteAnswer(question: string, answer: string) {
    const prompt = `Evaluate the answer and return only a JSON with score (0-10):
    
    Question: ${question}
    Answer: ${answer}
    
    If the score is below 5, roast the answer in Hinglish with sarcasm and make it funny (2 lines). 
    If the score is between 5 and 7, motivate the person in Hinglish, telling them they are on the right track (2 lines).
    If the score is above 7, appreciate the answer with a funny twist, like you're impressed but in a cool way (2 lines).
    
    Always return the response in JSON format like this: 
    { "score": 0-10, "message": "your roast/motivation/appreciation here" }`
    
    const response = await aiRequest(prompt, 550)
    try {
        const evaluation = JSON.parse(response)
        return evaluation

    } catch {
        return { score: null, message: "Something went wrong, try again!" }
    }
}


export async function generateFeedback(response: { question: string, answer: string; score: number }[]) {
    const formattedResponses = response
        .map(r => `Q: ${r.question}\nA: ${r.answer}\nScore: ${r.score}\n`)
        .join("\n");

    console.log("feedback responses: ", formattedResponses);

    const avgScore = response.reduce((sum, r) => sum + r.score, 0) / response.length;

    const prompt = `Analyze the interview responses and provide structured feedback.
    
    - Strengths (max 3) (if no strength, then roast him).
    - Weaknesses (max 3).
    - Improvement tips (max 3).
    - One-line comment based on avg score:
        - If ${avgScore} < 5, then make it **highly sarcastic**.
        - If ${avgScore} > 5, then make it **motivational**.
    - **Chances of selection in interview (0-100%)**:
        - If ${avgScore} > 8: High (80-100%)
        - If ${avgScore} > 5: Medium (50-80%)
        - If ${avgScore} ≤ 5: Low (0-50%)
    
    **Return JSON:**
    {
      "strengths": ["list"],
      "weaknesses": ["list"],
      "improvements": ["list"],
      "comment": "one-liner-sarcastic-or-motivational",
      "selectionChance": "percentage (e.g., 75%)"
    }
    
    Responses:
    ${formattedResponses}`;

    const res = await aiRequest(prompt, 1500);

    try {
        return JSON.parse(res);
    } catch {
        return { strengths: [], weaknesses: [], improvements: [], comment: res, selectionChance: "N/A" };
    }
}

export async function generateHint(question: string){
    const prompt = `Question: ${question}\n\n
    You are an expert interviewer giving helpful hints. A candidate is stuck on the question above. 
    Provide a single, short, and simple hint (under 30 words) to nudge the candidate in the right direction.  
    The hint should not give away the answer directly, but rather point them towards a useful concept, function, or general approach to solve the problem.
    Be specific to the type of question asked (e.g. algorithm, data structure, system design).
    Hint:`
    
    const response = await aiRequest(prompt, 60)
    return response
}

export async function generateBattle(topic: string, difficulty: string){
    const prompt = `You are an AI interview simulator. Generate **5 technical interview questions** on topin ${topic} with ${difficulty} difficulty.  
    Guidelines:
    - Ensure questions **match candidate's experience level**.
    - No duplicate, irrelevant, or overly simple questions.
    - Questions should cover **theoretical + practical + scenario-based** topics.
    - Return questions in **JSON format**:
    {
    "questions": [
        "Question 1",
        "Question 2",
        "...",
        "Question 5"
    ]
    }`

    const response = await aiRequest(prompt, 1000)
    try {
        return JSON.parse(response)?.questions || ["No questions generated"]
    } catch {
        return response.split("\n")
    }
}

interface Answer{
    userId: string;
    question: string;
    answer: string;
}

export async function generateRanking(answers: Answer[]) {
    const prompt = `
        You are an expert evaluator with deep knowledge in assessing answer quality. Your task is to rank the following answers based on **correctness, clarity, depth, and relevance**.

        ### **Evaluation Criteria:** 1. **Correctness**: Is the answer factually accurate? 
        2. **Clarity**: Is the answer well-structured and easy to understand? 
        3. **Depth**: Does the answer provide sufficient explanation with reasoning? 
        4. **Relevance**: Does the answer directly address the question without unnecessary details? 

        ### **Ranking Rules:** - **One user per question**: Only one user can be ranked for each question. 
        - **A user can appear multiple times** if they have given the best answers for different questions. 
        - **Top answer per question**: Select the best user for each question. 
        - **Max 3 ranked results**: Return up to **3 best answers from different questions**. 
        - **Sort by ranking order**: Best-ranked answer should be first in the list. 

        ### **Response Format:** \`\`\`json
        [
            { "userId": "bestUser1", "question": "Question 1", "answer": "Best Answer 1" },
            { "userId": "bestUser2", "question": "Question 2", "answer": "Best Answer 2" },
            { "userId": "bestUser3", "question": "Question 3", "answer": "Best Answer 3" }
        ]
        \`\`\`

        **IMPORTANT: Provide ONLY the JSON output as shown in the Response Format above. Do not include any additional text, explanations, or comments. Ensure the response is valid JSON.**

        ### **Answers to Rank:**
        ${answers
            .map((a) => `User: ${a.userId}, Q: ${a.question}, A: ${a.answer}`)
            .join("\n")}
    `;

    try {
        const response = await aiRequest(prompt, 4000);
        console.log("AI response: " + response);
        return JSON.parse(response)?.slice(0, 3) || [];
    } catch (error) {
        console.error("AI Ranking Error:", error);
        return [];
    }
}