const I = actor();

const toggleFlag = (flagKey, flagValue) => I.amOnPage(`/testing-support/toggleflag/${flagKey}/${flagValue}`);

module.exports = {
  toggleFlag,
};
