const LogUtils = require('../utils/LogUtils');
const util = require('util');

let logger = null;
let clientERP = null;
let clientSales = null;

class ConnectionDAO {
    constructor(sales, erp) {
        clientSales = sales;
        clientERP = erp;
        logger = LogUtils.getLogger();
    }

    async closeConnections() {
        logger.info('Fechando conexões com os bancos')
        try {
            await clientERP.end();
        } catch (error) {
            logger.info('Erro ao fechar conexão ERP:\n ' + error)
        }
        try {
            await clientSales.end();
        } catch (error) {
            logger.info('Erro ao fechar conexão Sales:\n ' + error)
        }
    }

    async selectErp(sql) {
        logger.info('Select on Erp:\n ' + sql)
        if (process.env.erp_dbtype === 'mysql') {
            const query = util.promisify(clientERP.query).bind(clientERP);
            const rows = await query(sql);
            return rows;
        }

        const res = await clientERP.query(sql);
        return res.rows;
    }

    async selectSales(sql) {
        logger.info('Select on Sales:\n ' + sql)
        if (process.env.sales_dbtype === 'mysql') {
            const query = util.promisify(clientSales.query).bind(clientSales);
            const rows = await query(sql);
            return rows;
        }
        const res = await clientSales.query(sql);
        return res.rows;
    }

    async findOne(rows) {
        console.log(rows, "aqwui");
        return Promise.resolve({ rows });
    }

    async insertSales(sql) {
        try {
            logger.info('\n');
            logger.info(`Insert: ${sql}`)
            await clientSales.query(sql);
        } catch (error) {
            logger.warn('\n', sql);
            logger.fatal('\n', error.message)
        }
    }

    async updateSales(sql) {
        try {
            logger.info('\n');
            logger.info(`Update: ${sql}`)
            await clientSales.query(sql);
        } catch (error) {
            logger.warn('\n', sql);
            logger.fatal('\n', error.message)
        }
    }

    async querySales(sql) {
        try {
            logger.info('\n');
            logger.info(`QuerySales: ${sql}`)
            await clientSales.query(sql);
        } catch (error) {
            logger.warn('\n', sql);
            logger.fatal('\n', error.message)
        }
    }
}

module.exports = ConnectionDAO;
