const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Quiz = require('./models/Quiz');
const session = require('express-session')
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');

mongoose.connect("mongodb+srv://akshay:injoker123@testcluster.vsdenle.mongodb.net/?retryWrites=true&w=majority");

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
                    req.session.userId = userData._id;
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
            if(result) {
                // for (var i = 0; i < 2; i++) {
                //     console.log(`${result[i]}`);
                // }
                console.log(result);
                res.render('attemptquiz', { data: result });
            }
        })
    } else {
        res.redirect('/login');
    }
})

// get specific quiz
app.get('/quiz/:quizId', (req,res) => {
    if (req.session.email) {
        const quizId = req.params.quizId;
        Quiz.find({quizId}, (err,result) => {
            console.log(result);
        })
        res.send("Wow")
    } else {
        res.redirect('/login');
    }
})

app.post('/quiz/:quizId', async (req,res) => {
    // if (req.session.email) {
        const quizId = req.params.quizId;
        const userId = req.session.userId;
        const data = req.body;
        console.log(data);
        for (var i=0; i < data.length; i++) {
            const ans = data[i].user_answer;
            const quesId = data[i].questionId;
            // Quiz.find({quizId: quizId}, (err,result) => {
            //     const questions = result[0].options;
            //     console.log(i);
            //     console.log(questions);
            // })
            const wow = await Quiz.findOne({quizId: quizId, options: {$elemMatch: {questionId: quesId}}});
            const ques = wow.options[i].questionId;
            const answer = wow.options[i].correct_answer;
            const wew = {
                ques: answer
            }
            console.log(wew);
        }
        res.send("Wow")
    // } else {
    //     res.redirect('/login');
    // }
})

app.get('/entersub', (req, res) => {
    if (req.session.isAdmin) {
        res.render('entersub');
    } else {
        res.redirect('/student');
    }
})


app.get('/play', (req, res) => {
    res.render('play');
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
})

//<% include views/forget.ejs %>
//Test code
app.post('/api/play', (req, res) => {
    if (req.session.isAdmin) {
        const data = req.body;
        console.log(data.title);
        console.log(data.options);
        const quizFinal = new Quiz({
            title: data.title,
            options: data.options,
            quizId: uuidv4()
        })
        quizFinal.save();
        res.send('Quiz created successfully');
        }
    else {
        res.redirect('/login')
    }
});


// End


app.listen(3000, () => {
    console.log('Server is running on port 3000');
})