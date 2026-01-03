import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

// API Keys
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROK_API_KEY = process.env.GROK_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Gemini setup
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const geminiModel = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" }) : null;

// Groq API call helper (PRIMARY - most generous free tier)
const callGroq = async (prompt) => {
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

// Groq with vision (using llava model)
const callGroqVision = async (prompt, imageBase64) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.2-90b-vision-preview",
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

// Grok API call helper (FALLBACK for vision)
const callGrok = async (prompt, imageBase64 = null) => {
  const messages = [{ role: "user", content: prompt }];

  if (imageBase64) {
    messages[0].content = [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
    ];
  }

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROK_API_KEY}`
    },
    body: JSON.stringify({
      model: "grok-vision-beta",
      messages: messages,
      max_tokens: 100
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
};

// Text-only Grok call
const callGrokText = async (prompt) => {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROK_API_KEY}`
    },
    body: JSON.stringify({
      model: "grok-2-latest",
      messages: [{ role: "user", content: prompt }],
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

  // Try Groq first (most generous free tier)
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
      console.log("Gemini failed, trying Grok:", e.message);
    }
  }

  // Final fallback to Grok
  if (GROK_API_KEY) {
    return await callGrok(prompt, imageBase64);
  }

  throw new Error("No AI service available");
};

// Sentiment analysis
const sentiment_analysis = async (description) => {
  const prompt = `I want you to perform sentiment analysis on the given complaint description. You are required to analyze the urgency and importance of matter and output a rating only from 1-10 based on your observation. Description: ${description}`;

  // Try Groq first (most generous free tier)
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
      console.log("Gemini failed, trying Grok:", e.message);
    }
  }

  // Final fallback to Grok
  if (GROK_API_KEY) {
    return await callGrokText(prompt);
  }

  throw new Error("No AI service available");
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

  // Try Groq first (most generous free tier)
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
      console.log("Gemini failed, trying Grok:", e.message);
    }
  }

  // Final fallback to Grok
  if (GROK_API_KEY) {
    return await callGrok(prompt, imageBase64);
  }

  throw new Error("No AI service available");
};

export {
  clean_or_unclean,
  sentiment_analysis,
  manhole_verification,
};
