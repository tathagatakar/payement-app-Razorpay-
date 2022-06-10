const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const dotenv = require('dotenv');
const bodyparser = require('body-parser');
const Razorpay = require('razorpay');

app.use(require("body-parser").json());
dotenv.config();
app.set("view engine", "ejs")

var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});


app.get('/', (req, res) => {
    res.render("payment", {k1: process.env.KEY_ID, k2:process.env.KEY_SECRET});
})

app.post('/create/orderId', (req, res) => {
    //console.log("create orderId request ", req.body);
    var options = {
        amount: req.body.amount,
        currency: "INR",
        receipt: "rcp1"
    };
    instance.orders.create(options, function (err, order) {
        //console.log(order);
        res.send({orderId: order.id});
    });
})

app.post("/api/payment/verify", (req, res) => {
    let body = req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;
    var crypto = require("crypto");
    var expectedSignature = crypto.createHmac('sha256', 'GVOWRIZ3W3AuiPjdKSk4yvKq').update(body.toString()).digest('hex');
    console.log("sig received ", req.body.response.razorpay_signature);
    console.log("sig generated ", expectedSignature);
    var response = {
        "signatureIsValid": "false"
    }
    if (expectedSignature === req.body.response.razorpay_signature) response = {
        "signatureIsValid": "true"
    }
    res.send(response);
});


app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})