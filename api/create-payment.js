export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { name, email, amount, message, streamerId } = req.body;

  const orderId = `TIP-${Date.now()}`;
  const returnUrl = `https://streamertips.vercel.app/api/payment-success?streamer=${streamerId}&name=${encodeURIComponent(name)}&message=${encodeURIComponent(message)}&amount=${amount}`;

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
          customer_id: `${Date.now()}`,
          customer_name: name,
          customer_email: email || "demo@cashfree.com"
        },
        order_meta: {
          return_url: returnUrl
        }
      })
    });

    const data = await cfRes.json();

    if (!data.payment_link) throw new Error("Cashfree order creation failed.");

    // Redirect to Cashfree Payment Page
    res.writeHead(302, { Location: data.payment_link });
    res.end();
  } catch (err) {
    console.error("Cashfree error:", err);
    res.status(500).send("Payment gateway error");
  }
}
