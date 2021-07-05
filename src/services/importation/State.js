const Connection = require('../../database/Connection');
const ConnectionDAO = require('../../repositories/ConnectionDAO');
const State = require('../../models/State');
const ObjectUtils = require('../../utils/ObjectsUtils')
const SqlUtils = require('../../utils/SqlUtils')

const LogUtils = require('../../utils/LogUtils');
const entity = 'state';
let logger = null;

module.exports = class StateService {
    constructor() {
        logger = LogUtils.getLogger()
    }

    async State() {
        logger.info('Service importation State');
        const { sales, erp } = await new Connection().createConnections();
        const connectionDAO = new ConnectionDAO(sales, erp);
        const salesValues = await connectionDAO.selectSales(sqlSales);
        const erpValues = await connectionDAO.selectErp(sql);
        const country_id = await connectionDAO.selectSales(sqlCountry_id, (results) => {
            console.log(results);
            connectionDAO.findOne(results)
        });

        logger.info(`Itens carregados no sales: ${salesValues.length}`)
        logger.info(`Itens carregados no erp: ${erpValues.length}`)

        logger.info('Iniciando conversão: data to entity');
        const data = erpValues.map(d => {
            return new State(d, country_id);
        })

        if (Array.isArray(data)) {
            const { insert, update, deleted } = ObjectUtils.diff(salesValues, data);

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
        logger.info('Finalizando serviço de State');
        console.log('Finalizando serviço de State');
    }
}

const sql = `
SELECT nome AS name,
       sigla AS INITIAL,
       CASE
           WHEN controle in(0,
                            1,
                            5) THEN 'true'
           ELSE 'false'
       END AS active,
       'BR' AS fk_country_id,
       concat(sigla, '|', nome) AS erp_code
FROM estado e
`;
const sqlSales = `
SELECT INITIAL,
       active,
       name,
       country_id,
       erp_code
FROM state
`;

const sqlCountry_id = `Select id from country where initial = 'BR'`;