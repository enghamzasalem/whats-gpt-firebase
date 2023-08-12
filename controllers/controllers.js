import path from "path"; 
import pkg from "qrcode-terminal";
import { fileURLToPath } from "url"; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import Whatsapp from "whatsapp-web.js";
import qr2 from "qrcode";
const { Client, LocalAuth } = Whatsapp;
import { ref, get, set, child } from "firebase/database";
import { db} from "../storage/db.js"
import {openai} from "../openai/openai.js"

const getIndexController = async (req, res) => {
    const filePath = path.join(__dirname, "../views/index.html"); 
    res.sendFile(filePath);
}


const postIndexController = async (req, res) => {

    const phoneNumber = req.body.phoneNumber;
    res.redirect("/wp-client?phone_number="+phoneNumber);
}


const getWPClient = async (req, res) => {
    const filePath= path.join(__dirname, "../views/wp-client.html"); 
    res.sendFile(filePath)
    
}

const postWPClient = async (req, res) => {

    try{

    const phoneNumber = req.params.phoneNumber;
    const promt = req.body.promt;
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

    console.log(client);
    console.log("Client QR Code is being initialized");
    client.on("qr", (qrCode) => {
        pkg.generate(qrCode, { small: true });
        qr2.toDataURL(qrCode, (err, src) => {
            console.log(src);
            if (err) res.send("Error occured");
            res.send(src);
        });
    });

    client.on("ready", () => {
        console.log("Client is ready!");
    });

    client.initialize();
    client.on("message", async (message) => {

        const chat = await message.getChat();

        if (chat.id.user == "status"){
            return
        }

        console.log("Message recieved: ")
        console.log(chat);

        set(ref(db.conn, "links/test/" + chat.id.user), {
            messages: arr_chat,
        });

        const snapshot = await get(child(db.ref, "/links/test/" + chat.id.user))

        if (snapshot.exists()) {

            const data = await snapshot.val();
            console.log(data.messages);
            arr_chat = data.messages;
            arr_chat.push({
                role: "user",
                content: message.body,
            });
            console.log(arr_chat);
            set(ref(db.conn, "links/test/" + chat.id.user), {
                messages: arr_chat,
            });

 
            const completion = await openai.conn.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: arr_chat,
            });
            console.log(completion.data.choices[0].message);
            message.reply(completion.data.choices[0].message.content);

            arr_chat.push({
                role: "system",
                content: completion.data.choices[0].message.content
            });
            console.log(arr_chat);
            set(ref(db.conn, "/links/test/" + chat.id.user), {
                messages: arr_chat,
            });
        } else {
            console.log("No data available");
        }
    });
    } catch (err){
        console.log(err)
    }
}


export {
    getIndexController, postIndexController, getWPClient, postWPClient
}