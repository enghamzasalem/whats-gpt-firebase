import { config } from "dotenv";
config()


const openAiConfig = {
    apiKey: process.env.OPEN_AI_KEY
} 
export default openAiConfig