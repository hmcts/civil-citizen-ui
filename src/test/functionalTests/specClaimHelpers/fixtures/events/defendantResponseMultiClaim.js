module.exports = {
  citizenDefendantResponseCompany: () => {
    return {
      event: 'DEFENDANT_RESPONSE_CUI',
      caseDataUpdate: {
        respondent1ClaimResponseTypeForSpec: 'FULL_DEFENCE',
        defenceAdmitPartPaymentTimeRouteRequired: 'IMMEDIATELY',
        respondToClaimAdmitPartLRspec: {},
        responseClaimMediationSpecRequired: 'No',
        specAoSApplicantCorrespondenceAddressRequired: 'Yes',
        totalClaimAmount: 150000,
        respondent1: {
          companyName: 'Test Company Defendant',
          individualDateOfBirth: null,
          partyEmail: 'civilmoneyclaimsdemo@gmail.com',
          partyPhone: '07800000000',
          primaryAddress: {
            AddressLine1: 'TestAddressLine1',
            AddressLine2: 'TestAddressLine2',
            AddressLine3: 'TestAddressLine3',
            PostCode: 'IG61JD',
            PostTown: 'TestCity',
          },
          soleTraderDateOfBirth: null,
          type: 'COMPANY',
        },
        respondent1LiPResponse: {
          timelineComment: '',
          evidenceComment: '',
          respondent1DQExtraDetails: {
            wantPhoneOrVideoHearing: 'No',
            whyPhoneOrVideoHearing: '',
            giveEvidenceYourSelf: 'No',
            triedToSettle: 'No',
            determinationWithoutHearingReason: '',
            requestExtra4weeks: 'No',
            considerClaimantDocumentsDetails: '',
            respondent1DQLiPExpert: {
              expertCanStillExamineDetails: '',
            },
          },
          respondent1DQHearingSupportLip: {
            supportRequirementLip: 'No',
          },
          respondent1LiPContactPerson: 'defendant contact person',
          respondent1ResponseLanguage: 'ENGLISH',
        },
        respondent1LiPFinancialDetails: {},
        detailsOfWhyDoesYouDisputeTheClaim: 'disagree',
        specClaimResponseTimelineList: 'MANUAL',
        specResponseTimelineOfEvents: [],
        specResponselistYourEvidenceList: [],
        defenceRouteRequired: 'DISPUTES_THE_CLAIM',
        respondToClaim: {
          howMuchWasPaid: null,
        },
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
        respondent1DQExperts: {},
        respondent1DQHearingSupport: {
          supportRequirements: 'No',
        },
        specRespondent1DQDisclosureOfElectronicDocuments: {
          reachedAgreement: 'No',
          agreementLikely: 'No',
          reasonForNoAgreement: 'electronic issues',
        },
        specRespondent1DQDisclosureOfNonElectronicDocuments: {
          bespokeDirections: 'non electronic disclosure details',
        },
        respondent1DQClaimantDocumentsToBeConsidered: {
          hasDocumentsToBeConsidered: 'Yes',
          details: 'details',
        },
      },
    };
  },
};
