const LogUtils = require('../utils/LogUtils');

let logger = null;
let clientERP = null;
let clientSales = null;

class ConnectionDAO {
    constructor(sales, erp) {
        clientSales = sales;
        clientERP = erp;
        logger = LogUtils.getLogger();
    }

    closeConnections() {
        logger.info('Fechando conexões com os bancos')
        clientERP.end();
        clientSales.end();
    }

    async selectErp(sql) {
        logger.info('Select on Erp:\n ' + sql)
        if (process.env.erp_dbtype === 'mysql') {
            const query = util.promisify(clientERP.query).bind(clientERP);
            const rows = await query(sql);
            clientERP.end();
            return rows;
        }

        const res = await clientERP.query(sql);

        return res.rows;
    }

    async selectSales(sql) {
        logger.info('Select on Sales:\n ' + sql)
        if (process.env.erp_dbtype === 'mysql') {
            const query = util.promisify(clientSales.query).bind(clientSales);
            const rows = await query(sql);
            clientSales.end();
            return rows;
        }
        const res = await clientSales.query(sql);

        return res.rows;
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
