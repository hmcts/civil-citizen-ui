module.exports = {
  rejectAllDisputeAllWithIndividual: (totalClaimAmount, language, respondentLanguage) => {
    return {
      event: 'DEFENDANT_RESPONSE_CUI',
      caseDataUpdate: {
        respondent1ClaimResponseTypeForSpec: 'FULL_DEFENCE',
        respondToClaimAdmitPartLRspec: {},
        responseClaimMediationSpecRequired: 'No',
        specAoSApplicantCorrespondenceAddressRequired: 'No',
        totalClaimAmount: totalClaimAmount,
        respondent1: {
          individualDateOfBirth: '1987-11-01T00:00:00.000Z',
          individualFirstName: 'John',
          individualLastName: 'Doe',
          individualTitle: 'Sir',
          partyEmail: 'civilmoneyclaimsdemo@gmail.com',
          partyPhone: '07123456789',
          primaryAddress: {
            AddressLine1: 'TestAddressLine1',
            AddressLine2: 'TestAddressLine2',
            AddressLine3: 'TestAddressLine3',
            PostCode: 'IG61JD',
            PostTown: 'TestCity',
          },
          type: 'INDIVIDUAL',
        },
        respondent1LiPResponse: {
          respondent1LiPFinancialDetails: {},
          respondent1MediationLiPResponse: {
            mediationDisagreementLiP: 'No',
          },
          respondent1DQExtraDetails: {
            wantPhoneOrVideoHearing: 'No',
            giveEvidenceYourSelf: 'No',
            triedToSettle: 'No',
            determinationWithoutHearingRequired: 'No',
            determinationWithoutHearingReason: 'TestReason',
            requestExtra4weeks: 'No',
            considerClaimantDocuments: 'No',
            respondent1DQLiPExpert: {
              caseNeedsAnExpert: 'No',
            },
          },
          respondent1DQHearingSupportLip: {
            supportRequirementLip: 'No',
          },
          respondent1ResponseLanguage: respondentLanguage,
        },
        detailsOfWhyDoesYouDisputeTheClaim: 'Testreason',
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
          court: language,
          documents: language,
        },
        respondent1DQVulnerabilityQuestions: {
          vulnerabilityAdjustmentsRequired: 'No',
        },
        respondent1DQRequestedCourt: {
          requestHearingAtSpecificCourt: 'No',
        },
        respondent1DQWitnesses: {
          witnessesToAppear: 'No',
        },
        respondent1DQHearingFastClaim: {
          hearingLengthHours: '3',
          hearingLengthDays: '1',
          unavailableDatesRequired: 'No',
        },
        respondent1DQExperts: {
          expertRequired: 'No',
        },
      },
    };
  },

  rejectAllAlreadypaidNotFullWithIndividual: (totalClaimAmount) => {
    return {
      'event': 'DEFENDANT_RESPONSE_CUI',
      'caseDataUpdate': {
        'respondent1ClaimResponseTypeForSpec': 'FULL_DEFENCE',
        'defenceAdmitPartPaymentTimeRouteRequired': 'IMMEDIATELY',
        'respondToClaimAdmitPartLRspec': {

        },
        'responseClaimMediationSpecRequired': 'No',
        'specAoSApplicantCorrespondenceAddressRequired': 'Yes',
        'totalClaimAmount': totalClaimAmount,
        'respondent1': {
          'individualDateOfBirth': '2000-02-01',
          'individualFirstName': 'John',
          'individualLastName': 'Doe',
          'individualTitle': 'Sir',
          'partyEmail': 'civilmoneyclaimsdemo@gmail.com',
          'partyPhone': '07800000000',
          'primaryAddress': {
            'AddressLine1': 'TestAddressLine1',
            'AddressLine2': 'TestAddressLine2',
            'AddressLine3': 'TestAddressLine3',
            'PostCode': 'IG61JD',
            'PostTown': 'TestCity',
          },
          'soleTraderDateOfBirth': null,
          'type': 'INDIVIDUAL',
        },
        'respondent1LiPResponse': {
          'timelineComment': '',
          'evidenceComment': '',
          'respondent1MediationLiPResponse': {
            'mediationDisagreementLiP': 'No',
            'noMediationReasonLiP': 'NOT_SURE',
            'noMediationOtherReasonLiP': '',
          },
          'respondent1DQExtraDetails': {
            'wantPhoneOrVideoHearing': 'No',
            'whyPhoneOrVideoHearing': '',
            'giveEvidenceYourSelf': 'No',
            'determinationWithoutHearingRequired': 'Yes',
            'determinationWithoutHearingReason': '',
            'considerClaimantDocumentsDetails': '',
            'respondent1DQLiPExpert': {
              'expertCanStillExamineDetails': '',
            },
          },
          'respondent1DQHearingSupportLip': {
            'supportRequirementLip': 'No',
          },
          'respondent1ResponseLanguage': 'ENGLISH',
        },
        'respondent1LiPFinancialDetails': {

        },
        'detailsOfWhyDoesYouDisputeTheClaim': 'hy do you disagree with the claim amount',
        'specClaimResponseTimelineList': 'MANUAL',
        'specResponseTimelineOfEvents': [

        ],
        'specResponselistYourEvidenceList': [
          {
            'id': '0',
            'value': {
              'evidenceType': 'STATEMENT_OF_ACCOUNT',
              'statementOfTruthEvidence': 'receipt',
            },
          },
        ],
        'defenceRouteRequired': 'HAS_PAID_THE_AMOUNT_CLAIMED',
        'respondToClaim': {
          'howMuchWasPaid': 56700,
          'howWasThisAmountPaid': 'OTHER',
          'whenWasThisAmountPaid': '2023-03-02T00:00:00.000Z',
          'howWasThisAmountPaidOther': 'cheque',
        },
        'respondent1DQHomeDetails': {

        },
        'respondent1PartnerAndDependent': {
          'howManyChildrenByAgeGroup': {

          },
        },
        'specDefendant1SelfEmploymentDetails': {

        },
        'respondToClaimAdmitPartUnemployedLRspec': {

        },
        'respondent1DQLanguage': {
          'court': 'ENGLISH',
          'documents': 'ENGLISH',
        },
        'respondent1DQVulnerabilityQuestions': {
          'vulnerabilityAdjustmentsRequired': 'No',
        },
        'respondent1DQRequestedCourt': {
          'requestHearingAtSpecificCourt': 'No',
          'otherPartyPreferredSite': '',
          'responseCourtCode': '',
          'responseCourtLocations': [

          ],
          'caseLocation': {

          },
        },
        'respondent1DQWitnesses': {
          'witnessesToAppear': 'No',
          'details': [
            {
              'value': {
                'name': '',
                'firstName': '',
                'lastName': '',
                'emailAddress': '',
                'phoneNumber': '',
                'reasonForWitness': '',
              },
            },
          ],
        },
        'respondent1DQHearingSmallClaim': {
          'unavailableDatesRequired': 'No',
        },
        'respondent1DQExperts': {

        },
      },
    };
  },

  rejectAllAlreadypaidInFullWithIndividual: (totalClaimAmount) => {
    return {
      'event': 'DEFENDANT_RESPONSE_CUI',
      'caseDataUpdate': {
        'respondent1ClaimResponseTypeForSpec': 'FULL_DEFENCE',
        'defenceAdmitPartPaymentTimeRouteRequired': 'IMMEDIATELY',
        'respondToClaimAdmitPartLRspec': {

        },
        'responseClaimMediationSpecRequired': 'No',
        'specAoSApplicantCorrespondenceAddressRequired': 'Yes',
        'totalClaimAmount': totalClaimAmount,
        'respondent1': {
          'individualDateOfBirth': '2000-02-01',
          'individualFirstName': 'John',
          'individualLastName': 'Doe',
          'individualTitle': 'Sir',
          'partyEmail': 'civilmoneyclaimsdemo@gmail.com',
          'partyPhone': '07800000000',
          'primaryAddress': {
            'AddressLine1': 'TestAddressLine1',
            'AddressLine2': 'TestAddressLine2',
            'AddressLine3': 'TestAddressLine3',
            'PostCode': 'IG61JD',
            'PostTown': 'TestCity',
          },
          'soleTraderDateOfBirth': null,
          'type': 'INDIVIDUAL',
        },
        'respondent1LiPResponse': {
          'timelineComment': '',
          'evidenceComment': '',
          'respondent1MediationLiPResponse': {
            'mediationDisagreementLiP': 'No',
            'noMediationReasonLiP': 'NOT_SURE',
            'noMediationOtherReasonLiP': '',
          },
          'respondent1DQExtraDetails': {
            'wantPhoneOrVideoHearing': 'No',
            'whyPhoneOrVideoHearing': '',
            'giveEvidenceYourSelf': 'No',
            'determinationWithoutHearingRequired': 'Yes',
            'determinationWithoutHearingReason': '',
            'considerClaimantDocumentsDetails': '',
            'respondent1DQLiPExpert': {
              'expertCanStillExamineDetails': '',
            },
          },
          'respondent1DQHearingSupportLip': {
            'supportRequirementLip': 'No',
          },
          'respondent1ResponseLanguage': 'ENGLISH',
        },
        'respondent1LiPFinancialDetails': {

        },
        'defenceRouteRequired': 'HAS_PAID_THE_AMOUNT_CLAIMED',
        'respondToClaim': {
          'howMuchWasPaid': totalClaimAmount + '00',
          'howWasThisAmountPaid': 'OTHER',
          'whenWasThisAmountPaid': '2023-03-02T00:00:00.000Z',
          'howWasThisAmountPaidOther': 'cheque',
        },
        'respondent1DQHomeDetails': {

        },
        'respondent1PartnerAndDependent': {
          'howManyChildrenByAgeGroup': {

          },
        },
        'specDefendant1SelfEmploymentDetails': {

        },
        'respondToClaimAdmitPartUnemployedLRspec': {

        },
        'respondent1DQLanguage': {
          'court': 'ENGLISH',
          'documents': 'ENGLISH',
        },
        'respondent1DQVulnerabilityQuestions': {
          'vulnerabilityAdjustmentsRequired': 'No',
        },
        'respondent1DQRequestedCourt': {
          'requestHearingAtSpecificCourt': 'No',
          'otherPartyPreferredSite': '',
          'responseCourtCode': '',
          'responseCourtLocations': [

          ],
          'caseLocation': {

          },
        },
        'respondent1DQWitnesses': {
          'witnessesToAppear': 'No',
          'details': [
            {
              'value': {
                'name': '',
                'firstName': '',
                'lastName': '',
                'emailAddress': '',
                'phoneNumber': '',
                'reasonForWitness': '',
              },
            },
          ],
        },
        'respondent1DQHearingSmallClaim': {
          'unavailableDatesRequired': 'No',
        },
        'respondent1DQExperts': {

        },
      },
    };
  },
};
