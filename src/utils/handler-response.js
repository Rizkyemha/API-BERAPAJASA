const { nanoid } = require('nanoid');
const { addUser,
        checkUsernameAvailability,
        checkUsernamePasswordLogin,
        deleteLoan,
        statusLoan,
} = require('./sql-query');
const PINJAMAN = require('../utils/new-loans');
const db_handler = require('./sql-query');

const handler_responses = {
    async addUser_RequestBody(payload) {
        const id = nanoid(18);
        const { nama,
            username,
            password,
            gender,
            tgl_lahir,
            alamat,
        } = payload;

        username.toLowerCase();

        const regex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
        const filterNama = regex.test(nama);

        const regexUsername = /^(?=.*[a-zA-Z])[a-zA-Z0-9._]+$/
        const filterUserNameRegex = regexUsername.test(username);

        const checkUsername = await checkUsernameAvailability(username);

        if (!filterUserNameRegex) {
            throw new Error('Hanya boleh menggunakan huruf, angka, titik, dan underscore');
        }
        if (!filterNama){
            throw new Error('Gunakan spasi hanya ditengah nama');
        }
        if (!nama || !username || !password || !gender || !tgl_lahir || !alamat){
            throw new Error('Isi semua informasi dengan benar');
        }
        if (checkUsername) {
            throw new Error('Nama pengguna telah dipakai');
        }
        const userParams = [
            id,
            nama,
            username,
            password,
            gender,
            tgl_lahir,
            alamat,
        ]
        const status = await addUser(userParams);
        if(!status) {
            throw new Error('gagal memasukan kedalam database');
        }
        return {
            id,
            nama,
            username,
            password,
            gender,
            tgl_lahir,
            alamat,
        }
    },

    async loginUser_RequestBody(payload) {
        const {
            username,
            password,
        } = payload;
        const userData = await checkUsernamePasswordLogin(username, password);
        if (!userData) {
            throw new Error('user tidak ditemukan');
        }
        return userData;
    },

    async getUser_RequestParams(id){
        const request = await db_handler.getUser(id);
        const responses = await Promise.all(request.map(async (item) => {
            const loanId = [item.loan_id];
            await Promise.all(loanId.map(async (loan_id) => {
              const angsuran = await db_handler.getAngsuran(loan_id);
              if(!angsuran) {
                return item;
              }
              item.angsuran = await angsuran;
              return item;
            }));
            return item;
          }));
        return responses;
    },

    async newLoan_RequestBody(payload, params) {
        const {
            nama,
            pokok,
            bunga,
            periode,
            jenis_loan,
        } = payload;

        if (typeof nama != 'string'){
            throw new Error ('Masukan nama dengan benar');
        }

        const {
            user_id
        } = params;

        const loan_id = nanoid(6); 
        
        let total_bunga = 0;
        let total_pelunasan = 0;

        const createAngsuran = async (payload, loan_id) => {
            if (jenis_loan === 'flat') {
                const angsuran = await PINJAMAN.flat(payload, loan_id);
                return angsuran;
            }
            if (jenis_loan === 'efektif') {
                const angsuran = await PINJAMAN.efektif(payload, loan_id);
                return angsuran;
            }
            if (jenis_loan === 'anuitas') {
                const angsuran = await PINJAMAN.anuitas(payload, loan_id);
                return angsuran;
            }
        };

        await db_handler.createLoan([user_id, loan_id, nama, pokok, bunga, periode, total_bunga, total_pelunasan, false, jenis_loan]);
        const angsuran = await createAngsuran(payload, loan_id);

        for (const item of angsuran) {
            total_bunga += item[3];
        }
    
        for (const item of angsuran) {
            total_pelunasan += item[4];
        }

        await db_handler.setTotalPokokBunga([[total_bunga, loan_id], [total_pelunasan, loan_id]]);

        return {
            user_id,
            loan_id,
            nama,
            pokok,
            bunga,
            periode,
            total_bunga,
            total_pelunasan,
            status_lunas : false,
            jenis_loan,
            angsuran : angsuran
        }
    },

    async delete_RequestBody(payload) {
        if (!payload) {
            throw new Error(`${payload} + tidak ditemukan`);
        }
        await deleteLoan(payload);
        return payload;
    },

    async updateStatusLunas(payload) {
        if(!payload) {
            throw new Error(`${payload} + tidak ditemukan`);
        }
        let {loan_id, status_lunas} = payload;
        if (status_lunas === 0){
            status_lunas = 1;
        }
        if (status_lunas === 1){
            status_lunas = 0;
        }
        const response = await statusLoan({loan_id, status_lunas});
        return response;
    }
}

module.exports = handler_responses;