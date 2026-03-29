import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    console.log("Testing model...");
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Hello",
    });
    console.log("Success with 1.5-flash:", response.text);
    
    try {
      const response2 = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: "Hello",
      });
      console.log("Success with 3.1-pro-preview:", response2.text);
    } catch(e) {
      console.error("Failed 3.1-pro-preview", e.message);
    }
  } catch (e) {
    console.error("Critical error:", e.message);
  }
}

test();
