import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { amount, name, email, message, streamerId } = req.body;

  const key = process.env.PAYU_KEY;
  const salt = process.env.PAYU_SALT;
  const txnid = `TXN${Date.now()}`;
  const productinfo = "Streamer Tip";

  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${name}|${email}|||||||||||${salt}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  const payuUrl = `https://secure.payu.in/_payment`;
  
  const formHTML = `
    <html>
    <body onload="document.forms[0].submit()">
      <form action="${payuUrl}" method="post">
        <input type="hidden" name="key" value="${key}" />
        <input type="hidden" name="txnid" value="${txnid}" />
        <input type="hidden" name="amount" value="${amount}" />
        <input type="hidden" name="productinfo" value="${productinfo}" />
        <input type="hidden" name="firstname" value="${name}" />
        <input type="hidden" name="email" value="${email}" />
        <input type="hidden" name="phone" value="" />
        <input type="hidden" name="surl" value="https://streamertips.vercel.app/api/payment-success?streamer=${streamerId}&name=${encodeURIComponent(name)}&message=${encodeURIComponent(message)}&amount=${amount}" />
        <input type="hidden" name="furl" value="https://streamertips.vercel.app/thankyou.html" />
        <input type="hidden" name="hash" value="${hash}" />
      </form>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(formHTML);
}
