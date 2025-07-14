import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { amount, name, email, message, streamerId } = req.body;

  const key = process.env.PAYU_KEY;      // example: gtKFFx
  const salt = process.env.PAYU_SALT;    // example: eCwWELxi
  const txnid = `TXN${Date.now()}`;
  const productinfo = "Streamer Tip";

  // Hash string format: key|txnid|amount|productinfo|name|email|||||||||||salt
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${name}|${email}|||||||||||${salt}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  const payuUrl = "https://test.payu.in/_payment"; // Use secure.payu.in for live

  // Return HTML that auto-submits the form to PayU
  const formHTML = `
    <html><body onload="document.forms[0].submit()">
      <form action="${payuUrl}" method="post">
        <input type="hidden" name="key" value="${key}" />
        <input type="hidden" name="txnid" value="${txnid}" />
        <input type="hidden" name="amount" value="${amount}" />
        <input type="hidden" name="productinfo" value="${productinfo}" />
        <input type="hidden" name="firstname" value="${name}" />
        <input type="hidden" name="email" value="${email}" />
        <input type="hidden" name="surl" value="https://streamertips.vercel.app/api/payment-success?streamer=${streamerId}&name=${encodeURIComponent(name)}&message=${encodeURIComponent(message)}&amount=${amount}" />
        <input type="hidden" name="furl" value="https://streamertips.vercel.app/thankyou.html" />
        <input type="hidden" name="hash" value="${hash}" />
      </form></body></html>
  `;

  res.setHeader("Content-Type", "text/html");
  res.send(formHTML);
}
