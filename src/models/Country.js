export default class Country {
    constructor(data = {}) {
        this.id = data.id;
        this.active = data.active;
        this.name = data.name;
        this.initial = data.initial;

        Object.freeze(this);
    }

    set(property, value) {
        return new Country(this, property, value);
    }
}
