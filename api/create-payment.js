export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { name, email, amount, message, streamerId } = req.body;

  if (!name || !email || !amount || !message || !streamerId) {
    return res.status(400).send("Missing required fields");
  }

  const orderId = `TIP-${Date.now()}`;
  const returnUrl = `https://streamtips-sandy.vercel.app/api/payment-success?streamer=${streamerId}&name=${encodeURIComponent(name)}&message=${encodeURIComponent(message)}&amount=${amount}`;

  try {
    const cfRes = await fetch("https://sandbox.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "x-api-version": "2022-09-01",
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: parseFloat(amount),
        order_currency: "INR",
        customer_details: {
          customer_id: `cust-${Date.now()}`,
          customer_name: name,
          customer_email: email
        },
        order_meta: {
          return_url: returnUrl
        }
      })
    });

    const data = await cfRes.json();
    console.log("Cashfree Response:", data);

    if (!data.payment_link) {
      return res.status(500).send("Failed to get payment link from Cashfree.");
    }

    res.writeHead(302, { Location: data.payment_link });
    res.end();
  } catch (err) {
    console.error("Cashfree error:", err);
    res.status(500).send("Payment gateway error");
  }
}
