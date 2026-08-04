module.exports = {
  settleClaim: () => {
    const data = {};
    data.userInput = {
      SingleClaimant: {
        markPaidConsent: 'YES',
      },
    };

    return data;
  },
};
