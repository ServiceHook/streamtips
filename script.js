// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAhm4FifzdhSgK5FurC_C6_JvWWJTHa568",
  authDomain: "streamertips-2091f.firebaseapp.com",
  projectId: "streamertips-2091f",
  storageBucket: "streamertips-2091f.firebasestorage.app",
  messagingSenderId: "1054015417190",
  appId: "1:1054015417190:web:a8ba4488c5d55927a5b6a7",
  measurementId: "G-QS0K0TDTEZ"
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);

// ✅ Use compat SDK
const auth = firebase.auth();
const db = firebase.firestore();


// ==================== AUTH ====================

function login() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, pass)
    .then(() => location.href = "dashboard.html")
    .catch(e => document.getElementById("auth-msg").innerText = e.message);
}

function signup() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, pass)
    .then(user => {
      db.collection("streamers").doc(user.user.uid).set({ email: user.user.email });
      location.href = "dashboard.html";
    })
    .catch(e => document.getElementById("auth-msg").innerText = e.message);
}

function logout() {
  auth.signOut().then(() => location.href = "index.html");
}


// ==================== DASHBOARD ====================

if (location.pathname.includes("dashboard")) {
  auth.onAuthStateChanged(user => {
    if (user) {
      document.getElementById("userEmail").innerText = user.email;
      const link = `https://streamertips.vercel.app/tip.html?streamer=${user.uid}`;
      document.getElementById("tipLink").innerText = link;

      db.collection("tips")
        .where("to", "==", user.uid)
        .orderBy("timestamp", "desc")
        .onSnapshot(snap => {
          let html = "";
          snap.forEach(doc => {
            const data = doc.data();
            html += `<p><b>${data.name || "Anon"}</b>: ₹${data.amount} – ${data.message}</p>`;
          });
          document.getElementById("tipsList").innerHTML = html;
        });
    } else {
      location.href = "index.html";
    }
  });
}


// ==================== TIP SENDER ====================

function sendTip() {
  const urlParams = new URLSearchParams(window.location.search);
  const streamerId = urlParams.get("streamer");
  const name = document.getElementById("tipName").value || "Anonymous";
  const message = document.getElementById("tipMsg").value;
  const amount = parseFloat(document.getElementById("tipAmount").value);
  const email = `${Date.now()}@tip.jachu.xyz`; // Dummy email to make PayU happy

  if (!streamerId || !amount || !message) {
    alert("Please fill all fields");
    return;
  }

  // POST to serverless function
fetch("/api/create-payment", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    streamerId,
    name,
    email,
    amount,
    message
  })
})
.then(res => {
  if (res.redirected) {
    window.location.href = res.url;
  } else {
    return res.text().then(err => { throw new Error(err); });
  }
})
.catch(err => {
  alert("Payment error. Try again.");
  console.error("Error:", err);
});




// ==================== OBS ALERT ====================

if (location.pathname.includes("alert")) {
  const streamer = new URLSearchParams(window.location.search).get("streamer");

  if (streamer) {
    db.collection("tips")
      .where("to", "==", streamer)
      .orderBy("timestamp", "desc")
      .limit(1)
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === "added") {
            const d = change.doc.data();
            const msg = `New tip from ${d.name || "Anon"}: ${d.message}`;
            document.getElementById("alertBox").innerText = msg;

            // ✅ Text-to-speech
            const utter = new SpeechSynthesisUtterance(msg);
            speechSynthesis.speak(utter);

            setTimeout(() => {
              document.getElementById("alertBox").innerText = "";
            }, 8000);
          }
        });
      });
  }
}
