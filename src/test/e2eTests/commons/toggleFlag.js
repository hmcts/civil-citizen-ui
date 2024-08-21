const I = actor();

const toggleFlag = (flagKey, flagValue) => {
  I.amOnPage(`/testing-support/toggleflag/${flagKey}/${flagValue}`);
  I.see('Flag updated successfully');
};

module.exports = {
  toggleFlag,
};
