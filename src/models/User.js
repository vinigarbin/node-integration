const { updateBooleanFields } = require('../utils/ObjectsUtils');

module.exports = class User {
    constructor(data = {}) {
        this.username = data.username;
        this.name = data.name;
        this.active = updateBooleanFields(data.active);
        this.password = data.password;
        this.email = data.email;
        this.erp_code = data.erp_code;

        Object.freeze(this);
    }

    set(property, value) {
        return new User(this, property, value);
    }

    updatedFields(data) {
        return {
            active: data.active,
            name: data.name,
            password: data.password,
        }
    }
}


