const DBCONFIG = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 8061,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    url: process.env.DB_URL,
}

module.exports = DBCONFIG;