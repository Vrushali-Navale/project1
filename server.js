require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./model/signup');
const payment = require('./model/payment'); // <-- Add this
const Contact = require('./model/Contact');  // ✅ Add this
const path = require('path');
const bcrypt = require('bcrypt');

const Signup = require('./model/signup');  // ✅ Correct path


const app = express();
const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ MongoDB error:', err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('view'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'view', 'login.html'));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
   const user = await User.findOne({ username });
if (user && await bcrypt.compare(password, user.password)) {
  return res.redirect('/Home.html');
// 🔁 redirect to static page
    } else {
      return res.send('<h2>Invalid credentials</h2>');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('<h2>Server error</h2>');
  }
});





app.post('/signup', async (req, res) => {
  const { fullname, email, username, password } = req.body;

  try {
    const existingUser = await Signup.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.send('<h2>User with this email or username already exists</h2>');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Signup({
      fullname,
      email,
      username,
      password: hashedPassword
    });

    await newUser.save();

    // ✅ Redirect to login page after successful signup
    return res.redirect('/login.html');

  } catch (err) {
    console.error(err);
    res.status(500).send('<h2>Internal server error</h2>');
  }
});


app.post('/payment', async (req, res) => {
  const { name, email, card, expiry, cvv } = req.body;

  try {
    // Basic validation
    if (!name || !email || !card || !expiry || !cvv) {
      return res.status(400).send('<h2>All fields are required</h2>');
    }

    // You can add more validation here (email format, card number length, etc.)

    // For security, only store last 4 digits of card
    const cardLast4 = card.replace(/\D/g, '').slice(-4);

    // Save payment record (assuming you have payment model)
    await payment.create({
      name,
      email,
      cardLast4,
      expiry,
      createdAt: new Date()
    });

    // Respond with a simple success message
    res.send(`
      <h2>Payment Successful!</h2>
      <p>Thank you, ${name}. Your payment was processed.</p>
      <a href="/">Go back to Home</a>
    `);

  } catch (err) {
    console.error('Payment processing error:', err);
    res.status(500).send('<h2>Internal server error</h2>');
  }
});


app.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    await Contact.create({ name, email, subject, message });
    res.status(200).json({ success: true, message: "Message received" });
  } catch (err) {
    console.error('❌ Contact form error:', err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});