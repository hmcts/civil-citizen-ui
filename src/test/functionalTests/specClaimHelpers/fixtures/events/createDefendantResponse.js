module.exports = {
  createDefendantResponse: (totalClaimAmount) => {
    const defendantResponseData = {
      event: 'DEFENDANT_RESPONSE_CUI',
      caseDataUpdate: {
        respondent1ClaimResponseTypeForSpec:'FULL_DEFENCE',
        defenceAdmitPartPaymentTimeRouteRequired:'IMMEDIATELY',
        respondToClaimAdmitPartLRspec:{

        },
        responseClaimMediationSpecRequired:'No',
        specAoSApplicantCorrespondenceAddressRequired:'No',
        totalClaimAmount:totalClaimAmount,
        respondent1:{
          individualDateOfBirth:'1987-11-01T00:00:00.000Z',
          firstName:'John',
          lastName:'Doe',
          title:'Sir',
          partyEmail:'civilmoneyclaimsdemo@gmail.com',
          partyPhone:'07123456789',
          primaryAddress:{
            AddressLine1:'TestAddressLine1',
            AddressLine2:'TestAddressLine2',
            AddressLine3:'TestAddressLine3',
            PostCode:'IG61JD',
            PostTown:'TestCity',
          },
          type:'INDIVIDUAL',
        },
        respondent1LiPResponse:{
          respondent1LiPFinancialDetails:{

          },
          respondent1MediationLiPResponse:{
            mediationDisagreementLiP:'No',
          },
          respondent1DQExtraDetails:{
            wantPhoneOrVideoHearing:'No',
            giveEvidenceYourSelf:'No',
            triedToSettle:'No',
            determinationWithoutHearingRequired:'No',
            determinationWithoutHearingReason:'TestReason',
            requestExtra4weeks:'No',
            considerClaimantDocuments:'No',
            respondent1DQLiPExpert:{
              caseNeedsAnExpert:'No',
            },
          },
          respondent1DQHearingSupportLip:{
            supportRequirementLip:'No',
          },
          respondent1ResponseLanguage:'ENGLISH',
        },
        detailsOfWhyDoesYouDisputeTheClaim:'Testreason',
        specClaimResponseTimelineList:'MANUAL',
        specResponseTimelineOfEvents:[

        ],
        specResponselistYourEvidenceList:[

        ],
        defenceRouteRequired:'DISPUTES_THE_CLAIM',
        respondToClaim:{
          howMuchWasPaid:null,
        },
        respondent1DQHomeDetails:{

        },
        respondent1PartnerAndDependent:{
          howManyChildrenByAgeGroup:{

          },
        },
        specDefendant1SelfEmploymentDetails:{

        },
        respondToClaimAdmitPartUnemployedLRspec:{

        },
        respondent1DQLanguage:{
          court:'ENGLISH',
          documents:'ENGLISH',
        },
        respondent1DQVulnerabilityQuestions:{
          vulnerabilityAdjustmentsRequired:'No',
        },
        respondent1DQRequestedCourt:{
          requestHearingAtSpecificCourt:'No',
        },
        respondent1DQWitnesses:{
          witnessesToAppear:'No',
        },
        respondent1DQHearingFastClaim:{
          hearingLengthHours:'3',
          hearingLengthDays:'1',
          unavailableDatesRequired:'No',
        },
        respondent1DQExperts:{
          expertRequired:'No',
        },
      },
    };
    return defendantResponseData;
  },
};
