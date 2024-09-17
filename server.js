const express = require('express')
const {pool} = require('./database')
const bcrypt = require('bcrypt')
const app = express()
const session = require('express-session')
const flash = require('express-flash')
const passport = require('passport')


const initializePassport = require('./passport.config')

initializePassport(passport)

const PORT = process.env.Express_PORT || 4000


app.set('view engine', 'ejs')

app.use(express.urlencoded({extended: false}))

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())

app.use(passport.session())

app.use(flash())

app.get('/', (req,res) => {
    res.render('index')
})


app.get('/users/register',checkAuth, (req ,res) => {
    res.render('register')
})


app.get('/users/login', checkAuth, (req ,res) => {
    res.render('login')
})


app.get('/users/dashboard', checkNotAuth, (req ,res) => {
    res.render('dashboard', {
        user: req.user.name
    })
})

app.get('/users/logout', (req,res,next) => {
    req.logout((err) => {
        if(err) {
            return next(err)
        }
    });
    req.flash('success_message', 'You logged out')
    res.redirect('/users/login')
})


app.post('/users/register', async (req,res) => {
    let {name, email,password,confirmPassword} = req.body

    console.log({name,email,password,confirmPassword})

    let errors = [];

    if (!name || !email || !password || !confirmPassword) {
        errors.push({message: 'please eneter all fields'})
    }

    if (password.length < 6) {
        errors.push({message: 'password should be atleast 6 characters'})
    }

    if(password != confirmPassword) {
        errors.push({message: "Passwords do not match"})
    }

    if (errors.length > 0) {
        res.render('register',{errors})
    } else {
        let hashedPassword = await bcrypt.hash(password,10);
        
        pool.query(
            `SELECT * FROM users
            WHERE email =$1`,[email],(error,result) => {
                if(error) {
                    throw error
                }
                
                // console.log(result.rows)

                if(result.rows.length > 0) {
                    errors.push({message: 'this email already exist in database'})
                    res.render('register',{errors})
                } else {
                    pool.query(
                        `INSERT INTO users (name,email,password)
                        VALUES ($1,$2,$3)
                        RETURNING id, password`,[name,email,hashedPassword], (err,results) => {
                            if (err) {
                                throw err
                            }
                            console.log(results.rows)
                            req.flash('success_message', "You are registered. Log in")
                            res.redirect('/users/login')
                        }

                    )
                }
            }
        )
    }
})



app.post('/users/login', (req, res, next) => {
    console.log(req.body);  // Sprawdzenie, czy dane logowania docierają do serwera
    passport.authenticate('local', {
        successRedirect: '/users/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});


function checkAuth(req,res,next) {
    if(req.isAuthenticated()) {
        return res.redirect('/users/dashboard')
    } 
    next()
}

function checkNotAuth(req,res,next) {
    if(req.isAuthenticated()) {
        return next()
    }
    res.redirect('/users/login')
}

app.listen(PORT, () => {
    console.log('listening app at: ' + PORT)
})


