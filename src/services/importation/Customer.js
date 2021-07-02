const Connection = require('../../database/Connection');
const ConnectionDAO = require('../../repositories/ConnectionDAO');
const Customer = require('../../models/Customer');
const ObjectUtils = require('../../utils/ObjectsUtils')
const SqlUtils = require('../../utils/SqlUtils')

const LogUtils = require('../../utils/LogUtils');
const entity = 'customer';
let logger = null;

module.exports = class CustomerService {
    constructor() {
        logger = LogUtils.getLogger()
    }

    async Customer() {
        logger.info('Service importation Customer');
        const { sales, erp } = await new Connection().createConnections();
        const connectionDAO = new ConnectionDAO(sales, erp);
        const originValues = await connectionDAO.selectSales(sqlSales);
        const customers = await connectionDAO.selectErp(sql);

        logger.info(`Itens carregados no sales: ${originValues.length}`)
        logger.info(`Itens carregados no erp: ${customers.length}`)

        logger.info('Iniciando conversão: data to entity')
        const data = customers.map(d => {
            return new Customer(d);
        })

        if (Array.isArray(data)) {
            const { insert, update, deleted } = ObjectUtils.diff(originValues, data);

            if (insert?.length > 0) {
                for (const row of insert) {
                    const { keys, values } = ObjectUtils.createPropertiesFromObj(row);
                    const sql = SqlUtils.generateInsert(entity, keys, values);

                    await connectionDAO.insertSales(sql);
                }
            }

            if (update?.length > 0) {
                for (let row of update) {
                    const erp_code = row.erp_code;
                    row = new Customer().updatedFields(row);
                    const { keys, values } = ObjectUtils.createPropertiesFromObj(row);
                    const sql = SqlUtils.generateUpdate(entity, keys, values, erp_code);

                    await connectionDAO.updateSales(sql);
                }
            }

            if (deleted?.length > 0) {
                for (let row of deleted) {
                    const sql = SqlUtils.generateDelete(entity, row.erp_code)

                    await connectionDAO.querySales(sql);
                }
            }
        }

        connectionDAO.closeConnections();
    }
}

const sql = `select c.* ,' ' as document_number, concat(id,'|',name,'|',customer_since) as erp_code from tenant_1.customer c`;
const sqlSales = `select active, name, document_number, erp_code from customer`;

