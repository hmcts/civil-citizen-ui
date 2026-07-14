module.exports = {
  lipClaimSettled: () => {
    return {
      event: 'LIP_CLAIM_SETTLED',
      caseDataUpdate: {
        applicant1ClaimSettledDate: '2020-01-01',
      },
    };
  },
};
