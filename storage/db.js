import { getDatabase } from "firebase/database";
import firebaseConfig from "../config/firebase.config.js"
import {initializeApp} from '@firebase/app'
import {  ref, get, set, child } from "firebase/database";


class DB{
    connect = () => {
        const app = initializeApp(firebaseConfig);
        this.conn =getDatabase(app) 
        this.ref = ref(this.conn)
    }
}


const db = new DB()

const dbInit = () => db.connect()



export {dbInit, db}



