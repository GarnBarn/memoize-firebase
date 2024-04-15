/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onSchedule} from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { credential, firestore } from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";
import * as sa from "./key.json";


// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const manualTrigger = onRequest((req, res) => {
    coreLogic()
    res.send("Done!");
})


export const ScheduledNotifier = onSchedule("every minutes", async (event) => {
    coreLogic()
}) 


const coreLogic =  async () => {
    logger.info("Starting to check the notifier task")


    const app =initializeApp({
        credential: credential.cert(sa)
    })
    
   const db  = getFirestore(app)

   let focusedDate = new Date(new Date().getTime() - 30 * 60000)

    const result = await db.collection("reminder").where("reminder_date_time", "==", focusedDate).get()

    if (result.docs.length == 0) {
        logger.info("No Document to perform, skipping")
    }

    logger.info("Notifying ", result.docs.length, " reminder(s)")
}