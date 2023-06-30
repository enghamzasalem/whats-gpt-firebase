import pkg from "qrcode-terminal";
import Whatsapp from "whatsapp-web.js";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, child } from "firebase/database";
import { Configuration, OpenAIApi } from "openai";
import express from "express";
import qr2 from "qrcode";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { config } from "dotenv";
import speech from "./text-to-speech.mjs";

config(); // Load environment variables from .env file

const { Client, LocalAuth, MessageMedia } = Whatsapp;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const appEx = express();
appEx.use(express.urlencoded({ extended: true }));

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dbRef = ref(database);

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY,
});

const openai = new OpenAIApi(configuration);

appEx.get("/authenticate/:phoneNumber/:promt/:voice", (req, res) => {
  var phoneNumber = req.params.phoneNumber;
  var promt = req.params.promt;
  var voice = req.params.voice;
  console.log(req.params);
  var arr_chat = [
    {
      role: "system",
      content: promt,
    },
  ];

  const sessionName = `session-${phoneNumber}`;
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: sessionName }),
  });

  console.log("Client is not ready to use!");
  console.log(client);
  client.on("qr", (qrCode) => {
    pkg.generate(qrCode, { small: true });
    qr2.toDataURL(qrCode, (err, src) => {
      console.log(src);
      if (err) res.send("Error occured");
      res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>WhatsGPT</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Raleway">
          <style>
          body,h1 {font-family: "Raleway", sans-serif}
          body, html {height: 100%}
          .bgimg {
            background-image: url('https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-cool-dark-green-new-theme-whatsapp.jpg');
            min-height: 100%;
            background-position: center;
            background-size: cover;
          }
          </style>
        </head>
        <body>
          <div class="bgimg w3-display-container w3-animate-opacity w3-text-white">
            <div class="w3-display-topleft w3-padding-large w3-xlarge">
            WhatsGPT
            </div>
            <div class="w3-display-middle">
          <center>
              <h2  class="w3-jumbo w3-animate-top">QRCode Generated</h2>
              <hr class="w3-border-grey" style="margin:auto;width:40%">
              <p class="w3-center"><div><img src='${src}'/></div></p>
              </center>
            </div>
            <div class="w3-display-bottomleft w3-padding-large">
              Powered by <a href="/" target="_blank">WhatsGPT</a>
            </div>
          </div>
        </body>
      </html>

    `);
    });
  });

  client.on("ready", () => {
    console.log("Client is ready!");
  });

  client.initialize();
  client.on("message", async (message) => {
    if (!message.isStatus && message.type == "chat") {
      // if it's a chat message not a story or something else

      const chat = await message.getChat();
      let userId = chat.id.user;

      console.log(`${userId} has sent => ${message.body}`);

      set(ref(database, "chats/" + userId), {
        messages: arr_chat,
      });

      get(child(dbRef, "/chats/" + userId))
        .then(async (snapshot) => {
          if (snapshot.exists()) {
            const data = await snapshot.val();
            arr_chat = data.messages;

            arr_chat.push({
              role: "user",
              content: message.body,
            });

            set(ref(database, "chats/" + userId), {
              messages: arr_chat,
            });

            console.log("will ask for response from GPT");

            const completion = await openai.createChatCompletion({
              model: "gpt-3.5-turbo",
              messages: arr_chat,
            });
            const GPTresponse = completion.data.choices[0].message.content;

            console.log(`GPT response => ${GPTresponse}`);
            console.log(voice);
            if (voice == 1 || voice == 2) {
              chat.sendMessage(GPTresponse);
              console.log("text message sent");
            }

            if (voice == 2 || voice == 3) {
              let audio = await speech(GPTresponse);
              const media = await MessageMedia.fromUrl(audio);
              chat.sendMessage(media);
              console.log("voice message sent");
            }

            console.log("Bot Sent Response");

            arr_chat.push({
              role: "system",
              content: GPTresponse,
            });

            set(ref(database, "/chats/" + userId), {
              messages: arr_chat,
            });
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  });
});

appEx.post("/submit", (req, res) => {
  console.log(req.body);
  const message = req.body.message;
  const phoneNumber = req.body.phoneNumber;
  const voice = req.body.voice;
  res.redirect("/authenticate/" + phoneNumber + "/" + message + "/" + voice);
});

appEx.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

appEx.listen(process.env.PORT, function () {
  console.log("Example app listening on port " + process.env.PORT + "!");
});
