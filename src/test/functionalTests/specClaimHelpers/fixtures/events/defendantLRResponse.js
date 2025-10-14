const {listElement, element} = require('../../api/dataHelper');
const config = require('../../../../config.js');
module.exports = {
  respondToClaim: (response, camundaEvent) => {
    const responseData = {
      userInput: {
        ResponseConfirmNameAddress: {
          specAoSApplicantCorrespondenceAddressRequired: 'Yes',
        },
        ResponseConfirmDetails: {
          specAoSRespondentCorrespondenceAddressRequired: 'Yes',
        },
        RespondentResponseTypeSpec: {
          respondent1ClaimResponseTypeForSpec: 'FULL_DEFENCE',
        },
        defenceRoute: {
          defenceRouteRequired: 'DISPUTES_THE_CLAIM',
        },
        Upload: {
          detailsOfWhyDoesYouDisputeTheClaim: 'details',
        },
        HowToAddTimeline: {
          specClaimResponseTimelineList: 'MANUAL',
        },
        Mediation: {
          responseClaimMediationSpecRequired: 'Yes',
        },
        SmallClaimExperts: {
          responseClaimExpertSpecRequired: 'No',
        },
        SmallClaimWitnesses: {
          responseClaimWitnesses: '1',
        },
        Language: {
          respondent1DQLanguage: {
            court: 'ENGLISH',
            documents: 'ENGLISH',
          },
        },
        SmallClaimHearing: {
          respondent1DQHearingSmallClaim: {
            unavailableDatesRequired: 'No',
          },
          SmallClaimHearingInterpreterRequired: 'No',
        },
        RequestedCourtLocationLRspec: {
          respondToCourtLocation: {
            responseCourtLocations: {
              list_items: [
                listElement(config.defendantSelectedCourt),
              ],
              value: listElement(config.defendantSelectedCourt),
            },
            reasonForHearingAtSpecificCourt: 'Reasons',
          },
        },
        HearingSupport: {
          respondent1DQHearingSupport: {
            supportRequirements: 'Yes',
            supportRequirementsAdditional: 'Additional support reasons',
          },respondent1DQHearing: {
            unavailableDatesRequired: 'No',
          },
        },
        VulnerabilityQuestions: {
          respondent1DQVulnerabilityQuestions: {
            vulnerabilityAdjustmentsRequired: 'No',
          },
        },
        StatementOfTruth: {
          uiStatementOfTruth: {
            name: 'name',
            role: 'role',
          },
        },
      },
      midEventData: {
      },
    };

    switch (response) {
      case 'FULL_DEFENCE':
        responseData.userInput = {
          ...responseData.userInput,
          RespondentResponseTypeSpec: {
            respondent1ClaimResponseTypeForSpec: 'FULL_DEFENCE',
          },
          SmallClaimExperts: {
            respondent1DQExperts: {
              expertRequired: 'Yes',
              expertReportsSent: 'NOT_OBTAINED',
              jointExpertSuitable: 'Yes',
              details: [
                element({
                  firstName: 'John',
                  lastName: 'Doe',
                  emailAddress: 'john@doemail.com',
                  phoneNumber: '07111111111',
                  fieldOfExpertise: 'None',
                  whyRequired: 'Testing',
                  estimatedCost: '10000',
                }),
              ],
            },
          },
          SmallClaimWitnesses: {
            respondent1DQWitnessesSmallClaim: {
              witnessesToAppear: 'Yes',
              details: [
                element({
                  firstName: 'Witness',
                  lastName: 'One',
                  emailAddress: 'witness@email.com',
                  phoneNumber: '07116778998',
                  reasonForWitness: 'None',
                }),
              ],
            },
          },
          defenceRoute: {
            defenceRouteRequired: 'DISPUTES_THE_CLAIM',
          },
        };
        responseData.midEventData = {
          ...responseData.midEventData,
          RespondentResponseTypeSpec: {
            specFullDefenceOrPartAdmission: 'Yes',
            multiPartyResponseTypeFlags: 'FULL_DEFENCE',
            specDefenceFullAdmittedRequired: 'No',
            respondentClaimResponseTypeForSpecGeneric: 'FULL_DEFENCE',
          },

          defenceRoute: {
            responseClaimTrack: 'SMALL_CLAIM',
            respondent1ClaimResponsePaymentAdmissionForSpec: 'DID_NOT_PAY',
          },

          ResponseConfirmNameAddress: {
            businessProcess: {
              status: 'FINISHED',
              camundaEvent: camundaEvent,
            },
          },
        };
        break;
      case 'FULL_ADMISSION':
        responseData.userInput = {
          ...responseData.userInput,
          RespondentResponseTypeSpec: {
            respondent1ClaimResponseTypeForSpec: 'FULL_ADMISSION',
            respondentClaimResponseTypeForSpecGeneric: 'FULL_ADMISSION',
          },
          defenceAdmittedPartRoute: {
            specDefenceFullAdmittedRequired: 'No',
          },
          WhenWillClaimBePaid: {
            defenceAdmitPartPaymentTimeRouteRequired: 'IMMEDIATELY',
          },
          Upload: {
            detailsOfWhyDoesYouDisputeTheClaim: 'details',
          },
          HowToAddTimeline: {
            specClaimResponseTimelineList: 'MANUAL',
          },
          ResponseConfirmNameAddress: {
            businessProcess: {
              status: 'FINISHED',
              camundaEvent: camundaEvent,
            },
          },
          defenceRoute: {
            specPaidLessAmountOrDisputesOrPartAdmission: 'No',
          },
        };
        responseData.midEventData = {
          ...responseData.midEventData,
          RespondentResponseTypeSpec: {
            specFullDefenceOrPartAdmission: 'No',
            multiPartyResponseTypeFlags: 'FULL_ADMISSION',
            specDefenceFullAdmittedRequired: 'No',
          },
          defenceAdmittedPartRoute: {
            responseClaimTrack: 'SMALL_CLAIM',
          },
          defenceRoute: {
            respondent1ClaimResponsePaymentAdmissionForSpec: 'DID_NOT_PAY',
            responseClaimTrack: 'SMALL_CLAIM',
          },
        };
        break;
      case 'PART_ADMISSION':
        responseData.userInput = {
          ...responseData.userInput,
          RespondentResponseTypeSpec: {
            respondent1ClaimResponseTypeForSpec: 'PART_ADMISSION',
          },
          defenceAdmittedPartRoute: {
            specDefenceAdmittedRequired: 'No',
            respondToAdmittedClaimOwingAmount: '200000',
          },
          WhenWillClaimBePaid: {
            defenceAdmitPartPaymentTimeRouteRequired: 'IMMEDIATELY',
          },
        };
        responseData.midEventData = {
          ...responseData.midEventData,
          RespondentResponseTypeSpec: {
            specFullDefenceOrPartAdmission: 'Yes',
            multiPartyResponseTypeFlags: 'NOT_FULL_DEFENCE',
            specDefenceFullAdmittedRequired: 'No',
            respondentClaimResponseTypeForSpecGeneric: 'PART_ADMISSION',
          },

          defenceAdmittedPartRoute: {
            responseClaimTrack: 'SMALL_CLAIM',
            respondToAdmittedClaimOwingAmountPounds: '2000.00',
          },

          ResponseConfirmNameAddress: {
            businessProcess: {
              status: 'FINISHED',
              camundaEvent: camundaEvent,
            },
          },

          defenceRoute: {
            respondent1ClaimResponsePaymentAdmissionForSpec: 'DID_NOT_PAY',
            responseClaimTrack: 'SMALL_CLAIM',
          },
        };
        break;
      case 'COUNTER_CLAIM':
        responseData.userInput = {
          ...responseData.userInput,
          RespondentResponseTypeSpec: {
            respondent1ClaimResponseTypeForSpec: 'COUNTER_CLAIM',
          },
        };
        responseData.midEventData = {
          ...responseData.midEventData,
          RespondentResponseTypeSpec: {
            multiPartyResponseTypeFlags: 'COUNTER_ADMIT_OR_ADMIT_PART',
            specFullDefenceOrPartAdmission: 'No',
            specDefenceFullAdmittedRequired: 'No',
            respondentClaimResponseTypeForSpecGeneric: 'COUNTER_CLAIM',
          },

          ResponseConfirmNameAddress: {
            businessProcess: {
              status: 'FINISHED',
              camundaEvent: camundaEvent,
            },
          },

          defenceRoute: {
            respondent1ClaimResponsePaymentAdmissionForSpec: 'DID_NOT_PAY',
            responseClaimTrack: 'SMALL_CLAIM',
          },
        };
        break;
    }
    return responseData;
  },
};
