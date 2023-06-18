const DBCONFIG = require('../config');
const mysql = require('mysql2');

const db_handler = {

    async checkUsernameAvailability (username) {
        const connect = mysql.createConnection(DBCONFIG);
        const selectUserQuery = `
            SELECT COUNT(*) AS count
            FROM user
            WHERE username = ?
        `;
        const params = [username];
    
        // Eksekusi query untuk mendapatkan jumlah pengguna dengan username yang sama
        const result = await db_handler.executeQuery(connect, selectUserQuery, params);
        const count = result[0].count;
        return count > 0;
    },

    async checkUsernamePasswordLogin (username, password) {
        const connect = mysql.createConnection(DBCONFIG);
        const selectUserQuery = `
            SELECT *
            FROM user
            WHERE username = ? AND password = ?
        `;
        const params = [username, password];

        const result = await db_handler.executeQuery(connect, selectUserQuery, params);
        const userData = result[0];
        if (!userData) {
            return null;
          }
        const response = {
            id: userData.id,
            nama: userData.nama,
            username: userData.username,
            password: userData.password,
            gender: userData.gender,
            tgl_lahir: userData.tgl_lahir,
            alamat: userData.alamat
        }
        return response;
    },

    async addUser(userParams) {
        const connect = mysql.createConnection(DBCONFIG);
        const insertUserQuery = `
        INSERT INTO user (id, nama, username, password, gender, tgl_lahir, alamat)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db_handler.executeQuery(connect, insertUserQuery, userParams);
        return true;
    },

    async getUser(userParams) {
      const connect = mysql.createConnection(DBCONFIG);
      const insertUserQuery = `
      SELECT * FROM loan WHERE user_id = ?
      `;
      const response = await db_handler.executeQuery(connect, insertUserQuery, userParams);
      return response;
    },

    async getAngsuran(userParams) {
      const connect = mysql.createConnection(DBCONFIG);
      const insertUserQuery = `
      SELECT * FROM angsuran WHERE loan_id = ?
      `;
      const response = await db_handler.executeQuery(connect, insertUserQuery, userParams);
      return response;
    },

    async createAngsuran(userParams) {
        const connect = mysql.createConnection(DBCONFIG);
        const insertUserQuery = `
        INSERT INTO angsuran (loan_id, periode, angsuran_pokok, angsuran_bunga, total_angsuran)
        VALUES (?, ?, ?, ?, ?)
        `;
        await db_handler.executeQuery(connect, insertUserQuery, userParams);
        return userParams;
    },

    async createLoan(userParams) {
      const connect = mysql.createConnection(DBCONFIG);
      const insertUserQuery = `
      INSERT INTO loan (user_id, loan_id, nama, pokok, bunga, periode, total_bunga, total_pelunasan, status_lunas, jenis_loan)
      VALUES ((SELECT id FROM user WHERE id = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await db_handler.executeQuery(connect, insertUserQuery, userParams);
      return userParams;
    },

    async deleteLoan(loan_id) {
      const connect = mysql.createConnection(DBCONFIG);
      const insertUserQuery = `DELETE FROM loan WHERE loan_id = ?
      `;
      await db_handler.executeQuery(connect, insertUserQuery, loan_id);
      return loan_id;
    },

    async statusLoan(payload) {
      const connect = mysql.createConnection(DBCONFIG);
      const insertUserQuery = `
      UPDATE loan SET status_lunas = ? WHERE loan_id = ?
      `;
      await db_handler.executeQuery(connect, insertUserQuery, [payload.status_lunas, payload.loan_id]);
      return payload;
    },

    async setTotalPokokBunga (userParams) {
      const connect = mysql.createConnection(DBCONFIG);
      const insertUserQuery1 = `
      UPDATE loan SET total_bunga = ? WHERE loan_id = ?
      `;
      const insertUserQuery2 = `
      UPDATE loan SET total_pelunasan = ? WHERE loan_id = ?
      `;
      await db_handler.executeQuery(connect, insertUserQuery1, userParams[0]);
      await db_handler.executeQuery(connect, insertUserQuery2, userParams[1]);
      return userParams;
    },

    async executeQuery(connection, query, params) {
      return new Promise((resolve, reject) => {
        connection.query(query, params, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    },
}

module.exports = db_handler;