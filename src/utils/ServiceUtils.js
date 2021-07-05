const services = {
    customer: false,
    state: false
}

function change(preventService, value) { services[preventService] = value; }

module.exports = { services, change };
