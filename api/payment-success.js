import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

// Initialize Firebase only once
const firebaseConfig = {
  apiKey: "AIzaSyAhm4FifzdhSgK5FurC_C6_JvWWJTHa568",
  authDomain: "streamertips-2091f.firebaseapp.com",
  projectId: "streamertips-2091f",
  storageBucket: "streamertips-2091f.firebasestorage.app",
  messagingSenderId: "1054015417190",
  appId: "1:1054015417190:web:a8ba4488c5d55927a5b6a7",
  measurementId: "G-QS0K0TDTEZ"
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

export default async function handler(req, res) {
  const { streamer, name, message, amount } = req.query;

  if (!streamer || !amount || !message) {
    return res.status(400).send("Missing tip data");
  }

  try {
    const id = `${Date.now()}`;
    await setDoc(doc(db, "tips", id), {
      to: streamer,
      name: name || "Anonymous",
      message,
      amount: parseFloat(amount),
      timestamp: serverTimestamp()
    });
    res.redirect("/thankyou.html");
  } catch (err) {
    console.error("Error saving tip:", err);
    res.status(500).send("Internal Error");
  }
}
