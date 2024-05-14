const {listElement, buildAddress} = require('../../api/dataHelper');
const config = require('../../../../config');

const applicant1 = {
  type: 'INDIVIDUAL',
  individualFirstName: 'John',
  individualLastName: 'Doe',
  individualTitle: 'Sir',
  primaryAddress: buildAddress('respondent'),
  partyEmail: 'civilmoneyclaimsdemo@gmail.com',
};
const applicant1WithPartyName = {
  ...applicant1,
  partyName: 'Sir John Doe',
  partyTypeDisplayValue: 'Individual',
};
const respondent1 = {
  type: 'ORGANISATION',
  companyName: 'Test Organisation',
  partyEmail: 'jane.smith@gmail.com',
  partyPhone: '07800000000',
  primaryAddress: {
    AddressLine1:'TestAddressLine1',
    AddressLine2:'TestAddressLine2',
    AddressLine3:'TestAddressLine3',
    PostCode:'IG61JD',
    PostTown:'TestCity',
  },
};
const respondent1WithPartyName = {
  ...respondent1,
  partyName: 'Test Organisation',
  partyTypeDisplayValue: 'Organisation',
};

const solicitor1Email = 'hmcts.civil+organisation.1.solicitor.1@gmail.com';
const claimAmount = '1500';

const validPba = listElement('PBA0088192');
const invalidPba = listElement('PBA0078095');

module.exports = {
  createClaim: () => {
    const userData = {
      userInput: {
        References: {
          CaseAccessCategory: 'SPEC_CLAIM',
          solicitorReferences: {
            applicantSolicitor1Reference: 'Applicant reference',
            respondentSolicitor1Reference: 'Respondent reference',
          },
        },
        Claimant: {
          applicant1: applicant1WithPartyName,
        },
        AddAnotherClaimant: {
          addApplicant2: 'No',
        },
        Notifications: {
          applicantSolicitor1CheckEmail: {
            correct: 'No',
          },
          applicantSolicitor1UserDetails: {
            email: 'civilmoneyclaimsdemo@gmail.com',
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
        specCorrespondenceAddress: {
          specApplicantCorrespondenceAddressRequired: 'No',
        },
        Defendant: {
          respondent1: respondent1WithPartyName,
        },
        LegalRepresentation: {
          specRespondent1Represented: 'No',
        },
        specRespondentCorrespondenceAddress: {
          specRespondentCorrespondenceAddressRequired: 'No',
        },
        AddAnotherDefendant: {
          addRespondent2: 'No',
        },
        Details: {
          detailsOfClaim: 'Test details of claim',
        },
        ClaimTimeline: {
          timelineOfEvents: [{
            value: {
              timelineDate: '2021-02-01',
              timelineDescription: 'event 1',
            },
          }],
        },
        EvidenceList: {
          speclistYourEvidenceList: [{
            value: {
              evidenceType: 'CONTRACTS_AND_AGREEMENTS',
              contractAndAgreementsEvidence: 'evidence details',
            },
          }],
        },
        ClaimAmount: {
          claimAmountBreakup: [{
            value: {
              claimReason: 'amount reason',
              claimAmount: claimAmount,
            },
          }],
        },
        ClaimInterest: {
          claimInterest: 'No',
        },

        InterestSummary: {
          claimIssuedPaymentDetails: {
            customerReference: 'Applicant reference',
          },
        },
        PbaNumber: {
          applicantSolicitor1PbaAccounts: {
            list_items: [
              validPba,
              invalidPba,
            ],
            value: validPba,
          },
        },
        StatementOfTruth: {
          uiStatementOfTruth: {
            name: 'John Doe',
            role: 'Test Solicitor',
          },
        },
      },

      midEventData: {
        Notifications: {
          applicantSolicitor1CheckEmail: {
            email: solicitor1Email,
          },
        },
        ClaimAmount: {
          totalClaimAmount: claimAmount / 100,
        },
        ClaimAmountDetails: {
          CaseAccessCategory: 'SPEC_CLAIM',
        },
        InterestSummary: {
          totalInterest: 0,
          applicantSolicitor1PbaAccountsIsEmpty: 'No',
        },
      },

      midEventGeneratedData: {
        ClaimAmount: {
          speclistYourEvidenceList: {
            id: 'string',
          },
          claimAmountBreakupSummaryObject: 'string',
          timelineOfEvents: {
            id: 'string',
          },
          claimAmountBreakup: {
            id: 'string',
          },
        },
        ClaimInterest: {
          calculatedInterest: 'string',
        },
        InterestSummary: {
          applicantSolicitor1PbaAccounts: {
            list_items: 'object',
          },
          claimFee: {
            calculatedAmountInPence: 'string',
            code: 'string',
            version: 'string',
          },
        },
      },
    };

    return userData;
  },

  serviceUpdateDto: (caseId, paymentStatus) => {
    return {
      service_request_reference: '1324646546456',
      ccd_case_number: caseId,
      service_request_amount: '167.00',
      service_request_status: paymentStatus,
      payment: {
        payment_amount: 167.00,
        payment_reference: '13213223',
        payment_method: 'by account',
        case_reference: 'example of case ref',
      },
    };
  },
};
