const { Pool } = require('pg');
const mysql = require('mysql');
const LogUtils = require('../utils/LogUtils');
let logger = null;

class Connection {
    constructor() {
        logger = LogUtils.getLogger()
    }

    async connectSales() {
        const { sales_dbtype } = process.env;
        let pool = null;

        if (sales_dbtype === 'postgres') {
            pool = new Pool({
                user: process.env.sales_user,
                password: process.env.sales_password,
                port: process.env.sales_port,
                host: process.env.sales_host,
                database: process.env.sales_database
            });

            //teste de conexão
            const client = await pool.connect();
            logger.info(`Pool de conexões criado no ${sales_dbtype} - Sales`);

            const res = await client.query('SELECT NOW()');
            logger.info(res.rows[0]);
            client.release();

            return pool.connect();
        }

        if (sales_dbtype === 'mysql') {
            pool = mysql.createConnection({
                user: process.env.sales_user,
                password: process.env.sales_password,
                port: process.env.sales_port,
                host: process.env.sales_host,
                database: process.env.sales_database
            });

            logger.info(`Pool de conexões criado no ${sales_dbtype}`);
            pool.query('SELECT NOW() as now', function (error, results, fields) {
                if (error) {
                    logger.error(error)
                    throw error;
                }
                logger.info('The time is: ', results[0].now);
            });

            return pool;
        }

    }

    async connectErp() {

        const { erp_dbtype } = process.env;
        let pool = null;

        if (erp_dbtype === 'postgres') {
            pool = new Pool({
                user: process.env.erp_user,
                password: process.env.erp_password,
                port: process.env.erp_port,
                host: process.env.erp_host,
                database: process.env.erp_database,
            });

            //teste de conexão
            const client = await pool.connect();
            logger.info(`Pool de conexões criado no ${erp_dbtype} - ERP`);

            const res = await client.query('SELECT NOW()');
            logger.info(res.rows[0]);
            client.release();

            return pool.connect();
        }

        if (erp_dbtype === 'mysql') {
            pool = mysql.createConnection({
                user: process.env.erp_user,
                password: process.env.erp_password,
                port: process.env.erp_port,
                host: process.env.erp_host,
                database: process.env.erp_database
            });

            logger.info(`Pool de conexões criado no ${erp_dbtype}`);
            pool.query('SELECT NOW() as now', function (error, results, fields) {
                if (error) {
                    logger.error(error)
                    throw error;
                }
                logger.info('The time is: ', results[0].now);
            });

            return pool;
        }
    }

    async createConnections() {
        logger.info('Criando conexões nos bancos')
        const sales = await this.connectSales();
        const erp = await this.connectErp();

        return {
            sales,
            erp
        }
    }
}

module.exports = Connection;
