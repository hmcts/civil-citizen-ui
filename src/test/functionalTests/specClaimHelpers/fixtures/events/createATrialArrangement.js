module.exports = {
  createATrialArrangement: () => {
    return {
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
  },
  createATrialArrangementRespondentLip: () => {
    return {
      event: 'TRIAL_READINESS',
      caseDataUpdate: {
        trialReadyRespondent1: 'Yes',
        respondent1RevisedHearingRequirements: {
          revisedHearingRequirements: 'Yes',
          revisedHearingComments: 'Nothing Special',
        },
        respondent1HearingOtherComments: {
          hearingOtherComments: 'Optional information....',
        },
      },
    };
  },
};
