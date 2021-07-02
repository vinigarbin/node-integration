require('dotenv').config();

const log4js = require('log4js').configure('./src/config/log4js.json');
const propertiesReader = require('properties-reader');
const properties = propertiesReader('scheduller.properties');
const CustomerService = require("./src/services/importation/Customer");
const CronJob = require('cron').CronJob;
const LogUtils = require('./src/utils/LogUtils')
const timezone = 'America/Sao_Paulo';

new CronJob(properties.get("importation.customer"), () => {
    LogUtils.setLogger(log4js.getLogger(`services.customer`));
    console.log('Executando Customer Service')
    new CustomerService().Customer();
}, null, true, timezone);

