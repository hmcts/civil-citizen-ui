const {date, element} = require('../../api/dataHelper');

const responseData = {
  userInput: {
    ResponseConfirmNameAddress: {
      specAoSApplicantCorrespondenceAddressRequired: 'Yes',
    },
    ResponseConfirmDetails: {
      specAoSRespondentCorrespondenceAddressRequired: 'Yes',
    },
  },
};

module.exports = {
  citizenDefendantResponseCarmCompany: () => {
    return {
      event: 'DEFENDANT_RESPONSE_CUI',
      caseDataUpdate: {
        respondent1ClaimResponseTypeForSpec: 'FULL_DEFENCE',
        defenceAdmitPartPaymentTimeRouteRequired: 'IMMEDIATELY',
        respondToClaimAdmitPartLRspec: {},
        responseClaimMediationSpecRequired: 'No',
        specAoSApplicantCorrespondenceAddressRequired: 'Yes',
        totalClaimAmount: 1500,
        respondent1: {
          companyName: 'Test Company Defendant',
          partyEmail: 'civilmoneyclaimsdemo@gmail.com',
          partyPhone: '07800000000',
          primaryAddress: {
            AddressLine1:'TestAddressLine1',
            AddressLine2:'TestAddressLine2',
            AddressLine3:'TestAddressLine3',
            PostCode:'IG61JD',
            PostTown:'TestCity',
          },
          type: 'COMPANY',
        },
        respondent1LiPResponse: {
          timelineComment: 'Add any comments about their timeline (optional)',
          evidenceComment: 'disagree',
          respondent1DQExtraDetails: {
            wantPhoneOrVideoHearing: 'Yes',
            whyPhoneOrVideoHearing: 'video',
            giveEvidenceYourSelf: 'Yes',
            determinationWithoutHearingRequired: 'Yes',
            determinationWithoutHearingReason: '',
            considerClaimantDocumentsDetails: '',
            respondent1DQLiPExpert: {
              caseNeedsAnExpert: 'No',
              expertCanStillExamineDetails: '',
            },
          },
          respondent1DQHearingSupportLip: {
            supportRequirementLip: 'Yes',
            requirementsLip: [
              {
                value: {
                  name: 'Whit Nessie',
                  requirements: [
                    'DISABLED_ACCESS',
                    'HEARING_LOOPS',
                  ],
                  signLanguageRequired: '',
                  languageToBeInterpreted: '',
                  otherSupport: '',
                },
              },
            ],
          },
          respondent1LiPContactPerson: 'contact person',
          respondent1ResponseLanguage: 'ENGLISH',
        },
        respondent1LiPResponseCarm: {
          isMediationContactNameCorrect: 'No',
          alternativeMediationContactPerson: 'new defendant cp',
          isMediationEmailCorrect: 'No',
          alternativeMediationEmail: 'defendantmediation@email.com',
          isMediationPhoneCorrect: 'No',
          alternativeMediationTelephone: '07744444444',
          hasUnavailabilityNextThreeMonths: 'Yes',
          unavailableDatesForMediation: [
            {
              value: {
                who: 'defendant',
                date: date(30),
                fromDate: date(30),
                unavailableDateType: 'SINGLE_DATE',
              },
            },
            {
              value: {
                who: 'defendant',
                date: date(40),
                fromDate: date(40),
                toDate: date(45),
                unavailableDateType: 'DATE_RANGE',
              },
            },
          ],
        },
        respondent1LiPFinancialDetails: {},
        detailsOfWhyDoesYouDisputeTheClaim: 'reasons',
        specClaimResponseTimelineList: 'MANUAL',
        specResponseTimelineOfEvents: [
          {
            value: {
              timelineDate: date(-100),
              timelineDescription: 'asd',
            },
          },
        ],
        specResponselistYourEvidenceList: [
          {
            id: '0',
            value: {
              evidenceType: 'PHOTO_EVIDENCE',
              photoEvidence: '',
            },
          },
        ],
        defenceRouteRequired: 'HAS_PAID_THE_AMOUNT_CLAIMED',
        respondToClaim: {
          howMuchWasPaid: 95000,
          howWasThisAmountPaid: 'OTHER',
          whenWasThisAmountPaid: '2000-01-01T00:00:00.000Z',
          howWasThisAmountPaidOther: 'card',
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
          vulnerabilityAdjustmentsRequired: 'Yes',
          vulnerabilityAdjustments: 'vulnerable',
        },
        respondent1DQRequestedCourt: {
          requestHearingAtSpecificCourt: 'Yes',
          otherPartyPreferredSite: '',
          responseCourtCode: '',
          reasonForHearingAtSpecificCourt: 'court',
          responseCourtLocations: [],
          caseLocation: {
            region: 'Clerkenwell and Shoreditch County Court and Family Court - 29-41 Gee Street - EC1V 3RE',
            baseLocation: 'Clerkenwell and Shoreditch County Court and Family Court - 29-41 Gee Street - EC1V 3RE',
          },
        },
        respondent1DQWitnesses: {
          witnessesToAppear: 'Yes',
          details: [
            {
              value: {
                name: 'Whit',
                firstName: 'Whit',
                lastName: 'Nessie',
                emailAddress: '',
                phoneNumber: '',
                reasonForWitness: 'asd',
              },
            },
          ],
        },
        respondent1DQHearingSmallClaim: {
          unavailableDatesRequired: 'Yes',
          smallClaimUnavailableDate: [
            {
              value: {
                who: 'defendant',
                date: date(30),
                fromDate: date(30),
                unavailableDateType: 'SINGLE_DATE',
              },
            },
            {
              value: {
                who: 'defendant',
                date: date(40),
                fromDate: date(40),
                toDate: date(45),
                unavailableDateType: 'DATE_RANGE',
              },
            },
          ],
        },
        respondent1DQExperts: {},
      },
    };
  },

  citizenDefendantResponseCarmSoleTrader: () => {
    return {
      event: 'DEFENDANT_RESPONSE_CUI',
      caseDataUpdate: {
        respondent1ClaimResponseTypeForSpec: 'FULL_DEFENCE',
        defenceAdmitPartPaymentTimeRouteRequired: 'IMMEDIATELY',
        respondToClaimAdmitPartLRspec: {},
        responseClaimMediationSpecRequired: 'No',
        specAoSApplicantCorrespondenceAddressRequired: 'Yes',
        totalClaimAmount: 1500,
        respondent1: {
          companyName: undefined,
          individualDateOfBirth: '1993-08-28',
          individualFirstName: 'defendant',
          individualLastName: 'person',
          individualTitle: 'mr',
          organisationName: undefined,
          partyEmail: 'civilmoneyclaimsdemo@gmail.com',
          partyPhone: '07800000000',
          primaryAddress: {
            AddressLine1: '123',
            AddressLine2: 'Claim Road',
            AddressLine3: '',
            PostCode: 'L7 2PZ',
            PostTown: 'Liverpool',
          },
          soleTraderDateOfBirth: '1993-08-28',
          soleTraderFirstName: 'person',
          soleTraderLastName: 'defendant',
          soleTraderTitle: 'mr',
          soleTraderTradingAs: 'Sole Trader Business',
          type: 'SOLE_TRADER',
        },
        respondent1LiPResponse: {
          timelineComment: 'Add any comments about their timeline (optional)',
          evidenceComment: 'disagree',
          respondent1DQExtraDetails: {
            wantPhoneOrVideoHearing: 'Yes',
            whyPhoneOrVideoHearing: 'video',
            giveEvidenceYourSelf: 'Yes',
            determinationWithoutHearingRequired: 'Yes',
            determinationWithoutHearingReason: '',
            considerClaimantDocumentsDetails: '',
            respondent1DQLiPExpert: {
              caseNeedsAnExpert: 'No',
              expertCanStillExamineDetails: '',
            },
          },
          respondent1DQHearingSupportLip: {
            supportRequirementLip: 'Yes',
            requirementsLip: [
              {
                value: {
                  name: 'Whit Nessie',
                  requirements: [
                    'DISABLED_ACCESS',
                    'HEARING_LOOPS',
                  ],
                  signLanguageRequired: '',
                  languageToBeInterpreted: '',
                  otherSupport: '',
                },
              },
            ],
          },
          respondent1LiPContactPerson: 'contact person',
          respondent1ResponseLanguage: 'ENGLISH',
        },
        respondent1LiPResponseCarm: {
          isMediationContactNameCorrect: 'No',
          alternativeMediationContactPerson: 'new defendant cp',
          isMediationEmailCorrect: 'No',
          alternativeMediationEmail: 'defendantmediation@email.com',
          isMediationPhoneCorrect: 'No',
          alternativeMediationTelephone: '07744444444',
          hasUnavailabilityNextThreeMonths: 'Yes',
          unavailableDatesForMediation: [
            {
              value: {
                who: 'defendant',
                date: date(30),
                fromDate: date(30),
                unavailableDateType: 'SINGLE_DATE',
              },
            },
            {
              value: {
                who: 'defendant',
                date: date(40),
                fromDate: date(40),
                toDate: date(45),
                unavailableDateType: 'DATE_RANGE',
              },
            },
          ],
        },
        respondent1LiPFinancialDetails: {},
        detailsOfWhyDoesYouDisputeTheClaim: 'reasons',
        specClaimResponseTimelineList: 'MANUAL',
        specResponseTimelineOfEvents: [
          {
            value: {
              timelineDate: date(-100),
              timelineDescription: 'asd',
            },
          },
        ],
        specResponselistYourEvidenceList: [
          {
            id: '0',
            value: {
              evidenceType: 'PHOTO_EVIDENCE',
              photoEvidence: '',
            },
          },
        ],
        defenceRouteRequired: 'HAS_PAID_THE_AMOUNT_CLAIMED',
        respondToClaim: {
          howMuchWasPaid: 95000,
          howWasThisAmountPaid: 'OTHER',
          whenWasThisAmountPaid: '2000-01-01T00:00:00.000Z',
          howWasThisAmountPaidOther: 'card',
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
          vulnerabilityAdjustmentsRequired: 'Yes',
          vulnerabilityAdjustments: 'vulnerable',
        },
        respondent1DQRequestedCourt: {
          requestHearingAtSpecificCourt: 'Yes',
          otherPartyPreferredSite: '',
          responseCourtCode: '',
          reasonForHearingAtSpecificCourt: 'court',
          responseCourtLocations: [],
          caseLocation: {
            region: 'Clerkenwell and Shoreditch County Court and Family Court - 29-41 Gee Street - EC1V 3RE',
            baseLocation: 'Clerkenwell and Shoreditch County Court and Family Court - 29-41 Gee Street - EC1V 3RE',
          },
        },
        respondent1DQWitnesses: {
          witnessesToAppear: 'Yes',
          details: [
            {
              value: {
                name: 'Whit',
                firstName: 'Whit',
                lastName: 'Nessie',
                emailAddress: '',
                phoneNumber: '',
                reasonForWitness: 'asd',
              },
            },
          ],
        },
        respondent1DQHearingSmallClaim: {
          unavailableDatesRequired: 'Yes',
          smallClaimUnavailableDate: [
            {
              value: {
                who: 'defendant',
                date: date(30),
                fromDate: date(30),
                unavailableDateType: 'SINGLE_DATE',
              },
            },
            {
              value: {
                who: 'defendant',
                date: date(40),
                fromDate: date(40),
                toDate: date(45),
                unavailableDateType: 'DATE_RANGE',
              },
            },
          ],
        },
        respondent1DQExperts: {},
      },
    };
  },

  citizenDefendantResponseCarmOrganisation: () => {
    return {
      event: 'DEFENDANT_RESPONSE_CUI',
      caseDataUpdate: {
        respondent1ClaimResponseTypeForSpec: 'FULL_DEFENCE',
        defenceAdmitPartPaymentTimeRouteRequired: 'IMMEDIATELY',
        respondToClaimAdmitPartLRspec: {},
        responseClaimMediationSpecRequired: 'No',
        specAoSApplicantCorrespondenceAddressRequired: 'Yes',
        totalClaimAmount: 1500,
        respondent1: {
          individualDateOfBirth: null,
          organisationName: 'Test Inc',
          partyEmail: 'civilmoneyclaimsdemo@gmail.com',
          partyPhone: '07711111111',
          primaryAddress: {
            AddressLine1: '1',
            AddressLine2: '',
            AddressLine3: '',
            PostCode: 'E1 6AN',
            PostTown: 'London',
          },
          soleTraderDateOfBirth: null,
          type: 'ORGANISATION',
        },
        respondent1LiPResponse: {
          timelineComment: 'Add any comments about their timeline (optional)',
          evidenceComment: 'disagree',
          respondent1DQExtraDetails: {
            wantPhoneOrVideoHearing: 'Yes',
            whyPhoneOrVideoHearing: 'video',
            giveEvidenceYourSelf: 'Yes',
            determinationWithoutHearingRequired: 'Yes',
            determinationWithoutHearingReason: '',
            considerClaimantDocumentsDetails: '',
            respondent1DQLiPExpert: {
              caseNeedsAnExpert: 'No',
              expertCanStillExamineDetails: '',
            },
          },
          respondent1DQHearingSupportLip: {
            supportRequirementLip: 'Yes',
            requirementsLip: [
              {
                value: {
                  name: 'Whit Nessie',
                  requirements: [
                    'DISABLED_ACCESS',
                    'HEARING_LOOPS',
                  ],
                  signLanguageRequired: '',
                  languageToBeInterpreted: '',
                  otherSupport: '',
                },
              },
            ],
          },
          respondent1LiPContactPerson: 'contact person',
          respondent1ResponseLanguage: 'ENGLISH',
        },
        respondent1LiPResponseCarm: {
          isMediationContactNameCorrect: 'No',
          alternativeMediationContactPerson: 'new defendant cp',
          isMediationEmailCorrect: 'No',
          alternativeMediationEmail: 'defendantmediation@email.com',
          isMediationPhoneCorrect: 'No',
          alternativeMediationTelephone: '07744444444',
          hasUnavailabilityNextThreeMonths: 'Yes',
          unavailableDatesForMediation: [
            {
              value: {
                who: 'defendant',
                date: date(30),
                fromDate: date(30),
                unavailableDateType: 'SINGLE_DATE',
              },
            },
            {
              value: {
                who: 'defendant',
                date: date(40),
                fromDate: date(40),
                toDate: date(45),
                unavailableDateType: 'DATE_RANGE',
              },
            },
          ],
        },
        respondent1LiPFinancialDetails: {},
        detailsOfWhyDoesYouDisputeTheClaim: 'reasons',
        specClaimResponseTimelineList: 'MANUAL',
        specResponseTimelineOfEvents: [
          {
            value: {
              timelineDate: date(-100),
              timelineDescription: 'asd',
            },
          },
        ],
        specResponselistYourEvidenceList: [
          {
            id: '0',
            value: {
              evidenceType: 'PHOTO_EVIDENCE',
              photoEvidence: '',
            },
          },
        ],
        defenceRouteRequired: 'HAS_PAID_THE_AMOUNT_CLAIMED',
        respondToClaim: {
          howMuchWasPaid: 95000,
          howWasThisAmountPaid: 'OTHER',
          whenWasThisAmountPaid: '2000-01-01T00:00:00.000Z',
          howWasThisAmountPaidOther: 'card',
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
          vulnerabilityAdjustmentsRequired: 'Yes',
          vulnerabilityAdjustments: 'vulnerable',
        },
        respondent1DQRequestedCourt: {
          requestHearingAtSpecificCourt: 'Yes',
          otherPartyPreferredSite: '',
          responseCourtCode: '',
          reasonForHearingAtSpecificCourt: 'court',
          responseCourtLocations: [],
          caseLocation: {
            region: 'Clerkenwell and Shoreditch County Court and Family Court - 29-41 Gee Street - EC1V 3RE',
            baseLocation: 'Clerkenwell and Shoreditch County Court and Family Court - 29-41 Gee Street - EC1V 3RE',
          },
        },
        respondent1DQWitnesses: {
          witnessesToAppear: 'Yes',
          details: [
            {
              value: {
                name: 'Whit',
                firstName: 'Whit',
                lastName: 'Nessie',
                emailAddress: '',
                phoneNumber: '',
                reasonForWitness: 'asd',
              },
            },
          ],
        },
        respondent1DQHearingSmallClaim: {
          unavailableDatesRequired: 'Yes',
          smallClaimUnavailableDate: [
            {
              value: {
                who: 'defendant',
                date: date(30),
                fromDate: date(30),
                unavailableDateType: 'SINGLE_DATE',
              },
            },
            {
              value: {
                who: 'defendant',
                date: date(40),
                fromDate: date(40),
                toDate: date(45),
                unavailableDateType: 'DATE_RANGE',
              },
            },
          ],
        },
        respondent1DQExperts: {},
      },
    };
  },

  LrDefendantResponseCarmCompany: () => {
    responseData.userInput = {
      ...responseData.userInput,
      RespondentResponseTypeSpec: {
        respondent1ClaimResponseTypeForSpec: 'FULL_DEFENCE',
      },
      defenceRoute: {
        defenceRouteRequired: 'DISPUTES_THE_CLAIM',
      },
      MediationContactInformation:{
        resp1MediationContactInfo: {
          firstName:'John',
          lastName: 'Maverick',
          emailAddress:'john@doemail.com',
          telephoneNumber:'07111111111',
        },
      },
      MediationAvailability: {
        resp1MediationAvailability: {
          isMediationUnavailablityExists: 'Yes',
          unavailableDatesForMediation: [
            element({
              unavailableDateType: 'SINGLE_DATE',
              date: date(10),
            }),
            element({
              unavailableDateType: 'SINGLE_DATE',
              date: date(55),
            }),
            element({
              fromDate: date(30),
              toDate: date(35),
              unavailableDateType: 'DATE_RANGE',
            }),
            element({
              fromDate: date(40),
              toDate: date(45),
              unavailableDateType: 'DATE_RANGE',
            }),
          ],
        },
      },
      SmallClaimExperts: {
        responseClaimExpertSpecRequired: 'No',
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
      Language: {
        respondent1DQLanguage: {
          evidence: 'ENGLISH',
          court: 'ENGLISH',
          documents: 'ENGLISH',
        },
      },
      SmaillClaimHearing: {
        SmallClaimHearingInterpreterDescription: 'test',
        SmallClaimHearingInterpreterRequired: 'Yes',
        respondent1DQHearingSmallClaim: {
          unavailableDatesRequired: 'No',
        },
      },
      RequestedCourtLocationLRspec: {
        respondToCourtLocation: {
          responseCourtLocations: {
            requestHearingAtSpecificCourt: 'No',
          },
        },
        respondent1DQRemoteHearingLRspec: {
          remoteHearingRequested: 'Yes',
          reasonForRemoteHearing: 'Some reason',
        },
      },
      HearingSupport: {
        respondent1DQHearingSupport: {
          signLanguageRequired: null,
          languageToBeInterpreted: null,
          otherSupport: null,
          requirements: ['DISABLED_ACCESS', 'HEARING_LOOPS'],
        },
        respondent1DQHearing: {
          unavailableDatesRequired: 'No',
        },
      },
      VulnerabilityQuestions: {
        respondent1DQVulnerabilityQuestions: {
          vulnerabilityAdjustmentsRequired: 'Yes',
          vulnerabilityAdjustments: 'test',
        },
      },
      StatementOfTruth: {
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
    };
    return responseData;
  },

};
