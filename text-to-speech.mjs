import axios from "axios";
import { config } from "dotenv";

config(); // Load environment variables

const apiKey = process.env.TEXT_TO_SPEACH_KEY;

export default async function speach(text) {
  const encodedParams = new URLSearchParams();
  encodedParams.set("voice_code", "en-US-1");
  encodedParams.set("text", text);
  encodedParams.set("speed", "1.00");
  encodedParams.set("pitch", "1.00");
  encodedParams.set("output_type", "audio_url");

  const options = {
    method: "POST",
    url: "https://cloudlabs-text-to-speech.p.rapidapi.com/synthesize",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "cloudlabs-text-to-speech.p.rapidapi.com",
    },
    data: encodedParams,
  };

  try {
    const response = await axios.request(options);
    return response.data.result.audio_url;
  } catch (error) {
    console.error(error);
  }
}
