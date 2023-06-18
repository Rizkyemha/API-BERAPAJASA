const DBCONFIG = {
    host: 'process.env.HOST',
    port: 'process.env.DB_PORT',
    database: 'process.env.DATABASE',
    user: 'process.env.USER',
    password: 'process.env.PASSWORD',
    url: 'process.env.URL',
}

module.exports = DBCONFIG;