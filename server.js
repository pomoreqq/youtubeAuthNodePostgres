const express = require('express')
const {pool} = require('./database')
const bcrypt = require('bcrypt')
const app = express()


const PORT = process.env.Express_PORT || 4000


app.set('view engine', 'ejs')

app.use(express.urlencoded({extended: false}))

app.get('/', (req,res) => {
    res.render('index')
})


app.get('/users/register', (req ,res) => {
    res.render('register')
})


app.get('/users/login', (req ,res) => {
    res.render('login')
})


app.get('/users/dashboard', (req ,res) => {
    res.render('dashboard', {
        user: 'Tomek'
    })
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
                }
            }
        )
    }
})

app.listen(PORT, () => {
    console.log('listening app at: ' + PORT)
})