const config = require('../../../../config');

module.exports = {
  rejectAllAlreadyPaidButClaimantWantsToProceed: () => {
    return {
      event: 'CLAIMANT_RESPONSE_SPEC',
      caseData: {
        respondent1: {
          type: 'INDIVIDUAL',
          title: 'Sir',
          firstName: 'John',
          lastName: 'Doe',
          individualDateOfBirth: '1987-11-01',
          primaryAddress: {
            AddressLine1: 'Test AddressLine1',
            AddressLine2: 'Test AddressLine2',
            AddressLine3: 'Test AddressLine3',
            PostTown: 'Test City',
            PostCode: 'IG6 1JD',
          },
          partyName: 'Sir John Doe',
          partyTypeDisplayValue: 'Individual',
          partyEmail: 'civilmoneyclaimsdemo@gmail.com',
          unavailableDates: null,
          flags: null,
        },
        applicant1: {
          partyID: '08d32305-1469-4b',
          type: 'COMPANY',
          companyName: 'Test Inc',
          primaryAddress: {
            AddressLine1: 'Flat 2 - applicant',
            AddressLine2: 'Caversham House 15-17',
            AddressLine3: 'Church Road',
            PostTown: 'Reading',
            County: 'Kent',
            Country: 'United Kingdom',
            PostCode: 'RG4 7AA',
          },
          partyName: 'Test Inc',
          partyTypeDisplayValue: 'Company',
          flags: {
            partyName: 'Test Inc',
            roleOnCase: 'Applicant 1',
          },
          unavailableDates: null,
        },
        respondent2: null,
        partAdmitPaidValuePounds: null,
        claimantResponseScenarioFlag: 'ONE_V_ONE',
        respondToAdmittedClaimOwingAmountPounds: null,
        respondent1PaymentDateToStringSpec: '03 July 2023',
        respondent1GeneratedResponseDocument: {
          documentName: null,
          documentType: null,
          documentSize: '0',
          createdDatetime: null,
          createdBy: null,
        },
        respondent1ClaimResponseDocumentSpec: {
          documentName: null,
          documentType: null,
          documentSize: '0',
          createdDatetime: null,
          createdBy: null,
        },
        respondent2GeneratedResponseDocument: null,
        applicant1AcceptAdmitAmountPaidSpec: null,
        applicant1ProceedWithClaim: 'Yes',
        applicant1PartAdmitConfirmAmountPaidSpec: null,
        applicant1AcceptFullAdmitPaymentPlanSpec: null,
        applicant1AcceptPartAdmitPaymentPlanSpec: null,
        applicantDefenceResponseDocumentAndDQFlag: null,
        applicant1ProceedWithClaimSpec2v1: null,
        showConditionFlags: null,
        responseClaimTrack: 'SMALL_CLAIM',
        allocatedTrack: null,
        claimType: null,
        defenceRouteRequired: 'HAS_PAID_THE_AMOUNT_CLAIMED',
        respondentResponseIsSame: null,
        defendantSingleResponseToBothClaimants: null,
        respondent1ClaimResponseTypeForSpec: 'FULL_DEFENCE',
        defenceAdmitPartPaymentTimeRouteRequired: 'IMMEDIATELY',
        showResponseOneVOneFlag: 'ONE_V_ONE_FULL_DEFENCE',
        applicant1DefenceResponseDocumentSpec: null,
        applicant1ClaimMediationSpecRequiredLip: {
          hasAgreedFreeMediation: 'No',
        },
        applicantMPClaimMediationSpecRequired: null,
        applicant1ClaimMediationSpecRequired: null,
        applicant1ClaimExpertSpecRequired: 'No',
        applicantMPClaimExpertSpecRequired: null,
        applicant1RespondToClaimExperts: null,
        applicant1ClaimWitnesses: '1',
        applicant1DQWitnessesSmallClaim: {
          witnessesToAppear: 'No',
          details: [
            
          ],
        },
        applicant1DQLanguage: {
          court: 'ENGLISH',
          documents: 'ENGLISH',
          evidence: null,
        },
        applicant1DQSmallClaimHearing: {
          unavailableDatesRequired: 'No',
          smallClaimUnavailableDate: [
            
          ],
        },
        applicant1DQHearingLRspec: null,
        applicant1DQRequestedCourt: {
          responseCourtLocations: {
            value: {
              code: '18ff11c1-223d-4b73-b8a3-929b63b84e73',
              label: config.claimantLRSelectedCourt,
            },
            list_items: [
              {
                code: '18ff11c1-223d-4b73-b8a3-929b63b84e73',
                label: config.claimantLRSelectedCourt,
              },
            ],
          },
          reasonForHearingAtSpecificCourt: 'reasons',
          responseCourtCode: null,
          caseLocation: {
            region: null,
            baseLocation: null,
          },
        },
        applicant1DQHearingSupport: {
          signLanguageRequired: null,
          languageToBeInterpreted: null,
          otherSupport: null,
          supportRequirements: 'No',
          supportRequirementsAdditional: null,
          requirements: [
            
          ],
        },
        applicant1DQVulnerabilityQuestions: {
          vulnerabilityAdjustmentsRequired: 'No',
          vulnerabilityAdjustments: null,
        },
        uiStatementOfTruth: {
          name: 'claimant lr',
          role: 'claimant role',
        },
      },
    };  
  },

  rejectAllDisputeAllButClaimantWantsToProceedWithMediation: () => {
    return {
      event: 'CLAIMANT_RESPONSE_SPEC',
      caseData: {
        respondent1: {
          type: 'INDIVIDUAL',
          title: 'Sir',
          firstName: 'John',
          lastName: 'Doe',
          individualDateOfBirth: '1987-11-01',
          primaryAddress: {
            AddressLine1: 'Test AddressLine1',
            AddressLine2: 'Test AddressLine2',
            AddressLine3: 'Test AddressLine3',
            PostTown: 'Test City',
            PostCode: 'IG6 1JD',
          },
          partyName: 'Sir John Doe',
          partyTypeDisplayValue: 'Individual',
          partyEmail: 'civilmoneyclaimsdemo@gmail.com',
          unavailableDates: null,
          flags: null,
        },
        applicant1: {
          partyID: '507e30a9-438b-47',
          type: 'COMPANY',
          companyName: 'Test Inc',
          primaryAddress: {
            AddressLine1: 'Flat 2 - applicant',
            AddressLine2: 'Caversham House 15-17',
            AddressLine3: 'Church Road',
            PostTown: 'Reading',
            County: 'Kent',
            Country: 'United Kingdom',
            PostCode: 'RG4 7AA',
          },
          partyName: 'Test Inc',
          partyTypeDisplayValue: 'Company',
          flags: {
            partyName: 'Test Inc',
            roleOnCase: 'Applicant 1',
          },
          unavailableDates: null,
        },
        respondent2: null,
        partAdmitPaidValuePounds: null,
        claimantResponseScenarioFlag: 'ONE_V_ONE',
        respondToAdmittedClaimOwingAmountPounds: null,
        respondent1PaymentDateToStringSpec: '03 July 2023',
        respondent1GeneratedResponseDocument: {
          documentName: null,
          documentType: null,
          documentSize: '0',
          createdDatetime: null,
          createdBy: null,
        },
        respondent1ClaimResponseDocumentSpec: {
          documentName: null,
          documentType: null,
          documentSize: '0',
          createdDatetime: null,
          createdBy: null,
        },
        respondent2GeneratedResponseDocument: null,
        applicant1AcceptAdmitAmountPaidSpec: null,
        applicant1ProceedWithClaim: 'Yes',
        applicant1PartAdmitConfirmAmountPaidSpec: null,
        applicant1AcceptFullAdmitPaymentPlanSpec: null,
        applicant1AcceptPartAdmitPaymentPlanSpec: null,
        applicantDefenceResponseDocumentAndDQFlag: null,
        applicant1ProceedWithClaimSpec2v1: null,
        showConditionFlags: null,
        responseClaimTrack: 'SMALL_CLAIM',
        allocatedTrack: null,
        claimType: null,
        defenceRouteRequired: 'DISPUTES_THE_CLAIM',
        respondentResponseIsSame: null,
        defendantSingleResponseToBothClaimants: null,
        respondent1ClaimResponseTypeForSpec: 'FULL_DEFENCE',
        defenceAdmitPartPaymentTimeRouteRequired: 'IMMEDIATELY',
        showResponseOneVOneFlag: 'ONE_V_ONE_FULL_DEFENCE',
        applicant1DefenceResponseDocumentSpec: null,
        applicant1ClaimMediationSpecRequiredLip: {
          hasAgreedFreeMediation: 'Yes',
        },
        applicantMPClaimMediationSpecRequired: null,
        applicant1ClaimMediationSpecRequired: null,
        applicant1ClaimExpertSpecRequired: 'Yes',
        applicantMPClaimExpertSpecRequired: null,
        applicant1RespondToClaimExperts: {
          firstName: 'Expertone',
          lastName: 'expertname',
          phoneNumber: '08444515236',
          emailAddress: 'expert@gmail.com',
          fieldofExpertise: 'field',
          whyRequired: 'expert needed',
          estimatedCost: '2500',
          expertName: null,
        },
        applicant1ClaimWitnesses: '4',
        applicant1DQWitnessesSmallClaim: {
          witnessesToAppear: 'No',
          details: [
            
          ],
        },
        applicant1DQLanguage: {
          court: 'BOTH',
          documents: 'ENGLISH',
          evidence: null,
        },
        applicant1DQSmallClaimHearing: {
          unavailableDatesRequired: 'No',
          smallClaimUnavailableDate: [
            
          ],
        },
        applicant1DQHearingLRspec: null,
        applicant1DQRequestedCourt: {
          responseCourtLocations: {
            value: {
              code: '18ff11c1-223d-4b73-b8a3-929b63b84e73',
              label: config.claimantLRSelectedCourt,
            },
            list_items: [
              {
                code: '18ff11c1-223d-4b73-b8a3-929b63b84e73',
                label: config.claimantLRSelectedCourt,
              },
            ],
          },
          reasonForHearingAtSpecificCourt: 'reasons',
          responseCourtCode: null,
          caseLocation: {
            region: null,
            baseLocation: null,
          },
        },
        applicant1DQHearingSupport: {
          signLanguageRequired: null,
          languageToBeInterpreted: null,
          otherSupport: null,
          supportRequirements: 'Yes',
          supportRequirementsAdditional: 'Support with access needs',
          requirements: [
            
          ],
        },
        applicant1DQVulnerabilityQuestions: {
          vulnerabilityAdjustmentsRequired: 'Yes',
          vulnerabilityAdjustments: 'Vulnerability Questions',
        },
        uiStatementOfTruth: {
          name: 'claimant lr',
          role: 'claimant role',
        },
      },
    };
  },
};