const { updateBooleanFields } = require('../utils/ObjectsUtils');

module.exports = class Branch {
    constructor(data = {}) {
        this.description = data.description;
        this.active = updateBooleanFields(data.active);
        this.erp_code = data.erp_code;

        Object.freeze(this);
    }

    set(property, value) {
        return new Branch(this, property, value);
    }

    updatedFields(data) {
        return {
            active: data.active,
        }
    }
}


