const Connection = require('../../database/Connection');
const ConnectionDAO = require('../../repositories/ConnectionDAO');
const State = require('../../models/State');
const ObjectUtils = require('../../utils/ObjectsUtils')
const SqlUtils = require('../../utils/SqlUtils')
const log4js = require('log4js').configure('./src/config/log4js.json');
const { change } = require('../../utils/ServiceUtils');
const entity = 'state';

module.exports = class StateService {
    logger = null;

    constructor() {
        this.logger = log4js.getLogger(`services.state`);
    }

    async State() {
        change('state', true);
        this.logger.info('Service importation State');
        const { sales, erp } = await new Connection(this.logger).createConnections();
        const connectionDAO = new ConnectionDAO(sales, erp, this.logger);
        const salesValues = await connectionDAO.selectSales(sqlSales);
        const erpValues = await connectionDAO.selectErp(sql);
        const { id: country_id } = await connectionDAO.selectSales(sqlCountry_id, (results) => { return connectionDAO.findOne(results) });

        this.logger.info(`Itens carregados no sales: ${salesValues.length}`)
        this.logger.info(`Itens carregados no erp: ${erpValues.length}`)

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
                    row = new State().updatedFields(row);
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
        this.logger.info('Finalizando serviço de State');
        console.log('Finalizando serviço de State');
        change('state', false);
    }
}

const sql = `
SELECT nome AS name,
       sigla AS initial,
       CASE
           WHEN controle in(0,
                            1,
                            5) THEN 'true'
           ELSE 'false'
       END AS active,
       'BR' AS country_id,
       concat(sigla, '|', nome) AS erp_code
FROM estado e
WHERE SIGLA IS NOT NULL;
`;

const sqlSales = `
SELECT name,
       initial,
       active,
       country_id,
       erp_code
FROM state
`;

const sqlCountry_id = `Select id from country where initial = 'BR'`;
