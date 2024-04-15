/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const sa = require("./key.json")
const getFirestore = require("firebase-admin/firestore")

const app =admin.initializeApp({
    credential: admin.credential.cert(sa)
})


exports.testFunc = onRequest((request, response) => {
  coreLogic()
  response.send("Done Processing!");
});

const coreLogic =  async () => {
    logger.info("Starting to check the notifier task")

    

    
   const db  = app.firestore()

   let focusedDate = new Date(new Date().getTime() - 30 * 60000)
   let upperDate = new Date(new Date().getTime() - 24 * 60000)

    const result = await db.collection("reminder").where("reminder_date_time", ">=", focusedDate).where("reminder_date_time", "<", upperDate).get()

    if (result.docs.length == 0) {
        logger.info("No Document to perform, skipping")
    }

    logger.info("Notifying ", result.docs.length, " reminder(s)")
}