const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const mysql = require("mysql");
const app = express();
const PORT = process.env.DB_HOST;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "razorpay_payment",
});
app.post("/order", async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: "rzp_test_f1vHA1n1g1kTNM",
      key_secret: "PxZdkgiPBh1v6ENQ0YJjqOxx",
    });

    const options = req.body;
    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).send("Error");
    }
    console.log(order)
    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});

app.post("/order/validate", async (req, res) => {
  console.log(req.body,"req.body")
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Validate signature as you did before
     const sha = crypto.createHmac("sha256", "PxZdkgiPBh1v6ENQ0YJjqOxx");
  //order_id + "|" + razorpay_payment_id
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest("hex");

  if (digest !== razorpay_signature) {
    return res.status(400).json({ msg: "Transaction is not legit!" });
  }

  // Store payment details in the database
    // Set default values for amount and currency
    const amount = req.body.amount || 600; // Default amount is 500 if not provided
    const currency = req.body.currency || "PLR"; // Default currency is INR if not provided
  
    res.json({
      msg: "success",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  // db.query(
  //   "INSERT INTO payments (order_id, payment_id, amount, currency, razorpay_signature) VALUES (?, ?, ?, ?, ?)",
  //   [razorpay_order_id, razorpay_payment_id, amount, currency, razorpay_signature],
  //   (error, results) => {
  //     if (error) {
  //       console.error(error);
  //       return res.status(500).json({ msg: "Error storing payment details" });
  //     }

  //     console.log({
  //       msg: "success",
  //       orderId: razorpay_order_id,
  //       paymentId: razorpay_payment_id,
  //     });

  //     res.json({
  //       msg: "success",
  //       orderId: razorpay_order_id,
  //       paymentId: razorpay_payment_id,
  //     });
  //   }
  // );
});


// app.post("/order/validate", async (req, res) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//     req.body;

//   const sha = crypto.createHmac("sha256", "PxZdkgiPBh1v6ENQ0YJjqOxx");
//   //order_id + "|" + razorpay_payment_id
//   sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
//   const digest = sha.digest("hex");
//   if (digest !== razorpay_signature) {
//     return res.status(400).json({ msg: "Transaction is not legit!" });
//   }
//   console.log({
//     msg: "success",
//     orderId: razorpay_order_id,
//     paymentId: razorpay_payment_id,
//   }) 
//   res.json({
//     msg: "success",
//     orderId: razorpay_order_id,
//     paymentId: razorpay_payment_id,
//   });
// });

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
