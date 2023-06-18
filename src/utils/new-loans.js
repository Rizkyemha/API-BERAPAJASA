const db_handler = require('./sql-query');

const PINJAMAN = {
    async flat(payload, loan_id){
        const {
            pokok,
            bunga,
            periode,
        } = payload;
        const angsuran = [];
        let angsuran_pokok = Math.ceil(pokok/periode);
        let angsuran_bunga = Math.ceil(pokok*(bunga/100));
        for (let i = 1; i <= periode; i++) {
            let total_angsuran = Math.round((angsuran_pokok + angsuran_bunga));

            angsuran_pokok = await this.roundToNearest50(angsuran_pokok);
            angsuran_bunga = await this.roundToNearest50(angsuran_bunga);
            total_angsuran = await this.roundToNearest50(total_angsuran);

            const itemAngsuran = await db_handler.createAngsuran([loan_id, i, angsuran_pokok, angsuran_bunga, total_angsuran]);
            angsuran.push(itemAngsuran);
        }
        return angsuran;
    },
    async efektif (payload, loan_id){
        const {
            pokok,
            bunga,
            periode,
        } = payload;
        const angsuran = [];
        let sisaPokok = pokok;
        let angsuran_pokok = pokok/periode;
        for (let i = 1; i <= periode; i++) {
            let angsuran_bunga = sisaPokok * (bunga / 100); // bunga yang diangsur
            let total_angsuran = angsuran_pokok + angsuran_bunga;
            sisaPokok -= angsuran_pokok;

            angsuran_pokok = await this.roundToNearest50(angsuran_pokok);
            angsuran_bunga = await this.roundToNearest50(angsuran_bunga);
            total_angsuran = await this.roundToNearest50(total_angsuran);
            
            const itemAngsuran = await db_handler.createAngsuran([loan_id, i, angsuran_pokok, angsuran_bunga, total_angsuran]);
            angsuran.push(itemAngsuran);
        }
        return angsuran;
    },

    async anuitas (payload, loan_id) {
        let {
            pokok,
            bunga,
            periode
        } = payload;

        const angsuran = [];
        let total_angsuran = pokok * (bunga / 100) / (1 - Math.pow(1 + bunga / 100, -periode));

        for (let i = 1; i <= periode; i++) {
          let angsuran_bunga = pokok * (bunga / 100);
          let angsuran_pokok = total_angsuran - angsuran_bunga;
          pokok -= angsuran_pokok;
          angsuran_pokok = await this.roundToNearest50(angsuran_pokok);
          angsuran_bunga = await this.roundToNearest50(angsuran_bunga);
          total_angsuran = await this.roundToNearest50(total_angsuran);
      
          let itemAngsuran = await db_handler.createAngsuran([loan_id, i, angsuran_pokok, angsuran_bunga, total_angsuran]);
          angsuran.push(itemAngsuran);
        }
        return angsuran;
    },

    async roundToNearest50 (number) {
        const rounded = Math.round(number);
        const lastTwoDigits = rounded % 100;
        const remainder = lastTwoDigits % 50;
        let roundedNumber;
      
        if (remainder < 25) {
          roundedNumber = rounded - remainder;
        } else {
          roundedNumber = rounded + (50 - remainder);
        }
      
        return roundedNumber;
      }
}

module.exports = PINJAMAN;