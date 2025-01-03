import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs'
const genAI = new GoogleGenerativeAI("AIzaSyBuo7VzH1mOKgdGjGwoS4uKNc9rNuSdey0");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

const clean_or_unclean = async(local_file_path)=>{
    const prompt = "Consider the given image as of a area, classify it as either clean(0) or unclean(1). If unclean, then give it a rating from 1-10 where 1 being slightly unclean and 10 being extremly unclean . Only output the numbers indicating the image and its rating(if unclean)";
    const image = {
       inlineData: {
         data: Buffer.from(fs.readFileSync(local_file_path)).toString("base64"),
         mimeType: "image/jpeg",
       },
     };
 const result = await model.generateContent([prompt,image]);
 const response = await result.response;
 const text = response.text();
 return text
 }



const sentiment_analysis = async(description) => {
  const prompt = `I want you to perform sentiment analysis on the given complaint description. You are required to analyze the urgency and importance of matter and output a rating only from 1-10 based on your observation. Description : ${description} `
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text
}





 export {
    clean_or_unclean,
    sentiment_analysis,
   }

