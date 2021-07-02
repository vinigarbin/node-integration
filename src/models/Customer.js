module.exports = class Customer {
    constructor(data = {}) {
        this.active = data.active;
        this.name = data.name;
        this.document_number = data.document_number;
        this.erp_code = data.erp_code;

        Object.freeze(this);
    }

    set(property, value) {
        return new Customer(this, property, value);
    }

    updatedFields(data) {
        return {
            active: data.active,
            name: data.name,
            document_number: data.document_number,
        }
    }
}


