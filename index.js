require('dotenv').config();
const log4js = require('log4js').configure('./src/config/log4js.json');
const propertiesReader = require('properties-reader');
const properties = propertiesReader('scheduller.properties');
const CronJob = require('cron').CronJob;
const LogUtils = require('./src/utils/LogUtils')

const timezone = 'America/Sao_Paulo';

const CustomerService = require("./src/services/importation/Customer");
const StateService = require("./src/services/importation/State");

new CronJob(properties.get("importation.customer"), () => {
    LogUtils.setLogger(log4js.getLogger(`services.customer`));
    console.log('Executando Customer Service')
    new CustomerService().Customer();
}, null, true, timezone);

new CronJob(properties.get("importation.state"), () => {
    LogUtils.setLogger(log4js.getLogger(`services.state`));
    console.log('Executando State Service')
    new StateService().State();
}, null, true, timezone);

