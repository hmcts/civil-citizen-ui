const { getClaimFee } = require('./claimAmountAndFee');

const createLiPClaimForCompany = (user, userId, totalClaimAmount) => {
  const eventDto = {
    event: 'CREATE_LIP_CLAIM',
    caseDataUpdate: {
      applicant1: {
        companyName: 'Test Company Claimant',
        partyEmail: user.email,
        partyPhone: '07446777177',
        primaryAddress: {
          AddressLine1: '123',
          AddressLine2: 'Fake Street',
          AddressLine3: '',
          PostCode: 'S12eu',
          PostTown: 'sheffield',
        },
        type: 'COMPANY',
      },
      respondent1: {
        companyName: 'Test Company Defendant',
        partyEmail: user.email,
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
      defenceRouteRequired: undefined,
      respondToClaim: undefined,
      detailsOfWhyDoesYouDisputeTheClaim: undefined,
      applicant1Represented: 'No',
      totalClaimAmount: totalClaimAmount,
      claimAmountBreakup: [
        {
          id: '0',
          value: {
            claimAmount: totalClaimAmount,
            claimReason: 'Injury',
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
        email: user.email,
        id: userId,
      },
      respondent1LiPResponse: {
        timelineComment: undefined,
        evidenceComment: undefined,
        respondent1MediationLiPResponse: undefined,
        respondent1DQExtraDetails: {
          wantPhoneOrVideoHearing: undefined,
          whyPhoneOrVideoHearing: '',
          whyUnavailableForHearing: undefined,
          giveEvidenceYourSelf: undefined,
          triedToSettle: undefined,
          determinationWithoutHearingRequired: undefined,
          determinationWithoutHearingReason: '',
          requestExtra4weeks: undefined,
          considerClaimantDocuments: undefined,
          considerClaimantDocumentsDetails: '',
          respondent1DQLiPExpert: {
            caseNeedsAnExpert: undefined,
            expertCanStillExamineDetails: '',
            expertReportRequired: undefined,
            details: undefined,
          },
          applicant1DQLiPExpert: undefined,
        },
        respondent1DQHearingSupportLip: {
          supportRequirementLip: undefined,
          requirementsLip: undefined,
        },
        respondent1LiPContactPerson: undefined,
        respondent1LiPCorrespondenceAddress: undefined,
        respondent1ResponseLanguage: undefined,
      },
      respondent1LiPResponseCarm: undefined,
      specRespondent1Represented: 'No',
      respondent1ResponseDeadline: undefined,
      helpWithFees: {
        helpWithFee: 'No',
        helpWithFeesReferenceNumber: '',
      },
      pcqId: '4c10fec5-1278-45f3-89f0-d3d016d47f95',
      respondent1AdditionalLipPartyDetails: {
        correspondenceAddress: {
          AddressLine1: undefined,
          AddressLine2: undefined,
          AddressLine3: undefined,
          PostCode: undefined,
          PostTown: undefined,
        },
        contactPerson: 'Test Company',
      },
      applicant1AdditionalLipPartyDetails: {
        correspondenceAddress: {
          AddressLine1: '123',
          AddressLine2: 'Test Street',
          AddressLine3: '',
          PostCode: 'L7 2pz',
          PostTown: 'Liverpool',
        },
        contactPerson: 'Test Company',
      },
      timelineOfEvents: [
        {
          id: '0',
          value: {
            timelineDate: '2000-01-01',
            timelineDescription: 'test',
          },
        },
      ],
      claimFee: getClaimFee(totalClaimAmount),
      claimantBilingualLanguagePreference: undefined,
    },
  };
  return eventDto;
};

module.exports = createLiPClaimForCompany;
