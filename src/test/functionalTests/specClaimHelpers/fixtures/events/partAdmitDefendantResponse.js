module.exports = {
  partAdmitAlreadyPaid: () => {
    return {
      'event': 'DEFENDANT_RESPONSE_CUI',
      'caseDataUpdate': {
        'respondent1ClaimResponseTypeForSpec': 'PART_ADMISSION',
        'defenceAdmitPartPaymentTimeRouteRequired': 'IMMEDIATELY',
        'respondToClaimAdmitPartLRspec': {
          
        },
        'responseClaimMediationSpecRequired': 'Yes',
        'specAoSApplicantCorrespondenceAddressRequired': 'No',
        'totalClaimAmount': 1500,
        'respondent1': {
          'individualDateOfBirth': '1987-11-11',
          'individualFirstName': 'John',
          'individualLastName': 'Doe',
          'individualTitle': 'Sir',
          'partyEmail': 'claimantcitizen-ae9f8se@gmail.com',
          'partyPhone': '07800000000',
          'primaryAddress': {
            'AddressLine1': 'Test AddressLine1',
            'AddressLine2': 'Test AddressLine2',
            'AddressLine3': 'Test AddressLine3',
            'PostCode': 'IG6 1JD',
            'PostTown': 'Test City',
          },
          'soleTraderDateOfBirth': null,
          'type': 'INDIVIDUAL',
        },
        'respondent1LiPResponse': {
          'timelineComment': '',
          'evidenceComment': '',
          'respondent1MediationLiPResponse': {
            'canWeUseMediationLiP': 'No',
            'canWeUseMediationPhoneLiP': '07444515234',
          },
          'respondent1DQExtraDetails': {
            'wantPhoneOrVideoHearing': 'Yes',
            'whyPhoneOrVideoHearing': 'Test details Do you want to ask for a telephone or video hearing?',
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
                    'expertName': 'TestExpert1',
                    'reportDate': '2022-10-20T00:00:00.000Z',
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
                  'name': 'WitnessFName WitnessLName',
                  'requirements': [
                    'HEARING_LOOPS',
                    'LANGUAGE_INTERPRETER',
                    'SIGN_INTERPRETER',
                    'OTHER_SUPPORT',
                  ],
                  'signLanguageRequired': 'Spanish',
                  'languageToBeInterpreted': 'engli',
                  'otherSupport': 'other support',
                },
              },
            ],
          },
          'respondent1ResponseLanguage': 'ENGLISH',
        },
        'respondent1LiPFinancialDetails': {
          
        },
        'respondToAdmittedClaim': {
          'howMuchWasPaid': 50000,
          'howWasThisAmountPaid': 'OTHER',
          'whenWasThisAmountPaid': '2023-03-01T00:00:00.000Z',
          'howWasThisAmountPaidOther': 'Bank transfer',
        },
        'specDefenceAdmittedRequired': 'Yes',
        'detailsOfWhyDoesYouDisputeTheClaim': 'Test reason',
        'specClaimResponseTimelineList': 'MANUAL',
        'specResponseTimelineOfEvents': [
          {
            'value': {
              'timelineDate': '2023-12-12T00:00:00.000Z',
              'timelineDescription': 'TestTimeLine',
            },
          },
        ],
        'specResponselistYourEvidenceList': [
          {
            'id': '0',
            'value': {
              'evidenceType': 'CONTRACTS_AND_AGREEMENTS',
              'contractAndAgreementsEvidence': 'TestEvidence',
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
          'vulnerabilityAdjustments': 'Test details Do you want to ask for a telephone or video hearing?',
        },
        'respondent1DQRequestedCourt': {
          'requestHearingAtSpecificCourt': 'Yes',
          'otherPartyPreferredSite': '',
          'responseCourtCode': '',
          'reasonForHearingAtSpecificCourt': 'Nearest court',
          'responseCourtLocations': [
            
          ],
          'caseLocation': {
            'region': 'Leeds Combined Court Centre - The Court House, 1 Oxford Row - LS1 3BG',
            'baseLocation': 'Leeds Combined Court Centre - The Court House, 1 Oxford Row - LS1 3BG',
          },
        },
        'respondent1DQWitnesses': {
          'witnessesToAppear': 'Yes',
          'details': [
            {
              'value': {
                'name': 'WitnessFName',
                'firstName': 'WitnessFName',
                'lastName': 'WitnessLName',
                'emailAddress': 'test@test.com',
                'phoneNumber': '09797979797',
                'reasonForWitness': 'TestWitnesses',
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
                'date': '2024-05-10T00:00:00.000Z',
                'fromDate': '2024-05-10T00:00:00.000Z',
                'unavailableDateType': 'SINGLE_DATE',
              },
            },
            {
              'value': {
                'who': 'defendant',
                'date': '2024-05-15T00:00:00.000Z',
                'fromDate': '2024-05-15T00:00:00.000Z',
                'toDate': '2024-05-20T00:00:00.000Z',
                'unavailableDateType': 'DATE_RANGE',
              },
            },
          ],
        },
        'respondent1DQExperts': {
          
        },
      },
    };
  },

  partAdmitPayImmediately: () => {
    return {
      'event': 'DEFENDANT_RESPONSE_CUI',
      'caseDataUpdate': {
        'respondent1ClaimResponseTypeForSpec': 'PART_ADMISSION',
        'defenceAdmitPartPaymentTimeRouteRequired': 'IMMEDIATELY',
        'respondToClaimAdmitPartLRspec': {
          'whenWillThisAmountBePaid': '2024-03-08',
        },
        'responseClaimMediationSpecRequired': 'No',
        'specAoSApplicantCorrespondenceAddressRequired': 'No',
        'totalClaimAmount': 1500,
        'respondent1': {
          'individualDateOfBirth': '1987-11-11',
          'individualFirstName': 'John',
          'individualLastName': 'Doe',
          'individualTitle': 'Sir',
          'partyEmail': 'claimantcitizen-tvswhu9@gmail.com',
          'partyPhone': '07800000000',
          'primaryAddress': {
            'AddressLine1': 'Test AddressLine1',
            'AddressLine2': 'Test AddressLine2',
            'AddressLine3': 'Test AddressLine3',
            'PostCode': 'IG6 1JD',
            'PostTown': 'Test City',
          },
          'soleTraderDateOfBirth': null,
          'type': 'INDIVIDUAL',
        },
        'respondent1LiPResponse': {
          'timelineComment': '',
          'evidenceComment': '',
          'respondent1MediationLiPResponse': {
            'mediationDisagreementLiP': 'No',
            'noMediationReasonLiP': 'JUDGE_TO_DECIDE',
            'noMediationOtherReasonLiP': '',
          },
          'respondent1DQExtraDetails': {
            'wantPhoneOrVideoHearing': 'Yes',
            'whyPhoneOrVideoHearing': 'Test details',
            'giveEvidenceYourSelf': 'Yes',
            'determinationWithoutHearingRequired': 'Yes',
            'determinationWithoutHearingReason': '',
            'considerClaimantDocumentsDetails': '',
            'respondent1DQLiPExpert': {
              'caseNeedsAnExpert': 'Yes',
              'expertCanStillExamineDetails': '',
              'expertReportRequired': 'Yes',
              'details': [
                {
                  'value': {
                    'expertName': 'TestExpert1',
                    'reportDate': '2022-10-20T00:00:00.000Z',
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
                  'name': 'WitnessFName WitnessLName',
                  'requirements': [
                    'HEARING_LOOPS',
                    'SIGN_INTERPRETER',
                  ],
                  'signLanguageRequired': 'Spanish',
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
        'respondToAdmittedClaim': {
          'howMuchWasPaid': 50000,
          'howWasThisAmountPaid': 'OTHER',
          'whenWasThisAmountPaid': '2023-03-01T00:00:00.000Z',
          'howWasThisAmountPaidOther': 'Bank transfer',
        },
        'specDefenceAdmittedRequired': 'No',
        'respondToAdmittedClaimOwingAmountPounds': '300',
        'respondToAdmittedClaimOwingAmount': '30000',
        'detailsOfWhyDoesYouDisputeTheClaim': 'Test reason',
        'specClaimResponseTimelineList': 'MANUAL',
        'specResponseTimelineOfEvents': [
          {
            'value': {
              'timelineDate': '2023-12-12T00:00:00.000Z',
              'timelineDescription': 'TestTimeLine',
            },
          },
        ],
        'specResponselistYourEvidenceList': [
          {
            'id': '0',
            'value': {
              'evidenceType': 'CONTRACTS_AND_AGREEMENTS',
              'contractAndAgreementsEvidence': 'TestEvidence',
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
          'vulnerabilityAdjustments': 'Test details',
        },
        'respondent1DQRequestedCourt': {
          'requestHearingAtSpecificCourt': 'Yes',
          'otherPartyPreferredSite': '',
          'responseCourtCode': '',
          'reasonForHearingAtSpecificCourt': 'Nearest court',
          'responseCourtLocations': [
            
          ],
          'caseLocation': {
            'region': 'Leeds Combined Court Centre - The Court House, 1 Oxford Row - LS1 3BG',
            'baseLocation': 'Leeds Combined Court Centre - The Court House, 1 Oxford Row - LS1 3BG',
          },
        },
        'respondent1DQWitnesses': {
          'witnessesToAppear': 'Yes',
          'details': [
            {
              'value': {
                'name': 'WitnessFName',
                'firstName': 'WitnessFName',
                'lastName': 'WitnessLName',
                'emailAddress': 'test@test.com',
                'phoneNumber': '09797979797',
                'reasonForWitness': 'TestWitnesses',
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
                'date': '2024-05-10T00:00:00.000Z',
                'fromDate': '2024-05-10T00:00:00.000Z',
                'unavailableDateType': 'SINGLE_DATE',
              },
            },
            {
              'value': {
                'who': 'defendant',
                'date': '2024-05-15T00:00:00.000Z',
                'fromDate': '2024-05-15T00:00:00.000Z',
                'toDate': '2024-05-20T00:00:00.000Z',
                'unavailableDateType': 'DATE_RANGE',
              },
            },
          ],
        },
        'respondent1DQExperts': {
          
        },
      },
    };
  },

  partAdmitPayBySetDate: () => {
    return {
      'event': 'DEFENDANT_RESPONSE_CUI',
      'caseDataUpdate': {
        'respondent1ClaimResponseTypeForSpec': 'PART_ADMISSION',
        'defenceAdmitPartPaymentTimeRouteRequired': 'BY_SET_DATE',
        'respondToClaimAdmitPartLRspec': {
          'whenWillThisAmountBePaid': '2027-07-07T00:00:00.000Z',
        },
        'responseClaimMediationSpecRequired': 'No',
        'specAoSApplicantCorrespondenceAddressRequired': 'No',
        'totalClaimAmount': 1500,
        'respondent1': {
          'individualDateOfBirth': '1987-11-11',
          'individualFirstName': 'John',
          'individualLastName': 'Doe',
          'individualTitle': 'Sir',
          'partyEmail': 'claimantcitizen-tpzboww@gmail.com',
          'partyPhone': '07800000000',
          'primaryAddress': {
            'AddressLine1': 'Test AddressLine1',
            'AddressLine2': 'Test AddressLine2',
            'AddressLine3': 'Test AddressLine3',
            'PostCode': 'IG6 1JD',
            'PostTown': 'Test City',
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
            'wantPhoneOrVideoHearing': 'Yes',
            'whyPhoneOrVideoHearing': 'Test details',
            'giveEvidenceYourSelf': 'Yes',
            'determinationWithoutHearingRequired': 'Yes',
            'determinationWithoutHearingReason': '',
            'considerClaimantDocumentsDetails': '',
            'respondent1DQLiPExpert': {
              'caseNeedsAnExpert': 'Yes',
              'expertCanStillExamineDetails': '',
              'expertReportRequired': 'Yes',
              'details': [
                {
                  'value': {
                    'expertName': 'TestExpert1',
                    'reportDate': '2022-10-20T00:00:00.000Z',
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
                  'name': 'WitnessFName WitnessLName',
                  'requirements': [
                    'HEARING_LOOPS',
                    'SIGN_INTERPRETER',
                  ],
                  'signLanguageRequired': 'Spanish',
                  'languageToBeInterpreted': '',
                  'otherSupport': '',
                },
              },
            ],
          },
          'respondent1ResponseLanguage': 'ENGLISH',
        },
        'respondent1LiPFinancialDetails': {
          'childrenEducationLiP': '1',
        },
        'respondToAdmittedClaim': {
          'howMuchWasPaid': 50000,
          'howWasThisAmountPaid': 'OTHER',
          'whenWasThisAmountPaid': '2023-03-01T00:00:00.000Z',
          'howWasThisAmountPaidOther': 'Bank transfer',
        },
        'specDefenceAdmittedRequired': 'No',
        'respondToAdmittedClaimOwingAmountPounds': '347',
        'respondToAdmittedClaimOwingAmount': '34700',
        'detailsOfWhyDoesYouDisputeTheClaim': 'Test reason',
        'specClaimResponseTimelineList': 'MANUAL',
        'specResponseTimelineOfEvents': [
          {
            'value': {
              'timelineDate': '2023-12-12T00:00:00.000Z',
              'timelineDescription': 'TestTimeLine',
            },
          },
        ],
        'specResponselistYourEvidenceList': [
          {
            'id': '0',
            'value': {
              'evidenceType': 'CONTRACTS_AND_AGREEMENTS',
              'contractAndAgreementsEvidence': 'TestEvidence',
            },
          },
        ],
        'respondent1BankAccountList': [
          {
            'value': {
              'accountType': 'CURRENT',
              'jointAccount': 'Yes',
              'balance': 567,
            },
          },
        ],
        'disabilityPremiumPayments': 'No',
        'respondent1DQHomeDetails': {
          'type': 'ASSOCIATION_HOME',
          'typeOtherDetails': '',
        },
        'respondent1PartnerAndDependent': {
          'liveWithPartnerRequired': 'No',
          'haveAnyChildrenRequired': 'Yes',
          'howManyChildrenByAgeGroup': {
            'numberOfUnderEleven': '1',
            'numberOfElevenToFifteen': '1',
            'numberOfSixteenToNineteen': '1',
          },
          'receiveDisabilityPayments': 'No',
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
                'employerName': 'tresr',
                'jobTitle': 'tgg',
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
        'responseToClaimAdmitPartWhyNotPayLRspec': 'Briefly explain why you can\'t pay immediately',
        'respondent1DQCarerAllowanceCredit': 'No',
        'respondent1DQRecurringIncome': [
          {
            'value': {
              'type': 'PENSION',
              'amount': 2000,
              'frequency': 'ONCE_ONE_MONTH',
            },
          },
        ],
        'respondent1DQLanguage': {
          'court': 'ENGLISH',
          'documents': 'WELSH',
        },
        'respondent1DQVulnerabilityQuestions': {
          'vulnerabilityAdjustmentsRequired': 'Yes',
          'vulnerabilityAdjustments': 'Test details',
        },
        'respondent1DQRequestedCourt': {
          'requestHearingAtSpecificCourt': 'Yes',
          'otherPartyPreferredSite': '',
          'responseCourtCode': '',
          'reasonForHearingAtSpecificCourt': 'Nearest court',
          'responseCourtLocations': [
            
          ],
          'caseLocation': {
            'region': 'Leeds Combined Court Centre - The Court House, 1 Oxford Row - LS1 3BG',
            'baseLocation': 'Leeds Combined Court Centre - The Court House, 1 Oxford Row - LS1 3BG',
          },
        },
        'respondent1DQWitnesses': {
          'witnessesToAppear': 'Yes',
          'details': [
            {
              'value': {
                'name': 'WitnessFName',
                'firstName': 'WitnessFName',
                'lastName': 'WitnessLName',
                'emailAddress': 'test@test.com',
                'phoneNumber': '09797979797',
                'reasonForWitness': 'TestWitnesses',
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
                'date': '2024-05-10T00:00:00.000Z',
                'fromDate': '2024-05-10T00:00:00.000Z',
                'unavailableDateType': 'SINGLE_DATE',
              },
            },
            {
              'value': {
                'who': 'defendant',
                'date': '2024-05-15T00:00:00.000Z',
                'fromDate': '2024-05-15T00:00:00.000Z',
                'toDate': '2024-05-20T00:00:00.000Z',
                'unavailableDateType': 'DATE_RANGE',
              },
            },
          ],
        },
        'respondent1DQExperts': {
          
        },
      },
    };
  },

  partAdmitWithPartPaymentAsPerPlanClaimantWantsToAcceptRepaymentPlanWithoutFixedCosts: () => {
    return {
      event: 'CLAIMANT_RESPONSE_SPEC',
      caseData: {
        respondent1: {
          type: 'INDIVIDUAL',
          individualTitle: 'Sir',
          individualFirstName: 'John',
          individualLastName: 'Doe',
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
          partyID: '211c047f-9780-4d',
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
        respondToAdmittedClaimOwingAmountPounds: '500',
        respondent1PaymentDateToStringSpec: '01 July 2023',
        respondent1ClaimResponseDocumentSpec: {
          documentName: null,
          documentType: null,
          documentSize: '0',
          createdDatetime: null,
          createdBy: null,
        },
        respondent1GeneratedResponseDocument: {
          documentName: null,
          documentType: null,
          documentSize: '0',
          createdDatetime: null,
          createdBy: null,
        },
        respondent2GeneratedResponseDocument: null,
        applicant1PartAdmitConfirmAmountPaidSpec: null,
        applicant1AcceptAdmitAmountPaidSpec: 'Yes',
        applicant1ProceedWithClaim: null,
        applicant1AcceptFullAdmitPaymentPlanSpec: null,
        applicant1AcceptPartAdmitPaymentPlanSpec: 'Yes',
        applicantDefenceResponseDocumentAndDQFlag: null,
        showConditionFlags: null,
        applicant1ProceedWithClaimSpec2v1: null,
        responseClaimTrack: 'SMALL_CLAIM',
        allocatedTrack: null,
        claimType: null,
        defenceRouteRequired: null,
        respondentResponseIsSame: null,
        defendantSingleResponseToBothClaimants: null,
        respondent1ClaimResponseTypeForSpec: 'PART_ADMISSION',
        defenceAdmitPartPaymentTimeRouteRequired: 'SUGGESTION_OF_REPAYMENT_PLAN',
        showResponseOneVOneFlag: 'ONE_V_ONE_PART_ADMIT_PAY_INSTALMENT',
        ccjPaymentPaidSomeOption: 'Yes',
        ccjPaymentPaidSomeAmount: '20000',
        ccjJudgmentFixedCostOption: 'No',
        ccjJudgmentSummarySubtotalAmount: '580.00',
        ccjJudgmentStatement: 'The judgment will order the defendant to pay £580.00 , including the claim fee and interest, if applicable, as shown:',
        ccjJudgmentAmountClaimAmount: '500',
        claimInterest: 'No',
        ccjJudgmentAmountInterestToDate: '0',
        ccjJudgmentFixedCostAmount: '0',
        ccjJudgmentAmountClaimFee: '80.00',
        ccjJudgmentAmountSubtotal: null,
        ccjPaymentPaidSomeAmountInPounds: '200.00',
        ccjJudgmentTotalStillOwed: '380.00',
      },
    };
  },
};