module.exports = {
  createDefendantResponse: () => {
    const defendantResponseData = {
      event: "DEFENDANT_RESPONSE_CUI",
        caseDataUpdate: {
          legacyCaseReference : '000MC001',
          respondent1ClaimResponseTypeForSpec: 'FULL_DEFENCE',
          defenceAdmitPartPaymentTimeRouteRequired: 'IMMEDIATELY',
          respondToClaimAdmitPartLRspec: {},
          responseClaimMediationSpecRequired: 'No',
          specAoSApplicantCorrespondenceAddressRequired: 'Yes',
          totalClaimAmount: 2233,
          applicant1: {
            type : 'COMPANY',
            flags: {
              partyName: 'Test Inc',
              roleOnCase: 'Applicant 1'
            },
            partyID: 'bce42cbe-a265-4a',
            partyName:'Test Inc',
            companyName:'Test Inc',
            primaryAddress:{
              County: 'Kent',
              Country: 'United Kingdom',
              PostCode: 'RG4 7AA',
              PostTown: 'Reading',
              AddressLine1: 'Flat 2 - applicant',
              AddressLine2: 'Caversham House 15-17',
              AddressLine3: 'Church Road'
            },
            partyTypeDisplayValue: 'Company'
          },
          respondent1: {
            companyName: 'Hendricks Alvarez Co',
            partyEmail: 'civilmoneyclaimsdemo@gmail.com',
            partyPhone: '07123456789',
            primaryAddress: {
              AddressLine1: '62 Rocky Cowley Freeway',
              AddressLine2: 'Velit proident lore',
              AddressLine3: 'Repellendus Sed vol',
              PostCode: 'ln12an',
              PostTown: 'Eum consequatur quia',
            },
            type: 'COMPANY',
          },
          respondent1LiPResponse: {
            timelineComment: '',
            evidenceComment: '',
            respondent1LiPFinancialDetails: {},
            respondent1MediationLiPResponse: {
              mediationDisagreementLiP: 'No',
            },
            respondent1DQExtraDetails: {
              wantPhoneOrVideoHearing: 'No',
              whyPhoneOrVideoHearing: '',
              giveEvidenceYourSelf: 'No',
              determinationWithoutHearingRequired: 'No',
              determinationWithoutHearingReason: 'Test reason',
              considerClaimantDocumentsDetails: '',
              respondent1DQLiPExpert: {
                caseNeedsAnExpert: 'No',
                expertCanStillExamineDetails: '',
              },
            },
            respondent1DQHearingSupportLip: {
              supportRequirementLip: 'No',
              requirementsLip: [
                {
                  value: {
                    requirements: [],
                  },
                },
              ],
            },
            respondent1LiPContactPerson: '',
            respondent1ResponseLanguage: 'ENGLISH',
          },
          detailsOfWhyDoesYouDisputeTheClaim: 'This is a test reason',
          specClaimResponseTimelineList: 'MANUAL',
          specResponseTimelineOfEvents: [],
          specResponselistYourEvidenceList: [],
          defenceRouteRequired: 'DISPUTES_THE_CLAIM',
          respondToClaim: {},
          respondent1DQHomeDetails: {},
          respondent1PartnerAndDependent: {
            howManyChildrenByAgeGroup: {},
          },
          specDefendant1SelfEmploymentDetails: {},
          respondToClaimAdmitPartUnemployedLRspec: {},
          respondent1DQLanguage: {
            court: 'ENGLISH',
            documents: 'ENGLISH',
          },
          respondent1DQVulnerabilityQuestions: {
            vulnerabilityAdjustmentsRequired: 'No',
          },
          respondent1DQRequestedCourt: {
            requestHearingAtSpecificCourt: 'No',
            otherPartyPreferredSite: '',
            responseCourtCode: '',
            responseCourtLocations: [],
            caseLocation: {},
          },
          respondent1DQWitnesses: {
            witnessesToAppear: 'No',
            details: [
              {
                value: {
                  name: '',
                  firstName: '',
                  lastName: '',
                  emailAddress: '',
                  phoneNumber: '',
                  reasonForWitness: '',
                },
              },
            ],
          },
          respondent1DQHearingSmallClaim: {
            unavailableDatesRequired: 'No',
          },
          respondent1DQExperts: {},
        }
    };
    return defendantResponseData;
  },
};
