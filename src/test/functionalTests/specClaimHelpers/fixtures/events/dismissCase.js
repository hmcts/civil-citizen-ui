module.exports = {
  dismissCasePayload: () => {
    return {
      event: 'DISMISS_CASE',
      caseData: {},
    };
  },
};
