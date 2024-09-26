module.exports = {
  admitAllPayImmediateWithIndividual: (totalClaimAmount) => {
    return {
      event: 'DEFENDANT_RESPONSE_CUI',
      caseDataUpdate: {
        respondent1ClaimResponseTypeForSpec: 'FULL_ADMISSION',
        defenceAdmitPartPaymentTimeRouteRequired: 'IMMEDIATELY',
        respondToClaimAdmitPartLRspec: {
          whenWillThisAmountBePaid: '2024-03-06T00:00:00.000Z',
        },
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
          respondent1DQExtraDetails: {
            whyPhoneOrVideoHearing: '',
            determinationWithoutHearingReason: '',
            considerClaimantDocumentsDetails: '',
            respondent1DQLiPExpert: {
              expertCanStillExamineDetails: '',
            },
          },
          respondent1DQHearingSupportLip: {},
          respondent1ResponseLanguage: 'ENGLISH',
        },
        respondent1LiPFinancialDetails: {},
        specClaimResponseTimelineList: 'MANUAL',
        specResponseTimelineOfEvents: [],
        respondent1DQHomeDetails: {},
        respondent1PartnerAndDependent: {
          howManyChildrenByAgeGroup: {},
        },
        specDefendant1SelfEmploymentDetails: {},
        respondToClaimAdmitPartUnemployedLRspec: {},
        respondent1DQLanguage: {},
        respondent1DQVulnerabilityQuestions: {},
        respondent1DQRequestedCourt: {
          otherPartyPreferredSite: '',
          responseCourtCode: '',
          responseCourtLocations: [],
          caseLocation: {},
        },
        respondent1DQWitnesses: {},
        respondent1DQHearingSmallClaim: {},
        respondent1DQExperts: {},
      },
    };
  },
  admitAllPayBySetDateWithIndividual: (totalClaimAmount) => {
    return {
      event: 'DEFENDANT_RESPONSE_CUI',
      caseDataUpdate: {
        respondent1ClaimResponseTypeForSpec: 'FULL_ADMISSION',
        defenceAdmitPartPaymentTimeRouteRequired: 'BY_SET_DATE',
        respondToClaimAdmitPartLRspec: {
          whenWillThisAmountBePaid: '2025-10-01T00:00:00.000Z',
        },
        responseClaimMediationSpecRequired: 'No',
        specAoSApplicantCorrespondenceAddressRequired: 'Yes',
        totalClaimAmount: totalClaimAmount,
        respondent1: {
          individualDateOfBirth: '1990-01-01',
          individualFirstName: 'John',
          individualLastName: 'Doe',
          individualTitle: 'Sir',
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
          type: 'INDIVIDUAL',
        },
        respondent1LiPResponse: {
          respondent1DQExtraDetails: {
            whyPhoneOrVideoHearing: '',
            determinationWithoutHearingReason: '',
            considerClaimantDocumentsDetails: '',
            respondent1DQLiPExpert: {
              expertCanStillExamineDetails: '',
            },
          },
          respondent1DQHearingSupportLip: {},
          respondent1ResponseLanguage: 'ENGLISH',
        },
        respondent1LiPFinancialDetails: {
          partnerPensionLiP: 'No',
          childrenEducationLiP: '1',
        },
        specClaimResponseTimelineList: 'MANUAL',
        specResponseTimelineOfEvents: [],
        respondent1BankAccountList: [
          {
            value: {
              accountType: 'SAVINGS',
              jointAccount: 'Yes',
              balance: '4000',
            },
          },
        ],
        disabilityPremiumPayments: 'No',
        respondent1DQHomeDetails: {
          type: 'PRIVATE_RENTAL',
          typeOtherDetails: '',
        },
        respondent1PartnerAndDependent: {
          liveWithPartnerRequired: 'Yes',
          partnerAgedOver: 'Yes',
          haveAnyChildrenRequired: 'Yes',
          howManyChildrenByAgeGroup: {
            numberOfUnderEleven: '1',
            numberOfElevenToFifteen: '1',
            numberOfSixteenToNineteen: '1',
          },
          receiveDisabilityPayments: 'No',
          supportedAnyoneFinancialRequired: 'Yes',
          supportPeopleNumber: '2',
          supportPeopleDetails: 'Parents',
        },
        defenceAdmitPartEmploymentTypeRequired: 'Yes',
        respondToClaimAdmitPartEmploymentTypeLRspec: ['EMPLOYED'],
        responseClaimAdmitPartEmployer: {
          employerDetails: [
            {
              value: {
                employerName: 'ABC Ltd',
                jobTitle: 'Builder',
              },
            },
          ],
        },
        specDefendant1SelfEmploymentDetails: {},
        respondToClaimAdmitPartUnemployedLRspec: {},
        respondent1CourtOrderPaymentOption: 'No',
        respondent1CourtOrderDetails: [],
        respondent1LoanCreditOption: 'Yes',
        respondent1LoanCreditDetails: [
          {
            value: {
              loanCardDebtDetail: 'HSBC Credit card',
              totalOwed: '300000',
              monthlyPayment: '30000',
            },
          },
        ],
        responseToClaimAdmitPartWhyNotPayLRspec: 'test',
        respondent1DQCarerAllowanceCreditFullAdmission: 'Yes',
        specDefendant1Debts: {
          debtDetails: [
            {
              value: {
                debtType: 'MORTGAGE',
                paymentAmount: '20000',
                paymentFrequency: 'ONCE_ONE_MONTH',
              },
            },
          ],
        },
        respondent1DQRecurringIncomeFA: [
          {
            value: {
              type: 'JOB',
              amount: '300000',
              frequency: 'ONCE_ONE_MONTH',
            },
          },
          {
            value: {
              type: 'INCOME_SUPPORT',
              amount: '100000',
              frequency: 'ONCE_ONE_MONTH',
            },
          },
        ],
        respondent1DQRecurringExpensesFA: [
          {
            value: {
              type: 'RENT',
              amount: '200000',
              frequency: 'ONCE_ONE_MONTH',
            },
          },
          {
            value: {
              type: 'COUNCIL_TAX',
              amount: '20000',
              frequency: 'ONCE_ONE_MONTH',
            },
          },
          {
            value: {
              type: 'WATER',
              amount: '2000',
              frequency: 'ONCE_TWO_WEEKS',
            },
          },
          {
            value: {
              type: 'TV',
              amount: '4000',
              frequency: 'ONCE_ONE_MONTH',
            },
          },
        ],
        respondent1DQLanguage: {},
        respondent1DQVulnerabilityQuestions: {},
        respondent1DQRequestedCourt: {
          otherPartyPreferredSite: '',
          responseCourtCode: '',
          responseCourtLocations: [],
          caseLocation: {},
        },
        respondent1DQWitnesses: {},
        respondent1DQHearingSmallClaim: {},
        respondent1DQExperts: {},
      },
    };
  },
  admitAllPayByInstallmentWithIndividual: (totalClaimAmount) => {
    return {
      event: 'DEFENDANT_RESPONSE_CUI',
      caseDataUpdate: {
        respondent1ClaimResponseTypeForSpec: 'FULL_ADMISSION',
        defenceAdmitPartPaymentTimeRouteRequired: 'SUGGESTION_OF_REPAYMENT_PLAN',
        respondent1RepaymentPlan: {
          paymentAmount: '10000',
          repaymentFrequency: 'ONCE_ONE_MONTH',
          firstRepaymentDate: '2025-10-01T00:00:00.000Z',
        },
        respondToClaimAdmitPartLRspec: {},
        responseClaimMediationSpecRequired: 'No',
        specAoSApplicantCorrespondenceAddressRequired: 'Yes',
        totalClaimAmount: totalClaimAmount,
        respondent1: {
          individualDateOfBirth: '1990-01-01',
          individualFirstName: 'John',
          individualLastName: 'Doe',
          individualTitle: 'Sir',
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
          type: 'INDIVIDUAL',
        },
        respondent1LiPResponse: {
          respondent1DQExtraDetails: {
            whyPhoneOrVideoHearing: '',
            determinationWithoutHearingReason: '',
            considerClaimantDocumentsDetails: '',
            respondent1DQLiPExpert: {
              expertCanStillExamineDetails: '',
            },
          },
          respondent1DQHearingSupportLip: {},
          respondent1ResponseLanguage: 'ENGLISH',
        },
        respondent1LiPFinancialDetails: {
          partnerPensionLiP: 'No',
        },
        specClaimResponseTimelineList: 'MANUAL',
        specResponseTimelineOfEvents: [],
        disabilityPremiumPayments: 'No',
        respondent1DQHomeDetails: {
          type: 'ASSOCIATION_HOME',
          typeOtherDetails: '',
        },
        respondent1PartnerAndDependent: {
          liveWithPartnerRequired: 'Yes',
          partnerAgedOver: 'Yes',
          haveAnyChildrenRequired: 'No',
          howManyChildrenByAgeGroup: {},
          supportedAnyoneFinancialRequired: 'No',
        },
        defenceAdmitPartEmploymentTypeRequired: 'No',
        specDefendant1SelfEmploymentDetails: {},
        respondToClaimAdmitPartUnemployedLRspec: {
          unemployedComplexTypeRequired: 'RETIRED',
          lengthOfUnemployment: {
            numberOfYearsInUnemployment: null,
            numberOfMonthsInUnemployment: null,
          },
          otherUnemployment: '',
        },
        respondent1CourtOrderPaymentOption: 'No',
        respondent1CourtOrderDetails: [],
        respondent1LoanCreditOption: 'No',
        responseToClaimAdmitPartWhyNotPayLRspec: 'test',
        respondent1DQCarerAllowanceCreditFullAdmission: 'No',
        respondent1DQRecurringIncomeFA: [
          {
            value: {
              type: 'PENSION',
              amount: '300000',
              frequency: 'ONCE_ONE_MONTH',
            },
          },
        ],
        respondent1DQRecurringExpensesFA: [
          {
            value: {
              type: 'RENT',
              amount: '50000',
              frequency: 'ONCE_ONE_WEEK',
            },
          },
        ],
        respondent1DQLanguage: {},
        respondent1DQVulnerabilityQuestions: {},
        respondent1DQRequestedCourt: {
          otherPartyPreferredSite: '',
          responseCourtCode: '',
          responseCourtLocations: [],
          caseLocation: {},
        },
        respondent1DQWitnesses: {},
        respondent1DQHearingSmallClaim: {},
        respondent1DQExperts: {},
      },
    };
  },
};
