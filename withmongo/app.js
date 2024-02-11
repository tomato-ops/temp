// app.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connect } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Register endpoint
app.post('/register', async (req, res) => {
    const db = await connect();
    const collection = db.collection('users');
    
    try {
        // Hash the user's password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        
        // Create a new user object
        const user = { username: req.body.username, password: hashedPassword };
        
        // Insert the user into the database
        await collection.insertOne(user);
        
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const db = await connect();
    const collection = db.collection('users');
    
    const user = await collection.findOne({ username: req.body.username });
    
    if (user == null) {
        return res.status(400).send('User not found');
    }

    try {
        // Check if the provided password matches the hashed password
        if (await bcrypt.compare(req.body.password, user.password)) {
            // Generate a JWT token
            const token = jwt.sign({ username: user.username }, 'secret');
            res.json({ token });
        } else {
            res.status(401).send('Incorrect password');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
