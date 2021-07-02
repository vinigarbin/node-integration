function generateInsert(entity, keys, values) {
    try {
        validadeParams(entity, keys, values);
    } catch (error) {
        console.log(error.message);
    }

    return `insert into ${entity} (${keys.join()}) values (${values})`;
}

function generateUpdate(entity, keys, values, key) {

    try {
        validadeParams(entity, keys, values, key, true);
    } catch (error) {
        console.log(error.message);
    }

    const keyValue = [];

    if (!key) {
        throw new Error(`Key is null or undefined`);
    }

    keys.forEach((key, index) => {
        keyValue.push(`${key} = ${values[index]}`)
    })

    return `update ${entity} set ${keyValue.join()} where erp_code = '${key}'`;
}

function generateDelete(entity, value) {
    return `delete from ${entity} where erp_code = '${value}'`;
}

function validadeParams(entity, keys, values, key = null, validateKey = false) {
    if (!entity) {
        throw new Error(`Entity name is null or undefined`);
    }
    if (!keys) {
        throw new Error(`Keys is null or undefined`);
    }
    if (!values) {
        throw new Error(`Values is null or undefined`);
    }

    if (validateKey && !key) {
        throw new Error(`Key is null or undefined`);
    }


}

module.exports = { generateInsert, generateUpdate, generateDelete };
