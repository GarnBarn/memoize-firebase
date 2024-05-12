/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const sa = require("./key.json")

const app =admin.initializeApp({
    credential: admin.credential.cert(sa)
})


exports.testFunc = onRequest((request, response) => {
    if (request.query.pw !== "mai1234") {
        response.status(401).send("Unauthorized");
        return
    }
    coreLogic()
    response.send("Done Processing!");
});

exports.memoizeNotifier = onSchedule("every minute", async () => {
    await coreLogic()
    logger.info("Done Processing");
});

const coreLogic =  async () => {
    logger.info("Starting to check the notifier task")

   const db  = app.firestore()
   let d = new Date(); 
   d = new Date(d.toUTCString()).setSeconds(0)
   logger.info("UTC: ", d.toLocaleString("en-US"))

   let focusedDate = new Date(new Date(d  + (30 * 60000)).toLocaleString("en-US"))
   let upperDate = new Date(new Date(d + (31 * 60000)).toLocaleString("en-US"))

   logger.info("Checking time between: ", focusedDate)
   logger.info("To: ", upperDate)

    const result = await db.collection("reminder").where("reminder_date_time", ">=", focusedDate).where("reminder_date_time", "<", upperDate).get()

    console.log(result.docs)
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
            notification: { title: `Reminder [${data["title"]} from ${data["reminder_set"]}] due in 30 mins`, body: 'Check it before it due!' },
            token: fcmToken
          };
        const result2 = await app.messaging().send(message)
        logger.info(result2)
    }
}