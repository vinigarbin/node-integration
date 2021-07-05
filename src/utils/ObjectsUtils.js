const _ = require('lodash');
const LogUtils = require('./LogUtils');

function createPropertiesFromObj(row) {
    let keys = [];
    let values = [];
    Object.keys(row).forEach(key => {
        const value = row[key];
        if (value) {
            keys.push(key);
            if (typeof value === 'string') {
                values.push(`'${value}'`);
            } else {
                values.push(value);
            }
        }
    })
    return { keys, values };
}

function diff(sales, erp) {
    LogUtils.getLogger().info('Gerando diff dos objetos');
    const insert = [];
    const update = [];

    erp.forEach(d => {
        let value = sales?.find(o => o?.erp_code === d.erp_code);

        if (value) {
            sales = sales.filter(s => s.erp_code !== d.erp_code);

            if (!_.isEqual(JSON.stringify(d), JSON.stringify(value))) {
                LogUtils.getLogger().info(`|-------------------------------------|`)
                LogUtils.getLogger().info("| Diff                                |")
                LogUtils.getLogger().info("| ERP:", d, '                         |')
                LogUtils.getLogger().info("| SALES", value, '                    |')
                LogUtils.getLogger().info(`|-------------------------------------|`)
                update.push(d);
            }
        } else {
            insert.push(d)
        }
    });

    LogUtils.getLogger().info(`|-------------------------------------|`)
    LogUtils.getLogger().info(`| Dados novos: ${insert.length}       |`)
    LogUtils.getLogger().info(`| Dados atualizados: ${update.length} |`)
    LogUtils.getLogger().info(`| Dados excluidos: ${sales.length}    |`)
    LogUtils.getLogger().info(`| Total registros: ${erp.length}      |`)
    LogUtils.getLogger().info(`|-------------------------------------|`)

    return {
        insert, update, deleted: sales
    }
}

function updateBooleanFields(value) {
    if (value === 'true') {
        return true;
    } else {
        return false;
    }
}

module.exports = { createPropertiesFromObj, diff, updateBooleanFields };
