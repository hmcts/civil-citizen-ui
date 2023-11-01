module.exports = {
  createATrialArrangement: () => {
    const trialArrangementData = {
      event: 'TRIAL_READINESS',
      caseDataUpdate: {
        hearingDurationTextApplicant: '2 and half hours',
        isApplicant1: 'Yes',
        trialReadyApplicant: 'Yes',
        applicantRevisedHearingRequirements: {
          revisedHearingRequirements: 'Yes',
          revisedHearingComments: 'Nothing Special',
        },
        applicantHearingOtherComments: {
          hearingOtherComments: 'Optional information....',
        },
      },
    };
    return trialArrangementData;
  },
};
