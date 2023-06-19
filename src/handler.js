const { 
    addUser_RequestBody,
    getUser_RequestParams,
    loginUser_RequestBody,
    newLoan_RequestBody, 
    delete_RequestBody,
    updateStatusLunas,
} = require('./utils/handler-response');

const getUser = async (request, h) => {
    try {
        const user = await getUser_RequestParams(request.params.user_id);
        const filterJenis = request.query.jenis_loan;
        const filterLunas = request.query.status_lunas;
        const filter = async (user, filterJenis, status_lunas) => {
            
            if(filterJenis == '' && status_lunas == '') {
                return user;
            }
            if(filterJenis && status_lunas == '') {
                user = await user.filter(obj => obj.jenis_loan === filterJenis);
                return user;
            }
            if(filterJenis == '' && status_lunas) {
                user = await user.filter(obj => obj.status_lunas === Number(status_lunas));
                return user;
            }
        }
        const loan = await filter(user, filterJenis, filterLunas);
        const response = h.response({
            status: 'success',
            message: 'id menemukan user',
            loan,
        })
        response.code(200);
        return response;
    } catch (err) {
        const response = h.response({
            status: 'fail',
            message: `${err}`
        })
        response.code(401);
        return response;
    }
}

const loginUser = async (request, h) => {
    try {
        const user = await loginUser_RequestBody(request.payload);
        const response = h.response({
            user,
        })
        response.code(201);
        return response;
    } catch (err) {
        const response = h.response ({
            status: 'fail',
            message: `${err}`,
        })
        response.code(401);
        return response;
    }
}

const addUser = async (request, h) => {
    try {
        const user = await addUser_RequestBody(request.payload);
        const response = h.response({
            status: 'success',
            message: 'akun berhasil ditambahkan',
            user,
        })
        response.code(201);
        return response;
    } catch (err) {
        const response = h.response({
            status: 'fail',
            message: `${err}`
        })
        response.code(400);
        return response;
    }
}

const newLoan = async (request, h) => {
    try {
        const loan = await newLoan_RequestBody(request.payload, request.params);
        const response = h.response({
            status: 'succes',
            message: 'berhasil memasukan pinjaman baru',
            data : {
                user_id: loan.user_id,
                loan_id: loan.loan_id,
                nama: loan.nama,
                pokok: loan.pokok,
                bunga: loan.bunga,
                periode: loan.periode,
                jenis_pinjaman: loan.jenis_loan
            }
        })
        response.code(201);
        return response;
    } catch (err) {
        const response = h.response({
            status: 'fail',
            message: `${err}`
        })
        response.code(400);
        return response;
    }
}

const deleteLoan = async (request, h) => {
    try {
        const delLoan = await delete_RequestBody(request.payload.loan_id);
        const response = h.response({
            status: 'succes',
            message: `berhasil menghapus pinjaman ${delLoan}`,
        });
        response.code(201);
        return response;
    } catch (error) {
        const response = h.response({
            status: 'fail',
            message: `${error}`,
        });
        response.code(401);
        return response;
    }
}

const updateStatusLoan = async (request, h) => {
    try {
        const updateStatus = await updateStatusLunas(request.payload);
        const response = h.response({
            status: 'succes',
            message: `berhasil mengupdate status pinjaman dengan id ${updateStatus.loan_id}`,
        });
        response.code(201);
        return response;
    } catch (error) {
        const response = h.response({
            status: 'fail',
            message: `${error}`,
        });
        response.code(401);
        return response;
    }
}

module.exports = {
    getUser,
    addUser,
    loginUser,
    newLoan,
    deleteLoan,
    updateStatusLoan,
}