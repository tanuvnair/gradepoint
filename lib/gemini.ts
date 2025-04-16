import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface GradingPrompt {
  question: string;
  correctAnswer: any;
  studentResponse: any;
  questionType: string;
  points: number;
}

export async function gradeResponse(prompt: GradingPrompt): Promise<{
  isCorrect: boolean;
  score: number;
  feedback: string;
}> {
  try {
    const gradingPrompt = `
      You are an expert exam grader. Please grade the following response:
      
      Question: ${prompt.question}
      Question Type: ${prompt.questionType}
      Maximum Points: ${prompt.points}
      
      Correct Answer: ${JSON.stringify(prompt.correctAnswer)}
      Student's Response: ${JSON.stringify(prompt.studentResponse)}
      
      Please provide a JSON object with these exact keys: isCorrect, score, feedback
      Do not include any markdown formatting or code blocks.
      Example format: {"isCorrect": true, "score": 5, "feedback": "Your answer is correct"}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: gradingPrompt,
    });

    if (!response.text) {
      throw new Error('No response text received from Gemini');
    }

    try {
      // Clean the response text by removing any markdown code blocks
      const cleanText = response.text.replace(/```json\n|\n```/g, '').trim();
      
      // Parse the response
      const gradingResult = JSON.parse(cleanText);
      
      return {
        isCorrect: gradingResult.isCorrect,
        score: gradingResult.score,
        feedback: gradingResult.feedback
      };
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw response:', response.text);
      throw new Error('Failed to parse Gemini AI response');
    }
  } catch (error) {
    console.error('Error grading response:', error);
    // Return a default response in case of error
    return {
      isCorrect: false,
      score: 0,
      feedback: 'Unable to grade this response automatically. Please review manually.'
    };
  }
}

export async function gradeExamAttempt(attemptId: string) {
  // This function would be implemented to grade an entire exam attempt
  // by calling gradeResponse for each question in the attempt
  // Implementation details would depend on your database structure
} 