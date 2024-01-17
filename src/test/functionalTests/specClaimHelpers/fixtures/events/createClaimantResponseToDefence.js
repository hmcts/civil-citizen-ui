module.exports = {
  createClaimantIntendsToProceedResponse: (ClaimType) => {
    const claimantResponseData = {
      event: 'CLAIMANT_RESPONSE_SPEC',
      caseData: {
        applicant1: {
          partyID: 'df27d531-4a46-4a',
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
        respondent1: {
          type: 'INDIVIDUAL',
          individualTitle: 'Sir',
          individualFirstName: 'John',
          individualLastName: 'Doe',
          individualDateOfBirth: '1987-11-01',
          primaryAddress: {
            AddressLine1: 'TestAddressLine1',
            AddressLine2: 'TestAddressLine2',
            AddressLine3: 'TestAddressLine3',
            PostTown: 'TestCity',
            PostCode: 'IG61JD',
          },
          partyName: 'Sir John Doe',
          partyTypeDisplayValue: 'Individual',
          partyEmail: 'civilmoneyclaimsdemo@gmail.com',
          partyPhone: '07123456789',
          unavailableDates: null,
          flags: null,
        },
        partAdmitPaidValuePounds: null,
        respondent2: null,
        claimantResponseScenarioFlag: 'ONE_V_ONE',
        respondToAdmittedClaimOwingAmountPounds: null,
        respondent1PaymentDateToStringSpec: '22 June 2023',
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
        applicant1ProceedWithClaim: 'Yes',
        applicant1AcceptAdmitAmountPaidSpec: null,
        applicant1PartAdmitConfirmAmountPaidSpec: null,
        applicant1AcceptPartAdmitPaymentPlanSpec: null,
        applicant1AcceptFullAdmitPaymentPlanSpec: null,
        applicantDefenceResponseDocumentAndDQFlag: null,
        showConditionFlags: null,
        applicant1ProceedWithClaimSpec2v1: null,
        responseClaimTrack: ClaimType,
        allocatedTrack: null,
        claimType: null,
        defenceRouteRequired: 'DISPUTES_THE_CLAIM',
        respondentResponseIsSame: null,
        defendantSingleResponseToBothClaimants: null,
        respondent1ClaimResponseTypeForSpec: 'FULL_DEFENCE',
        defenceAdmitPartPaymentTimeRouteRequired: 'IMMEDIATELY',
        showResponseOneVOneFlag: 'ONE_V_ONE_FULL_DEFENCE',
        applicant1DefenceResponseDocumentSpec: null,
        applicant1DQFileDirectionsQuestionnaire: {
          oneMonthStayRequested: 'No',
          reactionProtocolCompliedWith: 'Yes',
          reactionProtocolNotCompliedWithReason: null,
          explainedToClient: [
            'CONFIRM',
          ],
        },
        applicant1DQDisclosureOfElectronicDocuments: {
          reachedAgreement: 'Yes',
          agreementLikely: null,
          reasonForNoAgreement: null,
        },
        specApplicant1DQDisclosureOfNonElectronicDocuments: null,
        applicant1DQDisclosureReport: {
          disclosureFormFiledAndServed: 'No',
          disclosureProposalAgreed: 'No',
          draftOrderNumber: null,
        },
        applicant1DQExperts: {
          expertRequired: 'No',
          expertReportsSent: null,
          jointExpertSuitable: null,
          details: [

          ],
        },
        applicant1DQWitnesses: {
          witnessesToAppear: 'No',
          details: [

          ],
        },
        applicant1DQLanguage: {
          court: 'ENGLISH',
          documents: 'ENGLISH',
          evidence: null,
        },
        applicant1DQSmallClaimHearing: null,
        applicant1DQHearingLRspec: {
          hearingLengthHours: null,
          hearingLengthDays: null,
          unavailableDatesRequired: 'No',
          hearingLength: null,
          unavailableDates: [

          ],
        },
        applicant1DQRequestedCourt: {
          responseCourtLocations: {
            value: {
              code: '350aa935-4d80-4762-9a4e-2a8f3eaad9fc',
              label: 'Central London County Court - Thomas More Building, Royal Courts of Justice, Strand, London - WC2A 2LL',
            },
            list_items: [
              {
                code: '350aa935-4d80-4762-9a4e-2a8f3eaad9fc',
                label: 'Central London County Court - Thomas More Building, Royal Courts of Justice, Strand, London - WC2A 2LL',
              },
            ],
          },
          reasonForHearingAtSpecificCourt: 'reasons',
          responseCourtCode: null,
          caseLocation: {
            region: null,
            baseLocation: null,
          },
        },
        applicant1DQHearingSupport: {
          signLanguageRequired: null,
          languageToBeInterpreted: null,
          otherSupport: null,
          supportRequirements: 'No',
          supportRequirementsAdditional: null,
          requirements: [

          ],
        },
        applicant1DQVulnerabilityQuestions: {
          vulnerabilityAdjustmentsRequired: 'No',
          vulnerabilityAdjustments: null,
        },
        applicant1DQFutureApplications: {
          intentionToMakeFutureApplications: 'No',
          whatWillFutureApplicationsBeMadeFor: null,
        },
        applicant1AdditionalInformationForJudge: 'other info',
        uiStatementOfTruth: {
          name: 'claimant',
          role: 'nameandrole',
        },
      },
    };
    return claimantResponseData;
  },
};
