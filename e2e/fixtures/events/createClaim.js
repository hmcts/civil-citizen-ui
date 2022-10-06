const {listElement, buildAddress, date } = require('../../api/dataHelper');
const uuid = require('uuid');
const config = require('../../config.js');

const docUuid = uuid.v1();

const respondent1 = {
  type: 'INDIVIDUAL',
  individualFirstName: 'John',
  individualLastName: 'Doe',
  individualTitle: 'Sir',
  primaryAddress: buildAddress('respondent'),
};
const respondent2 = {
  type: 'INDIVIDUAL',
  individualFirstName: 'Foo',
  individualLastName: 'Bar',
  individualTitle: 'Dr',
  primaryAddress: buildAddress('second respondent'),
};
const respondent1WithPartyName = {
  ...respondent1,
  partyName: 'Sir John Doe',
  partyTypeDisplayValue: 'Individual',
};
const respondent2WithPartyName = {
  ...respondent2,
  partyName: 'Dr Foo Bar',
  partyTypeDisplayValue: 'Individual',
};
const company = {
  type: 'COMPANY',
  companyName: 'Test Inc',
  primaryAddress: buildAddress('applicant'),
};
const companyWithPartyName = {
  ...company,
  partyName: 'Test Inc',
  partyTypeDisplayValue: 'Company',
};

const organisation = {
  type: 'ORGANISATION',
  organisationName: 'Test Inc',
  primaryAddress: buildAddress('applicant'),
};
const organisationWithPartyName = {
  ...organisation,
  partyName: 'Test Inc',
  partyTypeDisplayValue: 'Organisation',
};

const soleTrader = {
  type: 'SOLE_TRADER',
  soleTraderFirstName: 'Jane',
  soleTraderLastName: 'Doe',
  soleTraderTradingAs: 'Dr',
  soleTraderDateOfBirth: date(-1),
  primaryAddress: buildAddress('applicant'),
};

const soleTraderWithPartyName = {
  ...soleTrader,
  partyName: 'Dr Jane Doe',
  partyTypeDisplayValue: 'Sole trader',
};

const individual = {
  type: 'INDIVIDUAL',
  individualFirstName: 'Jane',
  individualLastName: 'Doe',
  individualTitle: 'Dr',
  primaryAddress: buildAddress('second applicant'),
};

const individualWithPartyName = {
  ...individual,
  partyName: 'Dr Jane Doe',
  partyTypeDisplayValue: 'Individual',
};

const applicant1LitigationFriend = {
  fullName: 'Bob the litigant friend',
  hasSameAddressAsLitigant: 'No',
  primaryAddress: buildAddress('litigant friend'),
};

let selectedPba = listElement('PBA0088192');
const validPba = listElement('PBA0088192');
const invalidPba = listElement('PBA0078095');

const claimant = (claimantType) => {

  switch (claimantType) {
    case 'Individual':
      return individualWithPartyName;

    case 'Organisation':
      return organisationWithPartyName;

    case 'SoleTrader':
      return soleTraderWithPartyName;

    default:
      return companyWithPartyName;
  }
};

const createClaimData = (legalRepresentation, useValidPba, mpScenario, claimantType) => {
  selectedPba = useValidPba ? validPba : invalidPba;
  const claimData = {
    References: {
      CaseAccessCategory: 'UNSPEC_CLAIM',
      solicitorReferences: {
        applicantSolicitor1Reference: 'Applicant reference',
        respondentSolicitor1Reference: 'Respondent reference',
      },
    },
    Court: {
      courtLocation: {
        applicantPreferredCourtLocationList: {
          list_items: [
            listElement('Barnet Civil and Family Centre - ST MARY\'S COURT, REGENTS PARK ROAD - N3 1BQ'),
          ],
          value: listElement('Barnet Civil and Family Centre - ST MARY\'S COURT, REGENTS PARK ROAD - N3 1BQ'),
        },
      },
    },
    Claimant: {
      applicant1: claimant(claimantType),
    },
    ClaimantLitigationFriendRequired: {
      applicant1LitigationFriendRequired: 'Yes',
    },
    ClaimantLitigationFriend: {
      applicant1LitigationFriend: applicant1LitigationFriend,
    },
    Notifications: {
      applicantSolicitor1CheckEmail: {
        email: 'hmcts.civil+organisation.1.solicitor.1@gmail.com',
        correct: 'No',
      },
      applicantSolicitor1UserDetails: {
        email: 'hmcts.civil+organisation.1.solicitor.1@gmail.com',
        id: 'c18d5f8d-06fa-477d-ac09-5b6129828a5b',
      },
    },
    ClaimantSolicitorOrganisation: {
      applicant1OrganisationPolicy: {
        OrgPolicyReference: 'Claimant policy reference',
        OrgPolicyCaseAssignedRole: '[APPLICANTSOLICITORONE]',
        Organisation: {
          OrganisationID: config.claimantSolicitorOrgId,
        },
      },
    },
    ClaimantSolicitorServiceAddress: {
      applicantSolicitor1ServiceAddress:  buildAddress('service'),
    },
    AddAnotherClaimant: {
      addApplicant2: 'No',
    },
    ...(mpScenario === 'TWO_V_ONE') ? {
      SecondClaimant: {
        applicant2: claimant(claimantType),
      },
      SecondClaimantLitigationFriendRequired: {
        applicant2LitigationFriendRequired: 'No',
      },
    }: {},
    Defendant: {
      respondent1: respondent1WithPartyName,
    },
    LegalRepresentation: {
      respondent1Represented: `${legalRepresentation}`,
    },
    DefendantSolicitorOrganisation: {
      respondent1OrgRegistered: 'Yes',
      respondent1OrganisationPolicy: {
        OrgPolicyReference: 'Defendant policy reference',
        OrgPolicyCaseAssignedRole: '[RESPONDENTSOLICITORONE]',
        Organisation: {
          OrganisationID: config.defendant1SolicitorOrgId,
        },
      },
    },
    DefendantSolicitorServiceAddress: {
      respondentSolicitor1ServiceAddress: buildAddress('service'),
    },
    DefendantSolicitorEmail: {
      respondentSolicitor1EmailAddress: 'hmcts.civil+organisation.2.solicitor.1@gmail.com',
    },
    AddAnotherDefendant: {
      addRespondent2: 'No',
    },
    ...hasRespondent2(mpScenario) ? {
      SecondDefendant: {},
      SecondDefendantLegalRepresentation: {},
      SecondDefendantSolicitorOrganisation: {},
      SecondDefendantSolicitorServiceAddress: {},
      SecondDefendantSolicitorReference: {},
      SecondDefendantSolicitorEmail: {},
      SameLegalRepresentative: {},
    } : {},
    ClaimType: {
      claimType: 'PERSONAL_INJURY',
    },
    PersonalInjuryType: {
      personalInjuryType: 'ROAD_ACCIDENT',
    },
    Details: {
      detailsOfClaim: 'Test details of claim',
    },
    Upload: {
      servedDocumentFiles: {
        particularsOfClaimDocument: [
          {
            id: docUuid,
            value: {
              document_url: '${TEST_DOCUMENT_URL}',
              document_binary_url: '${TEST_DOCUMENT_BINARY_URL}',
              document_filename: '${TEST_DOCUMENT_FILENAME}',
            },
          },
        ],
      },
    },
    ClaimValue: {
      claimValue: {
        statementOfValueInPennies: '3000000',
      },
    },
    PbaNumber: {
      applicantSolicitor1PbaAccounts: {
        list_items: [
          validPba,
          invalidPba,
        ],
        value: selectedPba,

      },
    },
    PaymentReference: {
      claimIssuedPaymentDetails:  {
        customerReference: 'Applicant reference',
      },
    },
    StatementOfTruth: {
      uiStatementOfTruth: {
        name: 'John Doe',
        role: 'Test Solicitor',
      },
    },
  };
  switch (mpScenario){
    case 'ONE_V_TWO_ONE_LEGAL_REP': {
      return {
        ...claimData,
        AddAnotherClaimant: {
          addApplicant2: 'No',
        },
        AddAnotherDefendant: {
          addRespondent2: 'Yes',
        },
        SecondDefendant: {
          respondent2: respondent2WithPartyName,
        },
        SecondDefendantLegalRepresentation: {
          respondent2Represented: 'Yes',
        },
        SameLegalRepresentative: {
          respondent2SameLegalRepresentative: 'Yes',
        },
      };
    }
    case 'ONE_V_TWO_TWO_LEGAL_REP': {
      return {
        ...claimData,
        AddAnotherClaimant: {
          addApplicant2: 'No',
        },
        AddAnotherDefendant: {
          addRespondent2: 'Yes',
        },
        SecondDefendant: {
          respondent2: respondent2WithPartyName,
        },
        SecondDefendantLegalRepresentation: {
          respondent2Represented: 'Yes',
        },
        SameLegalRepresentative: {
          respondent2SameLegalRepresentative: 'No',
        },
        SecondDefendantSolicitorOrganisation: {
          respondent2OrgRegistered: 'Yes',
          respondent2OrganisationPolicy: {
            OrgPolicyReference: 'Defendant policy reference 2',
            OrgPolicyCaseAssignedRole: '[RESPONDENTSOLICITORTWO]',
            Organisation: {
              OrganisationID: config.defendant2SolicitorOrgId,
            },
          },
        },
        SecondDefendantSolicitorServiceAddress: {
          respondentSolicitor2ServiceAddress: buildAddress('service'),
        },
        SecondDefendantSolicitorReference: {
          respondentSolicitor2Reference: 'sol2reference',
        },
        SecondDefendantSolicitorEmail: {
          respondentSolicitor2EmailAddress: 'hmcts.civil+organisation.3.solicitor.1@gmail.com',
        },
      };
    }
    case 'TWO_V_ONE': {
      return {
        ...claimData,
        AddAnotherClaimant: {
          addApplicant2: 'Yes',
        },
      };
    }
    case 'ONE_V_ONE':
    default: {
      return claimData;
    }
  }
};

const hasRespondent2 = (mpScenario) => {
  return mpScenario === 'ONE_V_TWO_ONE_LEGAL_REP'
    || mpScenario ===  'ONE_V_TWO_TWO_LEGAL_REP';
};

module.exports = {
  createClaim: (mpScenario = 'ONE_V_ONE', claimantType) => {
    return {
      midEventData: {
        ClaimValue: {
          applicantSolicitor1PbaAccounts: {
            list_items: [
              validPba,
              invalidPba,
            ],
          },
          applicantSolicitor1PbaAccountsIsEmpty: 'No',
          claimFee: {
            calculatedAmountInPence: '150000',
            code: 'FEE0209',
            version: '3',
          },
          claimIssuedPaymentDetails: {
            customerReference: 'Applicant reference',
          },
          applicant1: claimant(claimantType),
          respondent1: respondent1WithPartyName,
          ...hasRespondent2(mpScenario) ? {
            respondent2: respondent2WithPartyName,
          } : {},
        },
        ClaimantLitigationFriend: {
          applicant1: claimant(claimantType),
          applicant1LitigationFriend: applicant1LitigationFriend,
          applicantSolicitor1CheckEmail: {
            email: 'hmcts.civil+organisation.1.solicitor.1@gmail.com',
          },
        },
        // otherwise applicantSolicitor1ClaimStatementOfTruth: [undefined]
        StatementOfTruth: {
          applicantSolicitor1ClaimStatementOfTruth: {},
        },
      },
      valid: {
        ...createClaimData('Yes', true, mpScenario, 'Company'),
      },
      invalid: {
        Upload: {
          servedDocumentFiles: {
            particularsOfClaimDocument: [
              {
                id: docUuid,
                value: {
                  document_url: '${TEST_DOCUMENT_URL}',
                  document_binary_url: '${TEST_DOCUMENT_BINARY_URL}',
                  document_filename: '${TEST_DOCUMENT_FILENAME}',
                },
              },
              {
                id: docUuid,
                value: {
                  document_url: '${TEST_DOCUMENT_URL}',
                  document_binary_url: '${TEST_DOCUMENT_BINARY_URL}',
                  document_filename: '${TEST_DOCUMENT_FILENAME}',
                },
              },
            ],
          },
        },
        Court: {
          courtLocation: {
            applicantPreferredCourt: ['3a3', '21', '3333'],
          },
        },
      },
    };
  },

  createClaimLitigantInPerson: {
    valid: createClaimData('No', true),
  },
  createClaimWithTerminatedPBAAccount: {
    valid: createClaimData('Yes', false),
  },
  createClaimRespondentSolFirmNotInMyHmcts: {
    valid: {
      ...createClaimData('Yes', true),
      DefendantSolicitorOrganisation: {
        respondent1OrgRegistered: 'No',
      },
      UnRegisteredDefendantSolicitorOrganisation: {
        respondentSolicitor1OrganisationDetails: {
          organisationName: 'Test org',
          phoneNumber: '0123456789',
          email: 'test@example.com',
          dx: 'test dx',
          fax: '123123123',
          address: buildAddress('org'),
        },
      },
    },
  },
};
