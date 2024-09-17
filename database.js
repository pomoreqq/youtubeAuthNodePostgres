require('dotenv').config();

const { Pool} = require('pg')


const isProduction = process.env.NODE_ENV === 'production'


const connectionString = `postgresql://${process.env.USER}:${process.env.PASSWORD}@${process.env.HOST}:${process.env.PORT}/${process.env.DATABASE}`

const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE : connectionString
})

module.exports = {
    pool
}