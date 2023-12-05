module.exports = {
  drawDirectionsOrderRequired: () => {
    return {
      event: 'CREATE_SDO',
      caseData: {
        drawDirectionsOrderRequired: 'No',
      },
    };
  },

  SDOClaimsTrack: () => {
    return {
      event: 'CREATE_SDO',
      caseData: {
        claimsTrack: 'fastTrack',
        fastClaims: [
          'fastClaimClinicalNegligence',
          'fastClaimCreditHire',
        ],
      },
    };
  },

  SDOFastTrack: () => {
    return {
      event: 'CREATE_SDO',
      caseData: {
        drawDirectionsOrderRequired: 'No',
        claimsTrack: 'fastTrack',
        hearingMethodValuesFastTrack: {
          value: {
            code: 'b8ec0f16-7f56-4b96-beb4-21653378e906',
            label: 'In Person',
          },
          list_items: [
            {
              code: '9b688d46-4e9d-4754-9d88-76de5930c888',
              label: 'Telephone',
            },
            {
              code: 'b8ec0f16-7f56-4b96-beb4-21653378e906',
              label: 'In Person',
            },
            {
              code: '76ffc382-19be-411c-9f93-d10a4da690f8',
              label: 'Video',
            },
          ],
        },
        fastClaims: [
          'fastClaimBuildingDispute',
          'fastClaimClinicalNegligence',
        ],
        fastTrackOrderAndHearingDetails: {},
        fastTrackJudgesRecital: {
          input: 'Upon considering the statements of case and the information provided by the parties,',
        },
        fastTrackAllocation: {
          assignComplexityBand: 'No',
          reasons: null,
        },
        fastTrackAltDisputeResolutionToggle: [
          'SHOW',
        ],
        fastTrackAltDisputeResolution: {},
        fastTrackVariationOfDirectionsToggle: [
          'SHOW',
        ],
        fastTrackVariationOfDirections: {},
        fastTrackSettlementToggle: [
          'SHOW',
        ],
        fastTrackSettlement: {},
        fastTrackDisclosureOfDocumentsToggle: [
          'SHOW',
        ],
        fastTrackDisclosureOfDocuments: {
          input1: 'Standard disclosure shall be provided by the parties by uploading to the Digital Portal their list of documents by 4pm on',
          date1: '2023-10-12',
          input2: 'Any request to inspect a document, or for a copy of a document, shall be made directly to the other party by 4pm on',
          date2: '2023-10-26',
          input3: 'Requests will be complied with within 7 days of the receipt of the request.',
          input4: 'Each party must upload to the Digital Portal copies of those documents on which they wish to rely at trial by 4pm on',
          date3: '2023-11-09',
        },
        fastTrackWitnessOfFactToggle: [
          'SHOW',
        ],
        fastTrackWitnessOfFact: {
          input1: 'Each party must upload to the Digital Portal copies of the statements of all witnesses of fact on whom they intend to rely.',
          input2: '3',
          input3: '3',
          input4: 'For this limitation, a party is counted as a witness.',
          input5: 'Each witness statement should be no more than',
          input6: '10',
          input7: 'A4 pages. Statements should be double spaced using a font size of 12.',
          input8: 'Witness statements shall be uploaded to the Digital Portal by 4pm on',
          date: '2023-11-09',
          input9: 'Evidence will not be permitted at trial from a witness whose statement has not been uploaded in accordance with this Order. Evidence not uploaded, or uploaded late, will not be permitted except with permission from the Court.',
        },
        fastTrackSchedulesOfLossToggle: [
          'SHOW',
        ],
        fastTrackSchedulesOfLoss: {
          input1: 'The claimant must upload to the Digital Portal an up-to-date schedule of loss to the defendant by 4pm on',
          date1: '2023-11-23',
          input2: 'If the defendant wants to challenge this claim, upload to the Digital Portal counter-schedule of loss by 4pm on',
          date2: '2023-12-07',
          input3: 'If there is a claim for future pecuniary loss and the parties have not already set out their case on periodical payments, they must do so in the respective schedule and counter-schedule.',
        },
        fastTrackCostsToggle: [
          'SHOW',
        ],
        fastTrackCosts: {},
        fastTrackTrialToggle: [
          'SHOW',
        ],
        fastTrackHearingTime: {
          dateFrom: '2024-02-15',
          dateTo: '2024-04-11',
          hearingDuration: 'THREE_HOURS',
          helpText1: 'If either party considers that the time estimate is insufficient, they must inform the court within 7 days of the date of this order.',
          helpText2: 'Not more than seven nor less than three clear days before the trial, the claimant must file at court and serve an indexed and paginated bundle of documents which complies with the requirements of Rule 39.5 Civil Procedure Rules and which complies with requirements of PD32. The parties must endeavour to agree the contents of the bundle before it is filed. The bundle will include a case summary and a chronology.',
          dateToToggle: [
            'SHOW',
          ],
        },
        fastTrackMethodToggle: [
          'SHOW',
        ],
        fastTrackBuildingDispute: {
          input1: 'The claimant must prepare a Scott Schedule of the defects, items of damage, or any other relevant matters',
          input2: 'The columns should be headed:\n  •  Item\n  •  Alleged defect\n  •  Claimant’s costing\n  •  Defendant’s response\n  •  Defendant’s costing\n  •  Reserved for Judge’s use',
          input3: 'The claimant must upload to the Digital Portal the Scott Schedule with the relevant columns completed by 4pm on',
          date1: '2023-11-23',
          input4: 'The defendant must upload to the Digital Portal an amended version of the Scott Schedule with the relevant columns in response completed by 4pm on',
          date2: '2023-12-07',
        },
        fastTrackClinicalNegligence: {
          input1: 'Documents should be retained as follows:',
          input2: 'a) The parties must retain all electronically stored documents relating to the issues in this claim.',
          input3: 'b) the defendant must retain the original clinical notes relating to the issues in this claim. The defendant must give facilities for inspection by the claimant, the claimant\'s legal advisers and experts of these original notes on 7 days written notice.',
          input4: 'c) Legible copies of the medical and educational records of the claimant are to be placed in a separate paginated bundle by the claimant\'s solicitors and kept up to date. All references to medical notes are to be made by reference to the pages in that bundle.',
        },
        fastTrackAddNewDirections: [],
        fastTrackHearingNotes: {
          input: null,
        },
        fastTrackOrderWithoutJudgement: {
          'input': 'This order has been made without hearing. Each party has the right to apply to have this Order set aside or varied. Any such application must be received by the Court (together with the appropriate fee) by 4pm on 21 September 2023.',
        },
      },
    };
  },
};
