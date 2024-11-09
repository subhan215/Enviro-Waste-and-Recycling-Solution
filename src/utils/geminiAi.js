import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs'
const genAI = new GoogleGenerativeAI("AIzaSyDFowJrACjcuzMyXf3mRt21WVCWeLSEGpA");
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

 export {
    clean_or_unclean,
   }

