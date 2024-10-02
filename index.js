const express = require("express");
const fs = require("fs");
const path = require('path');
const bcrypt = require("bcrypt"); 
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const port = 3000; // Keep your backend port 3000


// Middleware for sessions
app.use(session({
    secret: 'your-secret-key', // Change this to a strong secret
    resave: false,
    saveUninitialized: true,
}));


// Middleware to parse form data
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.get('/', (req, res)=>{
    res.send(`its working at ${port}`);
});

// Serve home.html
app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/public/home.html');
});

// Registration endpoint remains the same
app.post('/register', (req, res) => {
    const { name, email, password, contact } = req.body;

    if (!name || !email || !password || !contact) {
        res.status(400).send('Please fill in all the fields');
        return;
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = { name, email, password: hashedPassword, contact };

    console.log(newUser)
    const filePath = __dirname + '/users.json';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                fs.writeFile(filePath, JSON.stringify([newUser], null, 2), (err) => {
                    if (err) {
                        res.status(500).send('Error saving user');
                        return;
                    }
                    res.redirect('/home');
                });
            } else {
                res.status(500).send('Error reading user data');
            }
            return;
        }

        const users = JSON.parse(data);
        users.push(newUser);

        fs.writeFile(filePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                res.status(500).send('Error saving user');
                return;
            }
            res.redirect('/home');
        });
    });
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html')); // Adjust the path to where login.html is located
});


// Login Route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Read existing users from users.json
    fs.readFile('users.json', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading user data');
            return;
        }

        // Parse existing users
        let users = [];
        if (data.length) {
            users = JSON.parse(data);
        }

        // Find user by email
        const user = users.find(user => user.email === email);
        if (user) {
            // Compare password with hashed password
            if (bcrypt.compareSync(password, user.password)) {
                // Password matches, redirect to home page
                res.redirect('/home');
            } else {
                // Password does not match
                res.status(401).send('Incorrect password. Please try again.');
            }
        } else {
            // User not found
            res.status(404).send('User not found. Please create an account.');
        }
    });
});



// Route for logging out
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.redirect('/login'); // Redirect to login page
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
