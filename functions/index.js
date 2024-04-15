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

   let focusedDate = new Date(new Date().getTime() + 30 * 60000)
   let upperDate = new Date(new Date().getTime() + 31 * 60000)

    const result = await db.collection("reminder").where("reminder_date_time", ">=", focusedDate).where("reminder_date_time", "<", upperDate).get()

    if (result.docs.length == 0) {
        logger.info("No Document to perform, skipping")
        return
    }

    logger.info("Notifying ", result.docs.length, " reminder(s)")

    let users = {}
    for (doc in result.docs) {
        const data = result.docs[doc].data()
        const uid = data["uid"]
        if (!users[uid]) {
            const resultFcmToken = (await db.collection("user").doc(uid).get()).data()["fcm"]
            users[uid] = resultFcmToken
        }
        
        const fcmToken = users[uid]
        
        const message = {
            notification: { title: `Reminder [${data["title"]}] due in 30 mins`, body: 'Check it before it due!' },
            token: fcmToken
          };
        const result2 = await app.messaging().send(message)
        logger.info(result2)
    }

    

    // Get all user
  

}