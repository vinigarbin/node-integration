require('dotenv').config();
const log4js = require('log4js').configure('./src/config/log4js.json');
const propertiesReader = require('properties-reader');
const properties = propertiesReader('scheduller.properties');
const CronJob = require('cron').CronJob;
const LogUtils = require('./src/utils/LogUtils')
const { services } = require('./src/utils/ServiceUtils')

const timezone = 'America/Sao_Paulo';

const CustomerService = require("./src/services/importation/Customer");
const StateService = require("./src/services/importation/State");

new CronJob(properties.get("importation.customer"), () => {
    LogUtils.setLogger(log4js.getLogger(`services.customer`));

    if (services.customer) {
        console.log('Serviço de Customer já em execução, aguarde finalização.')
        return;
    }
    console.log('Executando Customer Service')
    new CustomerService().Customer();
}, null, true, timezone);

new CronJob(properties.get("importation.state"), () => {
    LogUtils.setLogger(log4js.getLogger(`services.state`));

    if (services.state) {
        console.log('Serviço de State já em execução, aguarde finalização.')
        return;
    }

    console.log('Executando State Service')
    new StateService().State();
}, null, true, timezone);

