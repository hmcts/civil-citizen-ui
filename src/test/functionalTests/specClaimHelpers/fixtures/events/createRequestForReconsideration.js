module.exports = {
  createATrialArrangement: () => {
    return {
      event: 'REQUEST_FOR_RECONSIDERATION',
      caseDataUpdate: {
        casePartyRequestForReconsideration: 'Applicant',
        allocatedTrack: null,
        reasonForReconsiderationApplicant: {
          reasonForReconsiderationTxt: 'test',
          requestor: null,
        },
        reasonForReconsiderationRespondent2: null,
        claimValue: null,
        reasonForReconsiderationRespondent1: null,
        totalClaimAmount: '1000',
        responseClaimTrack: 'SMALL_CLAIM',
      },
    };
  },
};
