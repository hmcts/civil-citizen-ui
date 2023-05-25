module.exports = {
  createDefendantResponse: () => {
    const defendantResponseData = {
      event: 'DEFENDANT_RESPONSE_CUI',
      caseDataUpdate: {
        respondent1ClaimResponseTypeForSpec: FULL_DEFENCE,
        addRespondent2: 'No',
        respondent1ClaimResponseDocumentSpec: {
          documentSize: 0
        },
        respondent1LiPResponse: {
          respondent1DQExtraDetails: {
            giveEvidenceYourSelf: 'No',
            respondent1DQLiPExpert: {
              caseNeedsAnExpert: 'No'
            },
            wantPhoneOrVideoHearing: 'No',
            determinationWithoutHearingReason: 'ghjk',
            determinationWithoutHearingRequired: 'No'
          },
          respondent1ResponseLanguage: 'ENGLISH',
          respondent1DQHearingSupportLip: {
            supportRequirementLip: 'No'
          },
          respondent1MediationLiPResponse: {
            mediationDisagreementLiP: 'No'
          }
        },
        submittedDate: '2023-05-24T10:37:22',
        specRespondent1Represented: 'Yes',
        respondent1ResponseDeadline: '2023-06-21T16:00:00',
        solicitorReferences: {
          applicantSolicitor1Reference: 'Applicant reference',
          respondentSolicitor1Reference: 'Respondent reference'
        },
        respondent1OrgRegistered: 'Yes',
        applicantSolicitor1UserDetails: {
          id: '9c5e5972-618f-47c2-9c88-88db317051a1',
          email: 'civilmoneyclaimsdemo@gmail.com'
        },
        applicantSolicitor1PbaAccounts: {
          value: {
            code: '85aa7a00-fa16-11ed-a1a1-f31c749ecb84',
            label: 'PBA0088192'
          },
          list_items: [{
            code: '85aa7a00-fa16-11ed-a1a1-f31c749ecb84',
            label: 'PBA0088192'
          }, {
            code: '85aa7a01-fa16-11ed-a1a1-f31c749ecb84',
            label: 'PBA0078095'
          }]
        },
        addApplicant2: 'No',
        respondent1DQHearing: {
          unavailableDatesRequired: 'No'
        },
        timelineOfEvents: [{
          id: 'f8d466bf-6a8b-4f93-8e7a-d5c5623e69dd',
          value: {
            timelineDate: '2021-02-01',
            timelineDescription: 'event 1'
          }
        }],
        totalInterest: 0,
        detailsOfClaim: 'Test details of claim',
        claimFee: {
          code: 'FEE0205',
          version: 6,
          calculatedAmountInPence: 8000
        },
        specClaimResponseTimelineList: 'MANUAL',
        respondent1DQVulnerabilityQuestions: {
          vulnerabilityAdjustmentsRequired: 'No'
        },
        specAoSApplicantCorrespondenceAddressRequired: 'Yes',
        respondent1DetailsForClaimDetailsTab: {
          type: 'INDIVIDUAL',
          partyName: 'Sir John Doe',
          partyEmail: 'civilmoneyclaimsdemo@gmail.com',
          primaryAddress: {
            County: 'Kent',
            Country: 'United Kingdom',
            PostCode: 'RG4 7AA',
            PostTown: 'Reading',
            AddressLine1: 'Flat 2 - respondent',
            AddressLine2: 'Caversham House 15 - 17',
            AddressLine3: 'Church Road'
          },
          individualTitle: 'Sir',
          individualLastName: 'Doe',
          individualFirstName: 'John',
          partyTypeDisplayValue: 'Individual'
        },
        applicantSolicitor1ClaimStatementOfTruth: {
          name: 'John Doe',
          role: 'Test Solicitor'
        },
        detailsOfWhyDoesYouDisputeTheClaim: 'bjnkjl',
        respondentSolicitor1EmailAddress: 'hmcts.civil+organisation.2.solicitor.1 @gmail.com',
        paymentTypePBASpec: 'PBAv3',
        claimNotificationDeadline: '2023-09-24T23:59:59',
        claimIssuedPaymentDetails: {
          status: 'SUCCESS',
          reference: '13213223',
          customerReference: 'Applicant reference'
        },
        specApplicantCorrespondenceAddressRequired: 'No',
        caseManagementLocation: {
          region: 2,
          baseLocation: 420219
        },
        calculatedInterest: '| Description | Amount | | --- | --- | | Claim amount | £1500 | |Interest amount | £0 | |Total amount | £1500 |',
        respondent1DQLanguage: {
          court: 'ENGLISH',
          documents: 'ENGLISH'
        },
        defenceAdmitPartPaymentTimeRouteRequired: 'IMMEDIATELY',
        totalClaimAmount: 1500,
        defenceRouteRequired: 'DISPUTES_THE_CLAIM',
        caseManagementCategory: {
          value: {
            code: 'Civil',
            label: 'Civil'
          },
          list_items: [{
            id: 'd6904d5c-b468-4e74-8b0e-b06c4b03212b',
            value: {
              code: 'Civil',
              label: 'Civil'
            }
          }]
        },
        respondent1ResponseDate: '2023-05-24T10:56:23',
        CaseAccessCategory: 'SPEC_CLAIM',
        applicantSolicitor1PbaAccountsIsEmpty: 'No',
      },
      claimAmountBreakupSummaryObject: '| Description | Amount | | -- - | -- - | |amount reason | £1500.00 | | ** Total ** | £1500.00 |',
      applicant1: {
        type: 'COMPANY',
        flags: {
          partyName: 'Test Inc',
          roleOnCase: 'Applicant 1'
        },
        partyID: '7c46ea54-77d9-4b',
        partyName: 'Test Inc',
        companyName: 'Test Inc',
        primaryAddress: {
          County: 'Kent',
          Country: 'United Kingdom',
          PostCode: 'RG4 7AA',
          PostTown: 'Reading',
          AddressLine1: 'Flat 2 -applicant',
          AddressLine2: 'Caversham House 15 - 17',
          AddressLine3: 'Church Road'
        },
        partyTypeDisplayValue: 'Company'
      },
      systemGeneratedCaseDocuments: [{
        id: '56704d95-0d71-4209-a15e-aaaf1cb696fa',
        value: {
          createdBy: 'Civil',
          documentLink: {
            category_id: 'detailsOfClaim',
            document_url: 'http://dm-store-aat.service.core-compute-aat.internal/documents/53eaf767-3791-44ef-8c08-a7b78fa81914',
            document_filename:'sealed_claim_form_000MC008.pdf',
            document_binary_url:'http://dm-store-aat.service.core-compute-aat.internal/documents/53eaf767-3791-44ef-8c08-a7b78fa81914/binary'
          }
        }
      }],
      claimNotificationDate: '2023-05-24T10:37:34',
      claimInterest: 'No',
      specRespondentCorrespondenceAddressRequired: 'No',
      legacyCaseReference: '000MC008',
      applicant1ResponseDeadline: '2023-06-21T16:00:00',
      respondent1OrganisationPolicy: {
        Organisation: {
          OrganisationID: '79ZRSOU'
        },
        OrgPolicyReference: 'Defendantpolicyreference',
        OrgPolicyCaseAssignedRole: ['RESPONDENTSOLICITORONE']
      }
      ,
      caseNameHmctsInternal: 'Test Inc v Sir John Doe',
      respondent1Represented: 'Yes',
      claimIssuedPBADetails:
        {
          fee: {
            code: 'FEE0205',
            version: 6,
            calculatedAmountInPence: 8000
          },
          applicantsPbaAccounts: {
            value: {
              code: '85aa7a00-fa16-11ed-a1a1-f31c749ecb84',
              label: 'PBA0088192'
            },
            list_items: [{code: '85aa7a00-fa16-11ed-a1a1-f31c749ecb84', label: 'PBA0088192'}, {
              code: '85aa7a01-fa16-11ed-a1a1-f31c749ecb84',
              label: 'PBA0078095'
            }]
          },
          serviceRequestReference: '2023-1684921045793'
        }
      ,
      respondent1GeneratedResponseDocument: {
        documentSize: 0
      }
      ,
      respondent1DQRequestedCourt: {
        requestHearingAtSpecificCourt: 'No'
      }
      ,
      respondent1: {
        type: 'INDIVIDUAL',
        partyName: 'Sir John Doe',
        partyEmail: 'civilmoneyclaimsdemo@gmail.com',
        partyPhone: '07123456789',
        primaryAddress:
          {
            PostCode: 'RG4 7AA',
            PostTown: 'Reading',
            AddressLine1: 'Flat 2 - respondent',
            AddressLine2: 'Caversham House 15 - 17',
            AddressLine3: 'Church Road'
          },
        individualTitle: 'Sir',
        individualLastName: 'Doe',
        individualFirstName: 'John',
        individualDateOfBirth: '1975-01-01',
        partyTypeDisplayValue: 'Individual'
      },
      speclistYourEvidenceList: [{
        id: '838fb04a-efe4-4e2f-8377-8782fab8f1f0',
        value: {evidenceType: 'CONTRACTS_AND_AGREEMENTS', contractAndAgreementsEvidence: 'evidence details'}
      }],
      applicant1OrganisationPolicy:
        {
          Organisation: {
            OrganisationID: 'Q1KOKP2'
          },
          OrgPolicyReference: 'Claimant policy reference',
          OrgPolicyCaseAssignedRole: ['APPLICANTSOLICITORONE']
        },
      responseClaimMediationSpecRequired: 'No',
      claimAmountBreakup: [{
        id: '69102d93-aaaf-4832-a390-e686ad2197e5',
        value: {claimAmount: 150000, claimReason: 'amount reason'}
      }],
      respondent1DQWitnesses:
        {
          witnessesToAppear: 'No'
        }
    }
  return defendantResponseData;
  },
};
