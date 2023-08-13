import openAiConfig from "../config/openai.config.js"
import { Configuration, OpenAIApi } from "openai";


class OpenAI{

    config = () => {
        const configuration = new Configuration(openAiConfig);

        this.conn = new OpenAIApi(configuration);
    }
}


const openai = new OpenAI()

const configOpenAi = () => openai.config()

export {configOpenAi, openai}
