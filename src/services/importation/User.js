const Connection = require('../../database/Connection');
const ConnectionDAO = require('../../repositories/ConnectionDAO');
const User = require('../../models/User');
const ObjectUtils = require('../../utils/ObjectsUtils')
const SqlUtils = require('../../utils/SqlUtils')

const { change } = require('../../utils/ServiceUtils');
const entity = 'public.user';

const log4js = require('log4js').configure('./src/config/log4js.json');

module.exports = class UserService {
    logger = null;

    constructor() {
        this.logger = log4js.getLogger(`services.user`);
    }

    async User() {
        change('user', true);
        this.logger.info('Service importation User');
        const { sales, erp } = await new Connection(this.logger).createConnections();
        const connectionDAO = new ConnectionDAO(sales, erp, this.logger);
        const originValues = await connectionDAO.selectSales(sqlSales);
        const Users = await connectionDAO.selectErp(sql);

        let rollbacks = 0;
        this.logger.info(`Itens carregados no sales: ${originValues.length}`)
        this.logger.info(`Itens carregados no erp: ${Users.length}`)

        const data = Users.map(d => {
            return new User(d);
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
        this.logger.info('Finalizando serviço de User');
        console.log('Finalizando serviço de User');
        change('user', false);
    }
}

const sql = `
SELECT usuario AS username,
       nome AS name,
       CASE
           WHEN controle in(0,
                            1,
                            5) THEN 'true'
           ELSE 'false'
       END AS active,
       senha AS password,
       'email@email.com' as email,
       concat(usuario,'|',conta,'|',digito) as erp_code
FROM usuario u
`;
const sqlSales = `
SELECT username,
       name,
       active,
       password,
       email,
       erp_code
FROM public.user
`;

