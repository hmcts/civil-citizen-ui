module.exports = {
  partAdmitAmountPaidWithIndividual: () => {
    return {
      'event': 'DEFENDANT_RESPONSE_CUI',
      'caseDataUpdate': {
        'respondent1ClaimResponseTypeForSpec': 'PART_ADMISSION',
        'defenceAdmitPartPaymentTimeRouteRequired': 'IMMEDIATELY',
        'respondToClaimAdmitPartLRspec': {

        },
        'responseClaimMediationSpecRequired': 'Yes',
        'specAoSApplicantCorrespondenceAddressRequired': 'Yes',
        'totalClaimAmount': 1500,
        'respondent1': {
          'individualDateOfBirth': '1990-09-09',
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
          'timelineComment': 'comments about their timeline',
          'evidenceComment': 'List any parts of their evidence yo',
          'respondent1MediationLiPResponse': {
            'canWeUseMediationLiP': 'Yes',
          },
          'respondent1DQExtraDetails': {
            'wantPhoneOrVideoHearing': 'Yes',
            'whyPhoneOrVideoHearing': 'Tell us why you want a telephone or video hearing all details',
            'giveEvidenceYourSelf': 'Yes',
            'determinationWithoutHearingRequired': 'No',
            'determinationWithoutHearingReason': 'Determination without Hearing Questions',
            'considerClaimantDocumentsDetails': '',
            'respondent1DQLiPExpert': {
              'caseNeedsAnExpert': 'Yes',
              'expertCanStillExamineDetails': '',
              'expertReportRequired': 'Yes',
              'details': [
                {
                  'value': {
                    'expertName': 'Testign expert',
                    'reportDate': '2023-01-01T00:00:00.000Z',
                  },
                },
              ],
            },
          },
          'respondent1DQHearingSupportLip': {
            'supportRequirementLip': 'Yes',
            'requirementsLip': [
              {
                'value': {
                  'name': 'John Doe',
                  'requirements': [
                    'DISABLED_ACCESS',
                    'HEARING_LOOPS',
                  ],
                  'signLanguageRequired': '',
                  'languageToBeInterpreted': '',
                  'otherSupport': '',
                },
              },
              {
                'value': {
                  'name': 'witness one',
                  'requirements': [
                    'LANGUAGE_INTERPRETER',
                  ],
                  'signLanguageRequired': '',
                  'languageToBeInterpreted': 'roman',
                  'otherSupport': '',
                },
              },
            ],
          },
          'respondent1ResponseLanguage': 'ENGLISH',
        },
        'respondent1LiPFinancialDetails': {

        },
        'respondToAdmittedClaim': {
          'howMuchWasPaid': 70000,
          'howWasThisAmountPaid': 'OTHER',
          'whenWasThisAmountPaid': '2020-01-01T00:00:00.000Z',
          'howWasThisAmountPaidOther': 'paid via testing support',
        },
        'specDefenceAdmittedRequired': 'Yes',
        'detailsOfWhyDoesYouDisputeTheClaim': 'The total amount claimed is £1500. This includes the claim fee and any interest. but i disagree it',
        'specClaimResponseTimelineList': 'MANUAL',
        'specResponseTimelineOfEvents': [
          {
            'value': {
              'timelineDate': '2023-09-09T00:00:00.000Z',
              'timelineDescription': 'next steps happned',
            },
          },
        ],
        'specResponselistYourEvidenceList': [
          {
            'id': '0',
            'value': {
              'evidenceType': 'EXPERT_WITNESS',
              'expertWitnessEvidence': 'example, a surveyor\'s report',
            },
          },
        ],
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
          'vulnerabilityAdjustments': 'Are you, your experts or witnesses vulnerable in a way that the court needs to consider - yes',
        },
        'respondent1DQRequestedCourt': {
          'requestHearingAtSpecificCourt': 'Yes',
          'otherPartyPreferredSite': '',
          'responseCourtCode': '',
          'reasonForHearingAtSpecificCourt': 'Tell us why you want the hearing to be held at this court',
          'responseCourtLocations': [

          ],
          'caseLocation': {
            'region': 'Nottingham County Court and Family Court (and Crown) - Canal Street - NG1 7EJ',
            'baseLocation': 'Nottingham County Court and Family Court (and Crown) - Canal Street - NG1 7EJ',
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
                'reasonForWitness': 'Tell us what they witnessed',
              },
            },
          ],
        },
        'respondent1DQHearingSmallClaim': {
          'unavailableDatesRequired': 'Yes',
          'smallClaimUnavailableDate': [
            {
              'value': {
                'who': 'defendant',
                'date': '2024-12-15T00:00:00.000Z',
                'fromDate': '2024-12-15T00:00:00.000Z',
                'toDate': '2024-12-20T00:00:00.000Z',
                'unavailableDateType': 'DATE_RANGE',
              },
            },
            {
              'value': {
                'who': 'defendant',
                'date': '2024-12-11T00:00:00.000Z',
                'fromDate': '2024-12-11T00:00:00.000Z',
                'unavailableDateType': 'SINGLE_DATE',
              },
            },
          ],
        },
        'respondent1DQExperts': {

        },
      },
    };
  },

  partAdmitHaventPaidPartiallyWantsToPayImmediatelyWithIndividual: () => {
    return {
      'event': 'DEFENDANT_RESPONSE_CUI',
      'caseDataUpdate': {
        'respondent1ClaimResponseTypeForSpec': 'PART_ADMISSION',
        'defenceAdmitPartPaymentTimeRouteRequired': 'IMMEDIATELY',
        'respondToClaimAdmitPartLRspec': {
          'whenWillThisAmountBePaid': '2024-03-11',
        },
        'responseClaimMediationSpecRequired': 'No',
        'specAoSApplicantCorrespondenceAddressRequired': 'Yes',
        'totalClaimAmount': 1500,
        'respondent1': {
          'individualDateOfBirth': '2001-09-09',
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
          'timelineComment': 'comments about their timeline',
          'evidenceComment': '',
          'respondent1MediationLiPResponse': {
            'mediationDisagreementLiP': 'No',
            'noMediationReasonLiP': 'JUDGE_TO_DECIDE',
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
              'caseNeedsAnExpert': 'Yes',
              'expertCanStillExamineDetails': 'claim involve something an expert can still ex',
              'expertReportRequired': 'No',
            },
          },
          'respondent1DQHearingSupportLip': {
            'supportRequirementLip': 'No',
          },
          'respondent1LiPCorrespondenceAddress': {
            'AddressLine1': '  FLAT 12 BARTHOLOMEW COURT',
            'AddressLine2': 'BARTHOLOMEW STREET',
            'AddressLine3': '',
            'PostCode': 'RG14 5HF',
            'PostTown': 'NEWBURY',
          },
          'respondent1ResponseLanguage': 'ENGLISH',
        },
        'respondent1LiPFinancialDetails': {

        },
        'specDefenceAdmittedRequired': 'No',
        'respondToAdmittedClaimOwingAmountPounds': '200',
        'respondToAdmittedClaimOwingAmount': '20000',
        'detailsOfWhyDoesYouDisputeTheClaim': 'Test reason',
        'specClaimResponseTimelineList': 'MANUAL',
        'specResponseTimelineOfEvents': [
          {
            'value': {
              'timelineDate': '2020-09-09T00:00:00.000Z',
              'timelineDescription': 'contract issue',
            },
          },
        ],
        'specResponselistYourEvidenceList': [
          {
            'id': '0',
            'value': {
              'evidenceType': 'CONTRACTS_AND_AGREEMENTS',
              'contractAndAgreementsEvidence': 'asfdafa',
            },
          },
        ],
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
          'court': 'WELSH',
          'documents': 'WELSH',
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
          'expertRequired': 'Yes',
          'details': [
            {
              'value': {
                'name': 'expertname lastname',
                'firstName': 'expertname',
                'lastName': 'lastname',
                'phoneNumber': '',
                'emailAddress': 't@g.com',
                'whyRequired': ' us why you need this expert',
                'fieldOfExpertise': 'cases',
                'estimatedCost': 12300,
              },
            },
          ],
        },
        'responseClaimExpertSpecRequired': 'Yes',
      },
    };
  },

  partAdmitWithPartPaymentOnSpecificDateWithIndividual: () => {
    return {
      'event': 'DEFENDANT_RESPONSE_CUI',
      'caseDataUpdate': {
        'respondent1ClaimResponseTypeForSpec': 'PART_ADMISSION',
        'defenceAdmitPartPaymentTimeRouteRequired': 'BY_SET_DATE',
        'respondToClaimAdmitPartLRspec': {
          'whenWillThisAmountBePaid': '2045-12-16T00:00:00.000Z',
        },
        'responseClaimMediationSpecRequired': 'No',
        'specAoSApplicantCorrespondenceAddressRequired': 'Yes',
        'totalClaimAmount': 1500,
        'respondent1': {
          'individualDateOfBirth': '1980-12-12',
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
            'noMediationReasonLiP': 'NO_DELAY_IN_HEARING',
            'noMediationOtherReasonLiP': '',
          },
          'respondent1DQExtraDetails': {
            'wantPhoneOrVideoHearing': 'No',
            'whyPhoneOrVideoHearing': '',
            'giveEvidenceYourSelf': 'Yes',
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
        'specDefenceAdmittedRequired': 'No',
        'respondToAdmittedClaimOwingAmountPounds': '456',
        'respondToAdmittedClaimOwingAmount': '45600',
        'detailsOfWhyDoesYouDisputeTheClaim': 'disagree with the claim amount?',
        'specClaimResponseTimelineList': 'MANUAL',
        'specResponseTimelineOfEvents': [

        ],
        'specResponselistYourEvidenceList': [

        ],
        'disabilityPremiumPayments': 'No',
        'respondent1DQHomeDetails': {
          'type': 'PRIVATE_RENTAL',
          'typeOtherDetails': '',
        },
        'respondent1PartnerAndDependent': {
          'liveWithPartnerRequired': 'No',
          'haveAnyChildrenRequired': 'No',
          'howManyChildrenByAgeGroup': {

          },
          'supportedAnyoneFinancialRequired': 'No',
        },
        'defenceAdmitPartEmploymentTypeRequired': 'Yes',
        'respondToClaimAdmitPartEmploymentTypeLRspec': [
          'EMPLOYED',
        ],
        'responseClaimAdmitPartEmployer': {
          'employerDetails': [
            {
              'value': {
                'employerName': 'testnt',
                'jobTitle': 'regs',
              },
            },
          ],
        },
        'specDefendant1SelfEmploymentDetails': {

        },
        'respondToClaimAdmitPartUnemployedLRspec': {

        },
        'respondent1CourtOrderPaymentOption': 'No',
        'respondent1CourtOrderDetails': [

        ],
        'respondent1LoanCreditOption': 'No',
        'responseToClaimAdmitPartWhyNotPayLRspec': 'Briefly explain why you can\'t pay immediately\r\n',
        'respondent1DQCarerAllowanceCredit': 'No',
        'specDefendant1Debts': {
          'debtDetails': [
            {
              'value': {
                'debtType': 'WATER',
                'paymentAmount': 200,
                'paymentFrequency': 'ONCE_ONE_WEEK',
              },
            },
          ],
        },
        'respondent1DQRecurringIncome': [
          {
            'value': {
              'type': 'PENSION',
              'amount': 34500,
              'frequency': 'ONCE_ONE_WEEK',
            },
          },
        ],
        'respondent1DQLanguage': {
          'court': 'WELSH',
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

  partAdmitWithPartPaymentAsPerInstallmentPlanWithIndividual: () => {
    return {
      'event': 'DEFENDANT_RESPONSE_CUI',
      'caseDataUpdate': {
        'respondent1ClaimResponseTypeForSpec': 'PART_ADMISSION',
        'defenceAdmitPartPaymentTimeRouteRequired': 'SUGGESTION_OF_REPAYMENT_PLAN',
        'respondent1RepaymentPlan': {
          'paymentAmount': 1200,
          'repaymentFrequency': 'ONCE_ONE_WEEK',
          'firstRepaymentDate': '2025-12-12T00:00:00.000Z',
        },
        'respondToClaimAdmitPartLRspec': {

        },
        'responseClaimMediationSpecRequired': 'No',
        'specAoSApplicantCorrespondenceAddressRequired': 'Yes',
        'totalClaimAmount': 1500,
        'respondent1': {
          'individualDateOfBirth': '1989-02-02',
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
            'noMediationReasonLiP': 'WOULD_NOT_SOLVE',
            'noMediationOtherReasonLiP': '',
          },
          'respondent1DQExtraDetails': {
            'wantPhoneOrVideoHearing': 'No',
            'whyPhoneOrVideoHearing': '',
            'giveEvidenceYourSelf': 'Yes',
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
          'partnerPensionLiP': 'No',
          'childrenEducationLiP': '1',
        },
        'specDefenceAdmittedRequired': 'No',
        'respondToAdmittedClaimOwingAmountPounds': '1345',
        'respondToAdmittedClaimOwingAmount': '134500',
        'detailsOfWhyDoesYouDisputeTheClaim': 'disagree with the claim amount 1345 is original',
        'specClaimResponseTimelineList': 'MANUAL',
        'specResponseTimelineOfEvents': [

        ],
        'specResponselistYourEvidenceList': [

        ],
        'respondent1BankAccountList': [
          {
            'value': {
              'accountType': 'SAVINGS',
              'jointAccount': 'Yes',
              'balance': 300,
            },
          },
        ],
        'disabilityPremiumPayments': 'No',
        'respondent1DQHomeDetails': {
          'type': 'PRIVATE_RENTAL',
          'typeOtherDetails': '',
        },
        'respondent1PartnerAndDependent': {
          'liveWithPartnerRequired': 'Yes',
          'partnerAgedOver': 'Yes',
          'haveAnyChildrenRequired': 'Yes',
          'howManyChildrenByAgeGroup': {
            'numberOfUnderEleven': '2',
            'numberOfElevenToFifteen': '1',
            'numberOfSixteenToNineteen': '1',
          },
          'receiveDisabilityPayments': 'Yes',
          'supportedAnyoneFinancialRequired': 'Yes',
          'supportPeopleNumber': '1',
          'supportPeopleDetails': 'sadfasf',
        },
        'defenceAdmitPartEmploymentTypeRequired': 'Yes',
        'respondToClaimAdmitPartEmploymentTypeLRspec': [
          'EMPLOYED',
        ],
        'responseClaimAdmitPartEmployer': {
          'employerDetails': [
            {
              'value': {
                'employerName': 'testing',
                'jobTitle': 'reee',
              },
            },
          ],
        },
        'specDefendant1SelfEmploymentDetails': {

        },
        'respondToClaimAdmitPartUnemployedLRspec': {

        },
        'respondent1CourtOrderPaymentOption': 'Yes',
        'respondent1CourtOrderDetails': [
          {
            'value': {
              'claimNumberText': '00MC234',
              'amountOwed': 12300,
              'monthlyInstalmentAmount': 100,
            },
          },
        ],
        'respondent1LoanCreditOption': 'No',
        'responseToClaimAdmitPartWhyNotPayLRspec': 'Briefly explain why you can\'t pay immediately',
        'specDefendant1Debts': {
          'debtDetails': [
            {
              'value': {
                'debtType': 'RENT',
                'paymentAmount': 1200,
                'paymentFrequency': 'ONCE_ONE_WEEK',
              },
            },
          ],
        },
        'respondent1DQRecurringIncome': [
          {
            'value': {
              'type': 'UNIVERSAL_CREDIT',
              'amount': 45600,
              'frequency': 'ONCE_ONE_WEEK',
            },
          },
        ],
        'respondent1DQRecurringExpenses': [
          {
            'value': {
              'type': 'FOOD',
              'amount': 4300,
              'frequency': 'ONCE_TWO_WEEKS',
            },
          },
        ],
        'respondent1DQLanguage': {
          'court': 'WELSH',
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
