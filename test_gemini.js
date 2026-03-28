const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(__dirname, '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

async function testGemini() {
  console.log("Starting test...");
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.log("No API Key found. Exiting.");
    process.exit(1);
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      tools: [{ googleSearchRetrieval: {} }]
    });

    console.log("Sending 'hello' to Gemini 2.5 Flash Lite...");
    const result = await model.generateContent("hello");
    console.log("Success! Response:", result.response.text());
  } catch (err) {
    console.error("Test failed. Error:", err.message);
  }
}

testGemini();
