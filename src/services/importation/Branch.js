const Connection = require('../../database/Connection');
const ConnectionDAO = require('../../repositories/ConnectionDAO');
const Branch = require('../../models/Branch');
const ObjectUtils = require('../../utils/ObjectsUtils')
const SqlUtils = require('../../utils/SqlUtils')

const { change } = require('../../utils/ServiceUtils');
const entity = 'branch';

const log4js = require('log4js').configure('./src/config/log4js.json');

module.exports = class BranchService {
    logger = null;

    constructor() {
        this.logger = log4js.getLogger(`services.${entity}`);
    }

    async Branch() {
        change(entity, true);
        this.logger.info(`Service importation ${entity}`);
        const { sales, erp } = await new Connection(this.logger).createConnections();
        const connectionDAO = new ConnectionDAO(sales, erp, this.logger);
        const originValues = await connectionDAO.selectSales(sqlSales);
        const erpValues = await connectionDAO.selectErp(sql);

        let rollbacks = 0;
        this.logger.info(`Itens carregados no sales: ${originValues.length}`)
        this.logger.info(`Itens carregados no erp: ${erpValues.length}`)

        const data = erpValues.map(d => {
            return new Branch(d);
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
                    row = new User().updatedFields(row);
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
        this.logger.info(`Finalizando serviço de ${entity}`);
        console.log(`Finalizando serviço de ${entity}`);
        change(entity, false);
    }
}

const sql = `
SELECT micronome AS description,
       CASE
           WHEN controle in(0,
                            1,
                            5) THEN 'true'
           ELSE 'false'
       END AS active,
       concat(micronome, '|', filial_id) AS erp_code
FROM filial f
`;
const sqlSales = `
SELECT description,
       active,
       erp_code
FROM branch
`;

