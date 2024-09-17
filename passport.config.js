const LocalStrategy = require('passport-local').Strategy

const { authenticate } = require('passport')
const { pool } = require('./database')
const bcrypt = require('bcrypt')


function initialize(passport) {
    const authenticateUser = (email,password,done) => {
        pool.query(
            `SELECT * FROM users WHERE email = $1`,[email], (error,results) => {
                if(error) {
                    throw error
                }

                console.log(results.rows)

                if(results.rows.length > 0) {
                    const user = results.rows[0];

                    bcrypt.compare(password,user.password, (error, isMatch) => {
                        if(error) {
                            throw error
                        }
                        if(isMatch) {
                            return done(null, user)
                        } else {
                            return done(null, false, {message: ' Password is not correct!'})
                        }
                    })
                } else {
                    return done(null, false, {message: 'Email is not in database'})
                }
            }
        )
    }

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },authenticateUser
)
)
passport.serializeUser((user,done) => done(null,user.id) );
passport.deserializeUser((id,done) => {
    pool.query(
        `SELECT * FROM users WHERE id = $1`, [id], (error,results) => {
            if (error) {
                throw error
            }
            return done(null,results.rows[0])
        }
    )
})
}

module.exports = initialize