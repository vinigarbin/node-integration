const LogUtils = require('../utils/LogUtils');
const util = require('util');

let logger = null;

class ConnectionDAO {
    clientERP = null;
    clientSales = null;

    constructor(sales, erp) {
        this.clientSales = sales;
        this.clientERP = erp;
        logger = LogUtils.getLogger();
    }

    async closeConnections() {
        logger.info('Fechando conexões com os bancos')
        try {
            await this.clientERP.end();
        } catch (error) {
            logger.info('Erro ao fechar conexão ERP:\n ' + error)
        }
        try {
            await this.clientSales.end();
        } catch (error) {
            logger.info('Erro ao fechar conexão Sales:\n ' + error)
        }
    }

    async selectErp(sql) {
        logger.info('Select on Erp:\n ' + sql)
        if (process.env.erp_dbtype === 'mysql') {
            const query = util.promisify(this.clientERP.query).bind(this.clientERP);
            const rows = await query(sql);
            return rows;
        }

        const res = await this.clientERP.query(sql);
        return res.rows;
    }

    async selectSales(sql, callback) {
        logger.info('Select on Sales:\n ' + sql)
        if (process.env.sales_dbtype === 'mysql') {
            const query = util.promisify(this.clientSales.query).bind(this.clientSales);
            const rows = await query(sql);
            return rows;
        }
        const res = await this.clientSales.query(sql);

        if (typeof callback === 'function') {
            return callback(res.rows);
        }

        return res.rows;
    }

    async findOne(rows) {
        if (rows.lenght > 1) {
            logger.warn(`Esperado apenas 1 registro, resultado: ${rows.lenght}`);
        }

        return rows[0];
    }

    async insertSales(sql) {
        try {
            logger.info('\n');
            logger.info(`Insert: ${sql}`)
            await this.clientSales.query(sql);
        } catch (error) {
            logger.warn('\n', sql);
            logger.fatal('\n', error.message)
        }
    }

    async updateSales(sql) {
        try {
            logger.info('\n');
            logger.info(`Update: ${sql}`)
            await this.clientSales.query(sql);
        } catch (error) {
            logger.warn('\n', sql);
            logger.fatal('\n', error.message)
        }
    }

    async querySales(sql) {
        try {
            logger.info('\n');
            logger.info(`QuerySales: ${sql}`)
            await this.clientSales.query(sql);
        } catch (error) {
            logger.warn('\n', sql);
            logger.fatal('\n', error.message)
        }
    }
}

module.exports = ConnectionDAO;
