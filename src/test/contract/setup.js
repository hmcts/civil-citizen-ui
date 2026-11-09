module.exports = config => {
  if (config.maxWorkers !== 1) {
    throw new Error('Pact suites share artifacts; use --runInBand or --maxWorkers=1');
  }
  require('./artifacts').clean();
};
