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

        await connectionDAO.closeConnections();
        logger.info('Finalizando serviço de Customer');
        console.log('Finalizando serviço de Customer');
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
const sqlSales = `select code,active, name, document_number, erp_code from customer`;

