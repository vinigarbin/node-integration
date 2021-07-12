const services = {
    customer: false,
    state: false,
    user: false,
    branch:false,
}

function change(preventService, value) { services[preventService] = value; }

module.exports = { services, change };
