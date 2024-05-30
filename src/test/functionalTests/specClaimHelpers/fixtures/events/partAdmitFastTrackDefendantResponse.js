module.exports = {
  partAdmitAmountPaidWithIndividual: () => {
    return {
      'event': 'DEFENDANT_RESPONSE_CUI',
      'caseDataUpdate': {
        'respondent1ClaimResponseTypeForSpec': 'PART_ADMISSION',
        'defenceAdmitPartPaymentTimeRouteRequired': 'IMMEDIATELY',
        'respondToClaimAdmitPartLRspec': {

        },
        'responseClaimMediationSpecRequired': 'No',
        'specAoSApplicantCorrespondenceAddressRequired': 'Yes',
        'totalClaimAmount': 15000,
        'respondent1': {
          'individualDateOfBirth': '1990-01-01',
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
          'respondent1DQExtraDetails': {
            'wantPhoneOrVideoHearing': 'Yes',
            'whyPhoneOrVideoHearing': 'fdsafaf',
            'giveEvidenceYourSelf': 'Yes',
            'triedToSettle': 'No',
            'determinationWithoutHearingReason': '',
            'requestExtra4weeks': 'Yes',
            'considerClaimantDocuments': 'No',
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
        'respondToAdmittedClaim': {
          'howMuchWasPaid': 34500,
          'howWasThisAmountPaid': 'OTHER',
          'whenWasThisAmountPaid': '2000-02-02T00:00:00.000Z',
          'howWasThisAmountPaidOther': 'fsdafa',
        },
        'specDefenceAdmittedRequired': 'Yes',
        'detailsOfWhyDoesYouDisputeTheClaim': 'ou disagree with the claim amount?\r\nThe total amount ',
        'specClaimResponseTimelineList': 'MANUAL',
        'specResponseTimelineOfEvents': [
          {
            'value': {
              'timelineDate': '1879-08-08T00:00:00.000Z',
              'timelineDescription': 'fdsafaf',
            },
          },
        ],
        'specResponselistYourEvidenceList': [
          {
            'id': '0',
            'value': {
              'evidenceType': 'LETTERS_EMAILS_AND_OTHER_CORRESPONDENCE',
              'lettersEmailsAndOtherCorrespondenceEvidence': ', a letter from the other party.',
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
        'respondent1DQHearingFastClaim': {
          'hearingLengthHours': '3',
          'hearingLengthDays': '1',
          'unavailableDatesRequired': 'Yes',
          'unavailableDates': [
            {
              'value': {
                'date': '2024-12-06T00:00:00.000Z',
                'fromDate': '2024-12-06T00:00:00.000Z',
                'unavailableDateType': 'SINGLE_DATE',
              },
            },
          ],
        },
        'respondent1DQExperts': {
          'expertRequired': 'Yes',
          'details': [
            {
              'value': {
                'name': 'Mounika ineni',
                'firstName': 'Mounika',
                'lastName': 'ineni',
                'phoneNumber': '',
                'emailAddress': 'eni@gmail.com',
                'whyRequired': 'Tell us why you need this expert',
                'fieldOfExpertise': 'cases',
                'estimatedCost': 3400,
              },
            },
          ],
          'expertReportsSent': 'NO',
          'jointExpertSuitable': 'No',
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
        'totalClaimAmount': 15000,
        'respondent1': {
          'individualDateOfBirth': '1890-06-06',
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
          'respondent1DQExtraDetails': {
            'wantPhoneOrVideoHearing': 'No',
            'whyPhoneOrVideoHearing': '',
            'giveEvidenceYourSelf': 'No',
            'triedToSettle': 'No',
            'determinationWithoutHearingReason': '',
            'requestExtra4weeks': 'No',
            'considerClaimantDocuments': 'No',
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
        'respondToAdmittedClaimOwingAmountPounds': '569',
        'respondToAdmittedClaimOwingAmount': '56900',
        'detailsOfWhyDoesYouDisputeTheClaim': 'disagree with the claim amount',
        'specClaimResponseTimelineList': 'MANUAL',
        'specResponseTimelineOfEvents': [

        ],
        'specResponselistYourEvidenceList': [
          {
            'id': '0',
            'value': {
              'evidenceType': 'CONTRACTS_AND_AGREEMENTS',
              'contractAndAgreementsEvidence': ' signed contract.',
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

  partAdmitWithPartPaymentOnSpecificDateWithIndividual: () => {
    return {
      'event': 'DEFENDANT_RESPONSE_CUI',
      'caseDataUpdate': {
        'respondent1ClaimResponseTypeForSpec': 'PART_ADMISSION',
        'defenceAdmitPartPaymentTimeRouteRequired': 'BY_SET_DATE',
        'respondToClaimAdmitPartLRspec': {
          'whenWillThisAmountBePaid': '2045-09-09T00:00:00.000Z',
        },
        'responseClaimMediationSpecRequired': 'No',
        'specAoSApplicantCorrespondenceAddressRequired': 'Yes',
        'totalClaimAmount': 15000,
        'respondent1': {
          'individualDateOfBirth': '1990-03-02',
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
          'respondent1DQExtraDetails': {
            'wantPhoneOrVideoHearing': 'No',
            'whyPhoneOrVideoHearing': '',
            'giveEvidenceYourSelf': 'No',
            'triedToSettle': 'Yes',
            'determinationWithoutHearingReason': '',
            'requestExtra4weeks': 'Yes',
            'considerClaimantDocuments': 'No',
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
          'partnerPensionLiP': 'Yes',
          'partnerDisabilityLiP': 'Yes',
          'partnerSevereDisabilityLiP': 'Yes',
          'childrenEducationLiP': '1',
        },
        'specDefenceAdmittedRequired': 'No',
        'respondToAdmittedClaimOwingAmountPounds': '3456',
        'respondToAdmittedClaimOwingAmount': '345600',
        'detailsOfWhyDoesYouDisputeTheClaim': 'Test reason - disagree with the claim amount?\r\n',
        'specClaimResponseTimelineList': 'MANUAL',
        'specResponseTimelineOfEvents': [

        ],
        'specResponselistYourEvidenceList': [

        ],
        'respondent1BankAccountList': [
          {
            'value': {
              'accountType': 'CURRENT',
              'jointAccount': 'Yes',
              'balance': 230000,
            },
          },
        ],
        'disabilityPremiumPayments': 'Yes',
        'severeDisabilityPremiumPayments': 'Yes',
        'respondent1DQHomeDetails': {
          'type': 'OWNED_HOME',
          'typeOtherDetails': '',
        },
        'respondent1PartnerAndDependent': {
          'liveWithPartnerRequired': 'Yes',
          'partnerAgedOver': 'Yes',
          'haveAnyChildrenRequired': 'Yes',
          'howManyChildrenByAgeGroup': {
            'numberOfUnderEleven': '4',
            'numberOfElevenToFifteen': '4',
            'numberOfSixteenToNineteen': '1',
          },
          'supportedAnyoneFinancialRequired': 'Yes',
          'supportPeopleNumber': '1',
          'supportPeopleDetails': 'Give details',
        },
        'defenceAdmitPartEmploymentTypeRequired': 'Yes',
        'respondToClaimAdmitPartEmploymentTypeLRspec': [
          'SELF',
        ],
        'specDefendant1SelfEmploymentDetails': {
          'jobTitle': 'director',
          'annualTurnover': 4500000,
          'isBehindOnTaxPayment': 'Yes',
          'amountOwed': 34500,
          'reason': 'tax pay',
        },
        'respondToClaimAdmitPartUnemployedLRspec': {

        },
        'respondent1CourtOrderPaymentOption': 'No',
        'respondent1CourtOrderDetails': [

        ],
        'respondent1LoanCreditOption': 'Yes',
        'respondent1LoanCreditDetails': [
          {
            'value': {
              'loanCardDebtDetail': 'hasb',
              'totalOwed': 3400,
              'monthlyPayment': 100,
            },
          },
        ],
        'responseToClaimAdmitPartWhyNotPayLRspec': 'Briefly explain why you can\'t pay immediately',
        'specDefendant1Debts': {
          'debtDetails': [
            {
              'value': {
                'debtType': 'MAINTENANCE_PAYMENTS',
                'paymentAmount': 4500,
                'paymentFrequency': 'ONCE_ONE_WEEK',
              },
            },
          ],
        },
        'respondent1DQRecurringIncome': [
          {
            'value': {
              'type': 'JOB',
              'amount': 100,
              'frequency': 'ONCE_ONE_WEEK',
            },
          },
          {
            'value': {
              'type': 'UNIVERSAL_CREDIT',
              'amount': 100,
              'frequency': 'ONCE_ONE_WEEK',
            },
          },
          {
            'value': {
              'type': 'JOBSEEKER_ALLOWANCE_INCOME',
              'amount': 100,
              'frequency': 'ONCE_ONE_WEEK',
            },
          },
          {
            'value': {
              'type': 'JOBSEEKER_ALLOWANCE_CONTRIBUTION',
              'amount': 100,
              'frequency': 'ONCE_ONE_WEEK',
            },
          },
          {
            'value': {
              'type': 'INCOME_SUPPORT',
              'amount': 100,
              'frequency': 'ONCE_TWO_WEEKS',
            },
          },
          {
            'value': {
              'type': 'WORKING_TAX_CREDIT',
              'amount': 100,
              'frequency': 'ONCE_TWO_WEEKS',
            },
          },
          {
            'value': {
              'type': 'CHILD_TAX',
              'amount': 100,
              'frequency': 'ONCE_FOUR_WEEKS',
            },
          },
          {
            'value': {
              'type': 'CHILD_BENEFIT',
              'amount': 100,
              'frequency': 'ONCE_FOUR_WEEKS',
            },
          },
          {
            'value': {
              'type': 'COUNCIL_TAX_SUPPORT',
              'amount': 100,
              'frequency': 'ONCE_FOUR_WEEKS',
            },
          },
          {
            'value': {
              'type': 'PENSION',
              'amount': 100,
              'frequency': 'ONCE_ONE_MONTH',
            },
          },
          null,
        ],
        'respondent1DQRecurringExpenses': [
          {
            'value': {
              'type': 'MORTGAGE',
              'amount': 100,
              'frequency': 'ONCE_ONE_WEEK',
            },
          },
          {
            'value': {
              'type': 'RENT',
              'amount': 400,
              'frequency': 'ONCE_ONE_WEEK',
            },
          },
          {
            'value': {
              'type': 'COUNCIL_TAX',
              'amount': 100,
              'frequency': 'ONCE_ONE_MONTH',
            },
          },
          {
            'value': {
              'type': 'GAS',
              'amount': 4500,
              'frequency': 'ONCE_TWO_WEEKS',
            },
          },
          {
            'value': {
              'type': 'ELECTRICITY',
              'amount': 400,
              'frequency': 'ONCE_ONE_MONTH',
            },
          },
          {
            'value': {
              'type': 'WATER',
              'amount': 500,
              'frequency': 'ONCE_ONE_MONTH',
            },
          },
          {
            'value': {
              'type': 'TRAVEL',
              'amount': 100,
              'frequency': 'ONCE_ONE_MONTH',
            },
          },
          {
            'value': {
              'type': 'SCHOOL',
              'amount': 300,
              'frequency': 'ONCE_ONE_MONTH',
            },
          },
          {
            'value': {
              'type': 'FOOD',
              'amount': 100,
              'frequency': 'ONCE_ONE_MONTH',
            },
          },
          {
            'value': {
              'type': 'TV',
              'amount': 200,
              'frequency': 'ONCE_ONE_MONTH',
            },
          },
          {
            'value': {
              'type': 'HIRE_PURCHASE',
              'amount': 100,
              'frequency': 'ONCE_ONE_MONTH',
            },
          },
          {
            'value': {
              'type': 'MOBILE_PHONE',
              'amount': 100,
              'frequency': 'ONCE_ONE_MONTH',
            },
          },
          {
            'value': {
              'type': 'MAINTENANCE',
              'amount': 100,
              'frequency': 'ONCE_ONE_MONTH',
            },
          },
          null,
        ],
        'respondent1DQLanguage': {
          'court': 'WELSH',
          'documents': 'BOTH',
        },
        'respondent1DQVulnerabilityQuestions': {
          'vulnerabilityAdjustmentsRequired': 'Yes',
          'vulnerabilityAdjustments': 'ell us who is vulnerable and what support they need',
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

  partAdmitWithPartPaymentAsPerInstallmentPlanWithIndividual: () => {
    return {
      'event': 'DEFENDANT_RESPONSE_CUI',
      'caseDataUpdate': {
        'respondent1ClaimResponseTypeForSpec': 'PART_ADMISSION',
        'defenceAdmitPartPaymentTimeRouteRequired': 'SUGGESTION_OF_REPAYMENT_PLAN',
        'respondent1RepaymentPlan': {
          'paymentAmount': 300,
          'repaymentFrequency': 'ONCE_ONE_WEEK',
          'firstRepaymentDate': '2045-08-08T00:00:00.000Z',
        },
        'respondToClaimAdmitPartLRspec': {

        },
        'responseClaimMediationSpecRequired': 'No',
        'specAoSApplicantCorrespondenceAddressRequired': 'Yes',
        'totalClaimAmount': 15000,
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
            'giveEvidenceYourSelf': 'No',
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
            'supportRequirementLip': 'No',
          },
          'respondent1ResponseLanguage': 'ENGLISH',
        },
        'respondent1LiPFinancialDetails': {

        },
        'specDefenceAdmittedRequired': 'No',
        'respondToAdmittedClaimOwingAmountPounds': '1236',
        'respondToAdmittedClaimOwingAmount': '123600',
        'detailsOfWhyDoesYouDisputeTheClaim': 'disagree with the claim amount',
        'specClaimResponseTimelineList': 'MANUAL',
        'specResponseTimelineOfEvents': [

        ],
        'respondent1BankAccountList': [
          {
            'value': {
              'accountType': 'CURRENT',
              'jointAccount': 'Yes',
              'balance': 56,
            },
          },
        ],
        'disabilityPremiumPayments': 'Yes',
        'severeDisabilityPremiumPayments': 'No',
        'respondent1DQHomeDetails': {
          'type': 'ASSOCIATION_HOME',
          'typeOtherDetails': '',
        },
        'respondent1PartnerAndDependent': {
          'liveWithPartnerRequired': 'No',
          'haveAnyChildrenRequired': 'No',
          'howManyChildrenByAgeGroup': {

          },
          'supportedAnyoneFinancialRequired': 'No',
        },
        'defenceAdmitPartEmploymentTypeRequired': 'No',
        'specDefendant1SelfEmploymentDetails': {

        },
        'respondToClaimAdmitPartUnemployedLRspec': {
          'unemployedComplexTypeRequired': 'RETIRED',
          'lengthOfUnemployment': {
            'numberOfYearsInUnemployment': null,
            'numberOfMonthsInUnemployment': null,
          },
          'otherUnemployment': '',
        },
        'respondent1CourtOrderPaymentOption': 'No',
        'respondent1CourtOrderDetails': [

        ],
        'respondent1LoanCreditOption': 'No',
        'responseToClaimAdmitPartWhyNotPayLRspec': 'dasf',
        'respondent1DQCarerAllowanceCredit': 'No',
        'respondent1DQRecurringIncome': [
          {
            'value': {
              'type': 'PENSION',
              'amount': 5670,
              'frequency': 'ONCE_ONE_WEEK',
            },
          },
        ],
        'respondent1DQRecurringExpenses': [
          {
            'value': {
              'type': 'OTHER',
              'amount': 2300,
              'frequency': 'ONCE_FOUR_WEEKS',
              'typeOtherDetails': 'dsaf',
            },
          },
        ],
        'respondent1DQLanguage': {
          'court': 'ENGLISH',
          'documents': 'BOTH',
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
};
