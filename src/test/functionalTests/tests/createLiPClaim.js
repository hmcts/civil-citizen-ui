module.exports = {
  createClaim: (userId) => {
    const eventDto = {
      event: 'CREATE_LIP_CLAIM',
      caseDataUpdate: {
        draftClaimCreatedAt: '',
        applicant1: {
          companyName: undefined,
          individualDateOfBirth: '1995-01-01',
          individualFirstName: 'Claimant',
          individualLastName: 'Claim',
          individualTitle: 'Mr',
          organisationName: undefined,
          partyEmail: 'civilmoneyclaimsdemo@gmail.com',
          partyPhone: undefined,
          primaryAddress: {
            addressLine1: 'Some Address 1',
            addressLine2: 'Some Address 2',
            postCode: 'TS190JB',
          },
          soleTraderDateOfBirth: null,
          soleTraderFirstName: undefined,
          soleTraderLastName: undefined,
          soleTraderTitle: undefined,
          soleTraderTradingAs: undefined,
          type: 'INDIVIDUAL',
        },
        respondent1: {
          companyName: undefined,
          individualDateOfBirth: null,
          individualFirstName: 'Defendant',
          individualLastName: 'Defend',
          individualTitle: 'Mr',
          organisationName: undefined,
          partyEmail: 'civilmoneyclaimsdemo@gmail.com',
          partyPhone: '07800000000',
          primaryAddress: {
            addressLine1: 'Another Address 1',
            addressLine2: 'Another Address 2',
            postCode: 'TS190JB',
          },
          soleTraderDateOfBirth: null,
          soleTraderFirstName: undefined,
          soleTraderLastName: undefined,
          soleTraderTitle: undefined,
          soleTraderTradingAs: undefined,
          type: 'INDIVIDUAL',
        },
        defenceRouteRequired: undefined,
        respondToClaim: undefined,
        detailsOfWhyDoesYouDisputeTheClaim: undefined,
        applicant1Represented: 'No',
        totalClaimAmount: 1400,
        claimAmountBreakup: [
          {
            value: {
              claimAmount: '1400',
              claimReason: 'dd',
            },
          },
        ],
        detailsOfClaim: 'Injury',
        speclistYourEvidenceList: undefined,
        claimInterest: 'No',
        interestClaimOptions: undefined,
        breakDownInterestTotal: undefined,
        breakDownInterestDescription: undefined,
        sameRateInterestSelection: undefined,
        interestClaimFrom: undefined,
        interestFromSpecificDate: undefined,
        interestFromSpecificDateDescription: undefined,
        interestClaimUntil: undefined,
        claimantUserDetails: {
          email: 'civilmoneyclaimsdemo@gmail.com',
          id: userId,
        },
        respondent1LiPResponse: {
          timelineComment: undefined,
          evidenceComment: undefined,
          respondent1MediationLiPResponse: undefined,
          respondent1DQExtraDetails: {
            [Object]: undefined,
          },
          respondent1DQHearingSupportLip: {
            [Object]: undefined,
          },
          respondent1LiPContactPerson: undefined,
          respondent1LiPCorrespondenceAddress: undefined,
          respondent1ResponseLanguage: undefined,
        },
        specRespondent1Represented: 'No',
        respondent1ResponseDeadline: undefined,
        helpWithFees: {
          helpWithFee: 'No',
          helpWithFeesReferenceNumber: '',
        },
        pcqId: '4c10fec5-1278-45f3-89f0-d3d016d47f95',
        respondent1AdditionalLipPartyDetails: {
          correspondenceAddress: {
            addressLine1: '123',
            addressLine2: 'Test Street',
            addressLine3: '',
            postCode: 'TS19 0JB',
          },
          contactPerson: undefined,
        },
        applicant1AdditionalLipPartyDetails: {
          correspondenceAddress: {
            addressLine1: '123',
            addressLine2: 'Test Street',
            addressLine3: '',
            postCode: 'TS19 0JB',
          },
          contactPerson: undefined,
        },
        timelineOfEvents: [{
          value: {
            timelineDate: '2021-02-01',
            timelineDescription: 'event 1',
          },
        }],
        claimFee: {
          calculatedAmountInPence: '45500',
          version: '3',
          code: 'FEE0208',
        },
        claimantBilingualLanguagePreference: undefined,
      },
    };
    return eventDto;
  },
};
