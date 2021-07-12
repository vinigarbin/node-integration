const Connection = require('../../database/Connection');
const ConnectionDAO = require('../../repositories/ConnectionDAO');
const BranchUser = require('../../models/BranchUser');
const ObjectUtils = require('../../utils/ObjectsUtils')
const SqlUtils = require('../../utils/SqlUtils')

const { change } = require('../../utils/ServiceUtils');
const entity = 'branch_user';

const log4js = require('log4js').configure('./src/config/log4js.json');

module.exports = class BranchUserService {
    logger = null;

    constructor() {
        this.logger = log4js.getLogger(`services.${entity}`);
    }

    async BranchUser() {
        change(entity, true);
        this.logger.info(`Service importation ${entity}`);
        const { sales, erp } = await new Connection(this.logger).createConnections();
        const connectionDAO = new ConnectionDAO(sales, erp, this.logger);
        const originValues = await connectionDAO.selectSales(sqlSales);
        const erpValues = await connectionDAO.selectErp(sql);

        let rollbacks = 0;
        this.logger.info(`Itens carregados no sales: ${originValues.length}`)
        this.logger.info(`Itens carregados no erp: ${erpValues.length}`)

        const users = await connectionDAO.selectSales(sqlUsers);
        const branches = await connectionDAO.selectSales(sqlBranch);

        const data = erpValues.map(d => {
            const user = users.find(u => u.erp_code === d.erp_code_user);
            const branch = branches.find(u => u.erp_code === d.erp_code_branch);
            return new BranchUser(d, user.id, branch.id);
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
                    row = new BranchUser().updatedFields(row);
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

        this.logger.warn('ROLLBACKS: ', rollbacks);

        await connectionDAO.closeConnections();
        this.logger.info(`Finalizando serviço de ${entity}`);
        console.log(`Finalizando serviço de ${entity}`);
        change(entity, false);
    }
}

const sql = `
SELECT concat(f.micronome, '|', f.filial_id) AS erp_code_branch,
       concat(u.usuario, '|', u.conta, '|', u.digito) AS erp_code_user,
       concat(u.usuario, '|', u.conta, '|', u.digito, '|', f.micronome, '|', f.filial_id) AS erp_code
FROM usuario_filial uf
INNER JOIN usuario u ON uf.usuario_id = u.usuario_id
INNER JOIN filial f ON uf.filial_id = f.filial_id
where  uf.controle in(0,1,5)
`;

const sqlSales = `
select 
user_id,
branch_id, 
erp_code
from branch_user 
`;

const sqlUsers = `select id, erp_code from "user"`;
const sqlBranch = `select id, erp_code from branch`;