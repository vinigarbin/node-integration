const { updateBooleanFields } = require('../utils/ObjectsUtils');

module.exports = class State {
    constructor(data = {}, country_id) {
        this.name = data.name;
        this.initial = data.initial;
        this.active = updateBooleanFields(data.active);
        this.country_id = country_id;
        this.erp_code = data.erp_code;

        Object.freeze(this);
    }

    set(property, value) {
        return new State(this, property, value);
    }

    updatedFields(data) {
        return {
            active: data.active,
            name: data.name,
        }
    }
}


