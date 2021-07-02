let logger = null;

function getLogger() {
    return logger;
}
function setLogger(log) {
    logger = log;
}

module.exports = { getLogger, setLogger };
