const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Quiz = require('./models/Quiz');
const session = require('express-session')
const cookieParser = require('cookie-parser');

mongoose.connect("mongodb://127.0.0.1:27017/test_project");

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
const cookieAge = 1000 * 60 * 60 * 12;
app.use(session({
    secret: "K@mikak3",
    saveUninitialized: true,
    cookie: {
        maxAge: cookieAge
    },
    resave: false
}))

app.use(cookieParser());

app.get('/register', (req, res) => {
    res.render('login');
})

app.post('/register', (req, res) => {
    const { email, password, phone } = req.body;
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            res.send("Error occurred");
        } else {
            const user = new User({
                email: email,
                password: hash,
                phone: phone,
                isAdmin: false
            });
            user.save();
            res.send('User created successfully');
        }
    });
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email: email }, (err, userData) => {
        if (err) throw err;
        if (userData) {
            console.log(userData)
            bcrypt.compare(password, userData.password, (err, result) => {
                if (result) {
                    req.session.email = userData.email;
                    req.session.isAdmin = userData.isAdmin;
                    res.redirect('student');
                } else {
                    res.send('Invalid email/password');
                }
            });
        }
    })
})

app.get('/forget', (req, res) => {
    res.render('forget');
})
app.get('/header', (req, res) => {
    res.render('header');
})

app.get('/student', (req, res) => {
    console.log(req.session.email);
    console.log(req.session.isAdmin);
    if (req.session.email) {
        const email = req.session.email;
        res.render('student', { user: email });
    } else {
        res.redirect('/login');
    }
})
app.get('/admin', (req, res) => {
    if (req.session.isAdmin) {
        res.render('admin');
    } else {
        res.redirect('/student');
    }
})
app.get('/attemptquiz', (req, res) => {
    if (req.session.email) {
        const email = req.session.email;
        Quiz.find({}, (err, result) => {
            console.log(result);
            console.log(result[0]);
            // for (var i = 0; i < 2; i++) {
            //     console.log(`${result[i]}`);
            // }
        })
        res.render('attemptquiz', { user: email });
    } else {
        res.redirect('/login');
    }
})

app.get('/createquiz', (req, res) => {
    if (req.session.isAdmin) {
        res.render('createquiz');
    } else {
        res.redirect('/student');
    }
})
app.get('/student', (req, res) => {
    console.log(req.session.email);
    console.log(req.session.isAdmin);
    if (req.session.email) {
        const email = req.session.email;
        res.render('student', { user: email });
    } else {
        res.redirect('/login');
    }
})

app.get('/viewquiz', (req, res) => {

        if (req.session.email) {
            const email = req.session.email;
            res.render('viewquiz', { user: email });
        } else {
            res.redirect('/login');
        }
    })
    // app.get('/viewres', (req, res) => {
    //     res.render('viewres');
    // })
    // app.get('/play', (req, res) => {
    //     res.render('play');
    // })

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
})

//<% include views/forget.ejs %>
//Test code
app.post('/api/play', (req, res) => {
    const data = req.body;
    console.log(data.title);
    console.log(data.options);
    const quizFinal = new Quiz({
        title: data.title,
        options: data.options
    })
    quizFinal.save();
    res.send('Quiz created successfully');
});


// End


app.listen(3000, () => {
    console.log('Server is running on port 3000');
})