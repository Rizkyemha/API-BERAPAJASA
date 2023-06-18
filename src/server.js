const Hapi = require('@hapi/hapi');
const DBCONFIG = require('./config');
const mysql = require('mysql2');
const routes = require('./routes');

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

mysql.createConnection(DBCONFIG).connect((error) => {
  if (error) {
    console.error('Gagal terhubung ke server database:', error);
  } else {
    console.log('Terhubung ke server database');
  }
});

server.route(routes);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
