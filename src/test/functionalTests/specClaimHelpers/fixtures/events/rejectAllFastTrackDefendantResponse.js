module.exports = {
  rejectAllDisputeAllWithIndividual: (totalClaimAmount) => {
    return {
      'event': 'DEFENDANT_RESPONSE_CUI',
      'caseDataUpdate': {
        'respondent1ClaimResponseTypeForSpec': 'FULL_DEFENCE',
        'respondToClaimAdmitPartLRspec': {
        },
        'responseClaimMediationSpecRequired': 'No',
        'specAoSApplicantCorrespondenceAddressRequired': 'Yes',
        'totalClaimAmount': totalClaimAmount,
        'respondent1': {
          'individualDateOfBirth': '2000-08-08',
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
          'timelineComment': 'ments about their time',
          'evidenceComment': ' parts of their evidence you dis',
          'respondent1DQExtraDetails': {
            'wantPhoneOrVideoHearing': 'No',
            'whyPhoneOrVideoHearing': '',
            'giveEvidenceYourSelf': 'No',
            'triedToSettle': 'Yes',
            'determinationWithoutHearingReason': '',
            'requestExtra4weeks': 'Yes',
            'considerClaimantDocuments': 'Yes',
            'considerClaimantDocumentsDetails': 'Give details of the documen',
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
        'detailsOfWhyDoesYouDisputeTheClaim': 'Don\'t give us a detailed timeline - we\'ll ask f',
        'specClaimResponseTimelineList': 'MANUAL',
        'specResponseTimelineOfEvents': [
          {
            'value': {
              'timelineDate': '2020-02-02T00:00:00.000Z',
              'timelineDescription': 'dsafdasf',
            },
          },
        ],
        'specResponselistYourEvidenceList': [
          {
            'id': '0',
            'value': {
              'evidenceType': 'EXPERT_WITNESS',
              'expertWitnessEvidence': 'example, a surveyor\'s report.',
            },
          },
          {
            'id': '1',
            'value': {
              'evidenceType': 'RECEIPTS',
              'receiptsEvidence': 'example, a receipt showi',
            },
          },
        ],
        'defenceRouteRequired': 'DISPUTES_THE_CLAIM',
        'respondToClaim': {
          'howMuchWasPaid': null,
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
        'respondent1DQHearingFastClaim': {
          'hearingLengthHours': '3',
          'hearingLengthDays': '1',
          'unavailableDatesRequired': 'No',
        },
        'respondent1DQExperts': {
          'expertRequired': 'No',
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
          'individualDateOfBirth': '1990-02-02',
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
          'respondent1DQExtraDetails': {
            'wantPhoneOrVideoHearing': 'No',
            'whyPhoneOrVideoHearing': '',
            'giveEvidenceYourSelf': 'Yes',
            'triedToSettle': 'Yes',
            'determinationWithoutHearingReason': '',
            'requestExtra4weeks': 'No',
            'considerClaimantDocuments': 'No',
            'considerClaimantDocumentsDetails': '',
            'respondent1DQLiPExpert': {
              'expertCanStillExamineDetails': '',
            },
          },
          'respondent1DQHearingSupportLip': {
            'supportRequirementLip': 'Yes',
            'requirementsLip': [
              {
                'value': {
                  'name': 'witness two',
                  'requirements': [
                    'DISABLED_ACCESS',
                  ],
                  'signLanguageRequired': '',
                  'languageToBeInterpreted': '',
                  'otherSupport': '',
                },
              },
            ],
          },
          'respondent1ResponseLanguage': 'ENGLISH',
        },
        'respondent1LiPFinancialDetails': {

        },
        'specClaimResponseTimelineList': 'MANUAL',
        'specResponseTimelineOfEvents': [

        ],
        'defenceRouteRequired': 'HAS_PAID_THE_AMOUNT_CLAIMED',
        'respondToClaim': {
          'howMuchWasPaid': 1000000,
          'howWasThisAmountPaid': 'OTHER',
          'whenWasThisAmountPaid': '2020-02-01T00:00:00.000Z',
          'howWasThisAmountPaidOther': 'asdfa',
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
          'documents': 'WELSH',
        },
        'respondent1DQVulnerabilityQuestions': {
          'vulnerabilityAdjustmentsRequired': 'Yes',
          'vulnerabilityAdjustments': 'dasfaf',
        },
        'respondent1DQRequestedCourt': {
          'requestHearingAtSpecificCourt': 'Yes',
          'otherPartyPreferredSite': '',
          'responseCourtCode': '',
          'reasonForHearingAtSpecificCourt': 'dsaf',
          'responseCourtLocations': [

          ],
          'caseLocation': {
            'region': 'Clerkenwell and Shoreditch County Court and Family Court - 29-41 Gee Street - EC1V 3RE',
            'baseLocation': 'Clerkenwell and Shoreditch County Court and Family Court - 29-41 Gee Street - EC1V 3RE',
          },
        },
        'respondent1DQWitnesses': {
          'witnessesToAppear': 'Yes',
          'details': [
            {
              'value': {
                'name': 'witness',
                'firstName': 'witness',
                'lastName': 'one',
                'emailAddress': 't@g.com',
                'phoneNumber': '',
                'reasonForWitness': 'dfasf',
              },
            },
            {
              'value': {
                'name': 'witness',
                'firstName': 'witness',
                'lastName': 'two',
                'emailAddress': '',
                'phoneNumber': '',
                'reasonForWitness': 'dsaf',
              },
            },
          ],
        },
        'respondent1DQHearingFastClaim': {
          'hearingLengthHours': '3',
          'hearingLengthDays': '1',
          'unavailableDatesRequired': 'No',
        },
        'respondent1DQExperts': {
          'expertRequired': 'Yes',
          'details': [
            {
              'value': {
                'name': 'expertname twothree',
                'firstName': 'expertname',
                'lastName': 'twothree',
                'phoneNumber': '',
                'emailAddress': 't@g.com',
                'whyRequired': 'Tell us why you need this expert',
                'fieldOfExpertise': 'cases',
                'estimatedCost': 13400,
              },
            },
          ],
          'expertReportsSent': 'YES',
          'jointExpertSuitable': 'Yes',
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
          'individualDateOfBirth': '1990-02-02',
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
          'respondent1DQExtraDetails': {
            'wantPhoneOrVideoHearing': 'No',
            'whyPhoneOrVideoHearing': '',
            'giveEvidenceYourSelf': 'Yes',
            'triedToSettle': 'Yes',
            'determinationWithoutHearingReason': '',
            'requestExtra4weeks': 'No',
            'considerClaimantDocuments': 'No',
            'considerClaimantDocumentsDetails': '',
            'respondent1DQLiPExpert': {
              'expertCanStillExamineDetails': '',
            },
          },
          'respondent1DQHearingSupportLip': {
            'supportRequirementLip': 'Yes',
            'requirementsLip': [
              {
                'value': {
                  'name': 'witness two',
                  'requirements': [
                    'DISABLED_ACCESS',
                  ],
                  'signLanguageRequired': '',
                  'languageToBeInterpreted': '',
                  'otherSupport': '',
                },
              },
            ],
          },
          'respondent1ResponseLanguage': 'ENGLISH',
        },
        'respondent1LiPFinancialDetails': {

        },
        'defenceRouteRequired': 'HAS_PAID_THE_AMOUNT_CLAIMED',
        'respondToClaim': {
          'howMuchWasPaid': totalClaimAmount + '00',
          'howWasThisAmountPaid': 'OTHER',
          'whenWasThisAmountPaid': '2020-02-01T00:00:00.000Z',
          'howWasThisAmountPaidOther': 'asdfa',
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
          'documents': 'WELSH',
        },
        'respondent1DQVulnerabilityQuestions': {
          'vulnerabilityAdjustmentsRequired': 'Yes',
          'vulnerabilityAdjustments': 'dasfaf',
        },
        'respondent1DQRequestedCourt': {
          'requestHearingAtSpecificCourt': 'Yes',
          'otherPartyPreferredSite': '',
          'responseCourtCode': '',
          'reasonForHearingAtSpecificCourt': 'dsaf',
          'responseCourtLocations': [

          ],
          'caseLocation': {
            'region': 'Clerkenwell and Shoreditch County Court and Family Court - 29-41 Gee Street - EC1V 3RE',
            'baseLocation': 'Clerkenwell and Shoreditch County Court and Family Court - 29-41 Gee Street - EC1V 3RE',
          },
        },
        'respondent1DQWitnesses': {
          'witnessesToAppear': 'Yes',
          'details': [
            {
              'value': {
                'name': 'witness',
                'firstName': 'witness',
                'lastName': 'one',
                'emailAddress': 't@g.com',
                'phoneNumber': '',
                'reasonForWitness': 'dfasf',
              },
            },
            {
              'value': {
                'name': 'witness',
                'firstName': 'witness',
                'lastName': 'two',
                'emailAddress': '',
                'phoneNumber': '',
                'reasonForWitness': 'dsaf',
              },
            },
          ],
        },
        'respondent1DQHearingFastClaim': {
          'hearingLengthHours': '3',
          'hearingLengthDays': '1',
          'unavailableDatesRequired': 'No',
        },
        'respondent1DQExperts': {
          'expertRequired': 'Yes',
          'details': [
            {
              'value': {
                'name': 'expertname twothree',
                'firstName': 'expertname',
                'lastName': 'twothree',
                'phoneNumber': '',
                'emailAddress': 't@g.com',
                'whyRequired': 'Tell us why you need this expert',
                'fieldOfExpertise': 'cases',
                'estimatedCost': 13400,
              },
            },
          ],
          'expertReportsSent': 'YES',
          'jointExpertSuitable': 'Yes',
        },
      },
    };
  },
};
