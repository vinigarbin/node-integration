module.exports = class State {
    constructor(data = {}, country_id) {
        this.active = data.active;
        this.name = data.name;
        this.initial = data.initial;
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
            document_number: data.document_number,
        }
    }
}


