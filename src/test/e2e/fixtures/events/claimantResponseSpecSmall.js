module.exports = {
  claimantResponse: () => {
    return {
      userInput: {
        RespondentResponse: {
          applicant1ProceedWithClaim: 'Yes',
        },
        Mediation: {
          applicant1ClaimMediationSpecRequired: {
            hasAgreedFreeMediation: 'Yes'
          }
        },
        SmallClaimExperts: {
          applicant1ClaimExpertSpecRequired: 'No'
        },
        SmallClaimWitnesses: {
          applicant1ClaimWitnesses: '1'
        },
        Language: {
          applicant1DQLanguage: {
            evidence: 'ENGLISH',
            court: 'ENGLISH',
            documents: 'ENGLISH'
          }
        },
        Hearing: {
          applicant1DQSmallClaimHearing: {
            unavailableDatesRequired: 'No'
          }
        },
        ApplicantCourtLocationLRspec: {
          applicant1DQRequestedCourt: {
            requestHearingAtSpecificCourt: 'No'
          }
        },
        VulnerabilityQuestions: {
          applicant1DQVulnerabilityQuestions: {
            vulnerabilityAdjustmentsRequired: 'No'
          }
        },
        StatementOfTruth: {
          uiStatementOfTruth: {
            name: 'Solicitor name',
            role: 'Solicitor role'
          }
        }
      },
      midEventData: {
        Hearing: {
          respondent1DQVulnerabilityQuestions: {
            vulnerabilityAdjustmentsRequired: 'No'
          },
          respondent1DQStatementOfTruth: {
            name: 'name',
            role: 'role'
          },
          businessProcess: {
            status: 'FINISHED',
            camundaEvent: 'DEFENDANT_RESPONSE_SPEC'
          }
        }
      },
      midEventGeneratedData: {}
    };
  }
}
;
