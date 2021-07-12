const { updateBooleanFields } = require('../utils/ObjectsUtils');

module.exports = class BranchUser {
    constructor(data = {}, user_id, branch_id) {
        this.user_id = user_id;
        this.branch_id = branch_id;
        this.erp_code = data.erp_code;

        Object.freeze(this);
    }

    set(property, value) {
        return new BranchUser(this, property, value);
    }

    updatedFields(data) {
        return {}
    }
}


