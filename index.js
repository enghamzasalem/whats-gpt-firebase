// Importing necessary modules
import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import qr2 from "qrcode";
import qrcodeTerminal from "qrcode-terminal";
import whatsappWeb from 'whatsapp-web.js';
const { Client, LocalAuth } = whatsappWeb;
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, child } from "firebase/database";
import { Configuration, OpenAIApi } from "openai";
import { config } from "dotenv";

// Loading environment variables from the .env file
config();

// Destructuring environment variables for clarity and convenience
const {
    API_KEY, AUTH_DOMAIN, DATABASE_URL, PROJECT_ID,
    STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID, PORT, OPEN_AI_KEY
} = process.env;

// Setting up path constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuring Firebase
const firebaseConfig = {
    apiKey: API_KEY,
    authDomain: AUTH_DOMAIN,
    databaseURL: DATABASE_URL,
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
    messagingSenderId: MESSAGING_SENDER_ID,
    appId: APP_ID,
};

// Initializing Firebase app and getting a reference to the database
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dbRef = ref(database);

// Setting up OpenAI configuration
const configuration = new Configuration({ apiKey: OPEN_AI_KEY });
const openai = new OpenAIApi(configuration);

// Setting up Express server
const appEx = express();
appEx.use(express.urlencoded({ extended: true }));

// Defining root route to serve the main page
appEx.get("/", (req, res) => res.sendFile(`${__dirname}/index.html`));

// Route to handle form submission and initiate WhatsApp authentication
appEx.post("/submit", (req, res) => {
    const { message, phoneNumber } = req.body;
    res.redirect(`/authenticate/${phoneNumber}/${message}`);
});

// Route to handle WhatsApp authentication and QR code generation
appEx.get("/authenticate/:phoneNumber/:promt", (req, res) => {
    const { phoneNumber, promt } = req.params;
    initializeClient(phoneNumber, promt, res);
});

// Starting the Express server
appEx.listen(PORT, () => console.log(`App listening on port ${PORT}!`));

// Function to set up WhatsApp client, listen for QR code, and handle incoming messages
function initializeClient(phoneNumber, promt, res) {
    const arr_chat = [{ role: "system", content: promt }];
    const sessionName = `session-${phoneNumber}`;
    const client = new Client({ authStrategy: new LocalAuth({ clientId: sessionName }) });

    // Listener for QR code generation
    client.on("qr", (qrCode) => generateQR(qrCode, res));
    // Listener to check if client is ready
    client.on("ready", () => console.log("Client is ready!"));
    client.initialize();
    // Listener to handle incoming messages
    client.on("message", async (message) => handleClientMessage(message, arr_chat));
}

// Function to generate and display the QR code for WhatsApp authentication
function generateQR(qrCode, res) {
    qrcodeTerminal.generate(qrCode, { small: true });
    qr2.toDataURL(qrCode, (err, src) => {
        if (err) return res.send("Error occurred");
        res.send(generateQRHtml(src));
    });
}

// Function to generate HTML content for displaying the QR code
function generateQRHtml(src) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>WhatsApp Authentication</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
        <h2>Scan the QR Code with WhatsApp</h2>
        <img src='${src}' alt='WhatsApp QR Code'>
        <p>After scanning, return to the chat.</p>
    </body>
    </html>
    `;
}

// Function to handle incoming WhatsApp messages, interact with OpenAI and Firebase
async function handleClientMessage(message, arr_chat) {
    const chat = await message.getChat();
    const userId = chat.id.user;

    // Checking for special commands
    if (message.body === '/help') {
        const helpMessage = "List of commands:\n/help - Show list of commands\n/info - Get details about this bot";
        message.reply(helpMessage);
        return;  // Exit the function after replying
    }

    if (message.body === '/info') {
        const infoMessage = "This bot is powered by OpenAI's GPT-3 model. It's designed to assist users by answering queries and providing information.";
        message.reply(infoMessage);
        return;  // Exit the function after replying
    }

    // Retrieve previous chat messages from Firebase
    try {
        const snapshot = await get(child(dbRef, `/links/test/${userId}`));
        if (snapshot.exists()) {
            arr_chat = snapshot.val().messages || arr_chat;
        }
    } catch (error) {
        console.error("Error reading from Firebase:", error);
    }

    // Add new message from the user to the chat array
    arr_chat.push({ role: "user", content: message.body });

    // Interact with OpenAI
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: arr_chat
        });
        const aiResponse = completion.data.choices[0].message.content;
        message.reply(aiResponse);
        
        // Add AI's response to the chat array
        arr_chat.push({ role: "assistant", content: aiResponse });
        
        // Store updated chat in Firebase
        await set(ref(database, `/links/test/${userId}`), { messages: arr_chat });
    } catch (error) {
        console.error("Error interacting with OpenAI:", error);
    }
}
