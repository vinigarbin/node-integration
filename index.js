require('dotenv').config();
const log4js = require('log4js').configure('./src/config/log4js.json');
const propertiesReader = require('properties-reader');
const properties = propertiesReader('scheduller.properties');
const propertiesServices = propertiesReader('services.properties');
const CronJob = require('cron').CronJob;
const LogUtils = require('./src/utils/LogUtils')
const { services } = require('./src/utils/ServiceUtils')

const timezone = 'America/Sao_Paulo';

const CustomerService = require("./src/services/importation/Customer");
const StateService = require("./src/services/importation/State");
const UserService = require("./src/services/importation/User");
const BranchService = require("./src/services/importation/Branch");
const BranchUserService = require("./src/services/importation/BranchUser");

new CronJob(properties.get("importation.customer"), () => {
    LogUtils.setLogger(log4js.getLogger(`services.customer`));

    if (services.customer) {
        console.log('Serviço de Customer já em execução, aguarde finalização.')
        return;
    }
    console.log('Executando Customer Service')
    new CustomerService().Customer();
}, null, propertiesServices.get("active.customer"), timezone);

new CronJob(properties.get("importation.state"), () => {
    LogUtils.setLogger(log4js.getLogger(`services.state`));

    if (services.state) {
        console.log('Serviço de State já em execução, aguarde finalização.')
        return;
    }

    console.log('Executando State Service')
    new StateService().State();
}, null, propertiesServices.get("active.state"), timezone);

new CronJob(properties.get("importation.user"), () => {
    LogUtils.setLogger(log4js.getLogger(`services.user`));

    if (services.user) {
        console.log('Serviço de User já em execução, aguarde finalização.')
        return;
    }

    console.log('Executando User Service')
    new UserService().User();
}, null, propertiesServices.get("active.user"), timezone);

new CronJob(properties.get("importation.branch"), () => {
    LogUtils.setLogger(log4js.getLogger(`services.branch`));

    if (services.user) {
        console.log('Serviço de Branch já em execução, aguarde finalização.')
        return;
    }

    console.log('Executando Branch Service')
    new BranchService().Branch();
}, null, propertiesServices.get("active.branch"), timezone);

new CronJob(properties.get("importation.branch_user"), () => {
    LogUtils.setLogger(log4js.getLogger(`services.branch_user`));

    if (services.user) {
        console.log('Serviço de Branch_User já em execução, aguarde finalização.')
        return;
    }

    console.log('Executando Branch_User Service')
    new BranchUserService().BranchUser();
}, null, propertiesServices.get("active.branch_user"), timezone);

