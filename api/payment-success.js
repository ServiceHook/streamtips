import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your.firebaseapp.com",
  projectId: "your-id",
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

export default async function handler(req, res) {
  const { streamer, name, message, amount } = req.query;

  await setDoc(doc(db, "tips", `${Date.now()}`), {
    to: streamer,
    name: name || "Anonymous",
    message,
    amount: parseFloat(amount),
    timestamp: serverTimestamp()
  });

  res.redirect("/thankyou.html");
}
