// Add these imports
const jwt = require('jsonwebtoken');

// Inside your app.post('/login', ...) route handler
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
