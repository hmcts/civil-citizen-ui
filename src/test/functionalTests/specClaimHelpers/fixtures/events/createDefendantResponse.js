module.exports = {
  createDefendantResponse: () => {
    const defendantResponseData = {
      event: 'DEFENDANT_RESPONSE_CUI',
      caseDataUpdate: {
        respondent1ClaimResponseDocumentSpec: {
          'documentSize': 0
        },
        respondent1LiPResponse: {
          respondent1MediationLiPResponse: {
            mediationDisagreementLiP: 'No'
          },
          respondent1DQExtraDetails: {
            wantPhoneOrVideoHearing: 'No',
            giveEvidenceYourSelf: 'No',
            determinationWithoutHearingRequired: 'No',
            determinationWithoutHearingReason: 'x',
            respondent1DQLiPExpert: {
              caseNeedsAnExpert: 'No'
            }
          },
          respondent1DQHearingSupportLip: {
            supportRequirementLip: 'No'
          },
          respondent1ResponseLanguage: 'ENGLISH'
        },
        applicant1: {
          partyID: 'dc9574e8-d90b-45',
          type: 'COMPANY',
          companyName: 'Company name test',
          primaryAddress: {
            AddressLine1: 'Building and Street',
            PostCode: 'W1J 7NT'
          },
          partyName: 'Company name test',
          partyTypeDisplayValue: 'Company',
          partyEmail: 'civilmoneyclaimsdemo@gmail.com',
          flags: {
            partyName: 'Company name test',
            roleOnCase: 'Applicant 1'
          }
        },
        applicantSolicitor1UserDetails: {
          email: 'civilmoneyclaimsdemo@gmail.com',
          id: 'b115d542-2029-4184-96e5-b759406776e3'
        },
        addApplicant2: 'No',
        addRespondent2: 'No',
        respondent1: {
          type: 'COMPANY',
          companyName: 'company name def',
          primaryAddress: {
            AddressLine1: 'Building and Street',
            PostTown: 'xx',
            PostCode: 'W1J 7NT'
          },
          partyName: 'company name def',
          partyTypeDisplayValue: 'Company',
          partyEmail: 'civilmoneyclaimsdemo@gmail.com',
          partyPhone: '01632960001'
        },
        respondent1DetailsForClaimDetailsTab: {
          type: 'COMPANY',
          companyName: 'company name def',
          primaryAddress: {
            AddressLine1: 'Building and Street',
            PostCode: 'W1J 7NT'
          },
          partyName: 'company name def',
          partyTypeDisplayValue: 'Company',
          partyEmail: 'civilmoneyclaimsdemo@gmail.com'
        },
        respondent1Represented: 'Yes',
        respondent1OrgRegistered: 'Yes',
        respondentSolicitor1EmailAddress: 'civilmoneyclaimsdemo@gmail.com',
        detailsOfClaim: 'x',
        claimFee: {
          calculatedAmountInPence: '7000',
          code: 'FEE0204',
          version: '4'
        },
        applicantSolicitor1PbaAccounts: {
          value: {
            code: '1f6ab5eb-c808-468d-879d-269dbc626dcc',
            label: 'PBA0088192'
          },
          list_items: [
            {
              code: '1f6ab5eb-c808-468d-879d-269dbc626dcc',
              label: 'PBA0088192'
            },
            {
              code: '8ba75873-f76b-41e2-8300-0c34a3210484',
              label: 'PBA0078095'
            }
          ]
        },
        applicantSolicitor1ClaimStatementOfTruth: {
          name: 'Full Name',
          role: 'Role'
        },
        legacyCaseReference: '000MC125',
        claimIssuedPaymentDetails: {
          status: 'SUCCESS',
          customerReference: 'Details of PBA payment'
        },
        applicant1OrganisationPolicy: {
          Organisation: {
            OrganisationID: 'Q1KOKP2'
          },
          OrgPolicyCaseAssignedRole: '[APPLICANTSOLICITORONE]'
        },
        respondent1OrganisationPolicy: {
          Organisation: {
            OrganisationID: '79ZRSOU'
          },
          OrgPolicyCaseAssignedRole: '[RESPONDENTSOLICITORONE]'
        },
        respondent2OrganisationPolicy: {
          OrgPolicyCaseAssignedRole: '[RESPONDENTSOLICITORTWO]'
        },
        systemGeneratedCaseDocuments: [
          {
            id: '28771575-5763-46e4-ad36-5dd018159652',
            value: {
              documentLink: {
                document_url: 'http://dm-store:8080/documents/3e814474-0e76-427d-b7fb-9719443167fd',
                document_binary_url: 'http://dm-store:8080/documents/3e814474-0e76-427d-b7fb-9719443167fd/binary',
                document_filename: 'sealed_claim_form_000MC125.pdf',
                category_id: 'detailsOfClaim'
              },
              documentName: 'sealed_claim_form_000MC125.pdf',
              documentType: 'SEALED_CLAIM',
              documentSize: 45297,
              createdDatetime: '2023-05-24T10:21:40',
              createdBy: 'Civil'
            }
          }
        ],
        specApplicantCorrespondenceAddressRequired: 'No',
        specRespondentCorrespondenceAddressRequired: 'No',
        respondent1GeneratedResponseDocument: {
          documentSize: 0
        },
        claimAmountBreakup: [
          {
            value: {
              claimAmount: '100000',
              claimReason: 'What you are claiming for'
            },
            id: 'a6b2be18-f5a9-41ae-9678-6ab73478d3ca'
          }
        ],
        timelineOfEvents: [
          {
            value: {
              timelineDate: '2023-01-01',
              timelineDescription: 'xx'
            },
            id: 'cf0bab95-56a4-4c7f-b5be-16fb61f6d9f9'
          }
        ],
        totalClaimAmount: 1000,
        totalInterest: 0,
        claimInterest: 'No',
        calculatedInterest: '| Description | Amount | \n |---|---| \n | Claim amount | £ 1000 | \n | Interest amount | £ 0 | \n | Total amount | £ 1000 |',
        specAoSApplicantCorrespondenceAddressRequired: 'No',
        specRespondent1Represented: 'Yes',
        specClaimResponseTimelineList: 'MANUAL',
        detailsOfWhyDoesYouDisputeTheClaim: 'x',
        respondent1ClaimResponseTypeForSpec: 'FULL_DEFENCE',
        defenceAdmitPartPaymentTimeRouteRequired: 'IMMEDIATELY',
        defenceRouteRequired: 'DISPUTES_THE_CLAIM',
        responseClaimMediationSpecRequired: 'No',
        respondent1DQWitnesses: {
          witnessesToAppear: 'No'
        },
        respondent1DQHearing: {
          unavailableDatesRequired: 'No'
        },
        respondent1DQHearingSmallClaim: {
          unavailableDatesRequired: 'No'
        },
        respondent1DQRequestedCourt: {
          requestHearingAtSpecificCourt: 'No'
        },
        respondent1DQLanguage: {
          court: 'ENGLISH',
          documents: 'ENGLISH'
        },
        respondent1DQVulnerabilityQuestions: {
          vulnerabilityAdjustmentsRequired: 'No'
        },
        submittedDate: '2023-05-24T10:21:26',
        paymentSuccessfulDate: '2023-05-24T10:21:34',
        issueDate: '2023-05-24',
        claimNotificationDeadline: '2023-09-24T23:59:59',
        claimNotificationDate: '2023-05-24T10:21:45',
        respondent1ResponseDeadline: '2023-06-21T16:00:00',
        respondent1ResponseDate: '2023-05-25T13:06:03',
        applicant1ResponseDeadline: '2023-06-22T16:00:00',
        claimAmountBreakupSummaryObject: '| Description | Amount | \n |---|---| \n | What you are claiming for | £ 1000.00 |\n  | **Total** | £ 1000.00 |',
        caseManagementLocation: {
          region: '2',
          baseLocation: '420219'
        },
        caseManagementCategory: {
          value: {
            code: 'Civil',
            label: 'Civil'
          },
          list_items: [
            {
              id: '3e8ebf18-b935-41e2-9dcb-efc0b146fee8',
              value: {
                code: 'Civil',
                label: 'Civil'
              }
            }
          ]
        },
        caseNameHmctsInternal: 'Company name test v company name def',
        CaseAccessCategory: 'SPEC_CLAIM'
      },
    };
    return defendantResponseData;
  },
};
