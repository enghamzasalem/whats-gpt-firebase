import express from "express";
import { config } from "dotenv";
import { configOpenAi } from "./openai/openai.js"
import { dbInit} from "./storage/db.js"
import { getIndexController, postIndexController, getWPClient, postWPClient} from "./controllers/controllers.js"
import cors from "cors"

config(); // Load environment variables from .env file


const appEx = express();
appEx.use(express.urlencoded({ extended: true }));
appEx.use(express.json());
appEx.use(cors({
    origin: '*'
}));

dbInit()
configOpenAi()


appEx.get("/", getIndexController)
appEx.post("/", postIndexController)
appEx.get("/wp-client", getWPClient)
appEx.post("/wp-client/:phoneNumber", postWPClient)

appEx.listen(process.env.PORT, function () {
    console.log("app listening on port "+process.env.PORT+"!");
});
