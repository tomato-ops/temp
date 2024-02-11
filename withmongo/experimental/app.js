// app.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connect } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_jwt_secret_key'; // Change this to your own secret key

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes

// Root URL route handler
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Display the signup form
app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/signup.html');
});

// Handle signup form submission
app.post('/signup', async (req, res) => {
    const db = await connect();
    const users = db.collection('users');

    try {
        // Check if the username already exists
        const existingUser = await users.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Insert the new user into the database
        await users.insertOne({ username: req.body.username, password: hashedPassword });

        // Generate JWT token
        const token = jwt.sign({ username: req.body.username }, JWT_SECRET);

        // Send the response with registration success message and token
        res.status(201).json({ message: 'Registration successful! Here is your token', token });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});

// Login route
app.post('/login', async (req, res) => {
    const db = await connect();
    const users = db.collection('users');

    try {
	const user = await users.findOne({ username: req.body.username });
        if (!user) {
            return res.status(401).send('Invalid username or password');
        }

	const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch) {
            return res.status(401).send('Invalid username or password');
        }

	const token = jwt.sign({ username: user.username }, JWT_SECRET);
        res.status(200).json({ message: 'Login successful!', token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in');
    }
});

// Sign-out route
app.post('/signout', (req, res) => {
    // Clear token from local storage or wherever it's stored
    // Redirect the user to the login page or any other page
    // For simplicity, let's just send a message
    res.send('You have been signed out');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
