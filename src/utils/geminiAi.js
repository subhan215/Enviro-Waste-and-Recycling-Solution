import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

// API Keys
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Gemini setup - using gemini-2.5-flash (free tier available)
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const geminiModel = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null;

// Groq API call helper for text
const callGroq = async (prompt) => {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
};

// Groq with vision (using Llama 4 Scout - current vision model)
const callGroqVision = async (prompt, imageBase64) => {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
        ]
      }],
      max_tokens: 100
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
};

// Clean or Unclean image classification
const clean_or_unclean = async (local_file_path) => {
  const prompt = "Consider the given image as of a area, classify it as either clean(0) or unclean(1). If unclean, then give it a rating from 1-10 where 1 being slightly unclean and 10 being extremely unclean. Only output the numbers indicating the image and its rating(if unclean)";
  const imageBase64 = Buffer.from(fs.readFileSync(local_file_path)).toString("base64");

  // Try Groq first (Llama 4 Scout vision model)
  if (GROQ_API_KEY) {
    try {
      return await callGroqVision(prompt, imageBase64);
    } catch (e) {
      console.log("Groq vision failed, trying Gemini:", e.message);
    }
  }

  // Fallback to Gemini
  if (geminiModel) {
    try {
      const image = {
        inlineData: { data: imageBase64, mimeType: "image/jpeg" }
      };
      const result = await geminiModel.generateContent([prompt, image]);
      return result.response.text();
    } catch (e) {
      console.log("Gemini failed:", e.message);
      throw e;
    }
  }

  throw new Error("No AI service available. Please configure GROQ_API_KEY or GEMINI_API_KEY.");
};

// Sentiment analysis
const sentiment_analysis = async (description) => {
  const prompt = `I want you to perform sentiment analysis on the given complaint description. You are required to analyze the urgency and importance of matter and output a rating only from 1-10 based on your observation. Description: ${description}`;

  // Try Groq first
  if (GROQ_API_KEY) {
    try {
      return await callGroq(prompt);
    } catch (e) {
      console.log("Groq failed, trying Gemini:", e.message);
    }
  }

  // Fallback to Gemini
  if (geminiModel) {
    try {
      const result = await geminiModel.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      console.log("Gemini failed:", e.message);
      throw e;
    }
  }

  throw new Error("No AI service available. Please configure GROQ_API_KEY or GEMINI_API_KEY.");
};

// Manhole verification
const manhole_verification = async (local_file_path, verification_type = 'report') => {
  let prompt;
  if (verification_type === 'report') {
    prompt = "Analyze this image for manhole-related issues. Determine if it shows: 1) A lost/missing manhole cover, 2) An open/uncovered manhole, 3) A hidden/obstructed manhole, 4) A damaged manhole cover. Output format: If a manhole issue is detected, output '1' followed by a severity rating from 1-10 (1=minor, 10=severe danger). If no manhole issue is detected, output '0'. Only output the numbers.";
  } else {
    prompt = "Analyze this image to verify if a manhole has been properly repaired/covered. Check if: 1) The manhole cover is properly in place, 2) The area around is safe and accessible, 3) No hazards remain. Output '1' if the manhole appears properly fixed and safe, output '0' if issues remain. Only output the number.";
  }

  const imageBase64 = Buffer.from(fs.readFileSync(local_file_path)).toString("base64");

  // Try Groq first (Llama 4 Scout vision model)
  if (GROQ_API_KEY) {
    try {
      return await callGroqVision(prompt, imageBase64);
    } catch (e) {
      console.log("Groq vision failed, trying Gemini:", e.message);
    }
  }

  // Fallback to Gemini
  if (geminiModel) {
    try {
      const image = {
        inlineData: { data: imageBase64, mimeType: "image/jpeg" }
      };
      const result = await geminiModel.generateContent([prompt, image]);
      return result.response.text();
    } catch (e) {
      console.log("Gemini failed:", e.message);
      throw e;
    }
  }

  throw new Error("No AI service available. Please configure GROQ_API_KEY or GEMINI_API_KEY.");
};

export {
  clean_or_unclean,
  sentiment_analysis,
  manhole_verification,
};
