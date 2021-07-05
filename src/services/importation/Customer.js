const Connection = require('../../database/Connection');
const ConnectionDAO = require('../../repositories/ConnectionDAO');
const Customer = require('../../models/Customer');
const ObjectUtils = require('../../utils/ObjectsUtils')
const SqlUtils = require('../../utils/SqlUtils')

const { change } = require('../../utils/ServiceUtils');
const entity = 'customer';

const log4js = require('log4js').configure('./src/config/log4js.json');

module.exports = class CustomerService {
    logger = null;

    constructor() {
        this.logger = log4js.getLogger(`services.customer`);
    }

    async Customer() {
        change('customer', true);
        this.logger.info('Service importation Customer');
        const { sales, erp } = await new Connection(this.logger).createConnections();
        const connectionDAO = new ConnectionDAO(sales, erp, this.logger);
        const originValues = await connectionDAO.selectSales(sqlSales);
        const customers = await connectionDAO.selectErp(sql);

        let rollbacks = 0;
        this.logger.info(`Itens carregados no sales: ${originValues.length}`)
        this.logger.info(`Itens carregados no erp: ${customers.length}`)

        const data = customers.map(d => {
            return new Customer(d);
        })

        if (Array.isArray(data)) {
            const { insert, update, deleted } = ObjectUtils.diff(originValues, data);

            if (insert?.length > 0) {
                for (const row of insert) {
                    const { keys, values } = ObjectUtils.createPropertiesFromObj(row);
                    const sql = SqlUtils.generateInsert(entity, keys, values);

                    try {
                        await connectionDAO.insertSales(sql);
                    } catch (error) {
                        rollbacks = rollbacks++;
                        this.logger.error('INSERT ERROR: ', error);
                    }
                }
            }

            if (update?.length > 0) {
                for (let row of update) {
                    const erp_code = row.erp_code;
                    row = new Customer().updatedFields(row);
                    const { keys, values } = ObjectUtils.createPropertiesFromObj(row);
                    const sql = SqlUtils.generateUpdate(entity, keys, values, erp_code);

                    try {
                        await connectionDAO.updateSales(sql);
                    } catch (error) {
                        rollbacks = rollbacks++;
                        this.logger.error('UPDATE ERROR: ', error);
                    }
                }
            }

            if (deleted?.length > 0) {
                for (let row of deleted) {
                    const sql = SqlUtils.generateDelete(entity, row.erp_code)

                    try {
                        await connectionDAO.querySales(sql);
                    } catch (error) {
                        rollbacks = rollbacks++;
                        this.logger.error('DELETE ERROR: ', error);
                    }
                }
            }
        }

        this.logger.warn('ROLLBACKS: ', rollbacks.length);

        await connectionDAO.closeConnections();
        this.logger.info('Finalizando serviço de Customer');
        console.log('Finalizando serviço de Customer');
        change('customer', false);
    }
}

const sql = `
SELECT nome AS name,
       codigo as code,
       cnpjcpf AS document_number,
       CASE
           WHEN controle in(0,
                            1,
                            5) THEN 'true'
           ELSE 'false'
       END AS active,
       concat(codigo, '|', cnpjcpf, '|', pessoa) AS erp_code
FROM cliente c
`;
const sqlSales = `select name, code, document_number, active, erp_code from customer`;

