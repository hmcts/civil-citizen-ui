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
        claimsTrack: "fastTrack",
        fastClaims: [
          'fastClaimClinicalNegligence',
          'fastClaimCreditHire'
        ]
      },
    };
  },

  SDOFastTrack: () => {
    return {
      event: 'CREATE_SDO',
      caseData: {
        fastTrackOrderAndHearingDetails: {},
        fastTrackJudgesRecital: {
          input: 'Upon considering the statements of case and the information provided by the parties,'
        },
        fastTrackAllocation: {
          assignComplexityBand: 'No',
          reasons: null
        },
        fastTrackAltDisputeResolutionToggle: [
          'SHOW'
        ],
        fastTrackAltDisputeResolution: {},
        fastTrackVariationOfDirectionsToggle: [
          'SHOW'
        ],
        fastTrackVariationOfDirections: {},
        fastTrackSettlementToggle: [
          'SHOW'
        ],
        fastTrackSettlement: {},
        fastTrackDisclosureOfDocumentsToggle: [
          'SHOW'
        ],
        fastTrackDisclosureOfDocuments: {
          input1: 'Standard disclosure shall be provided by the parties by uploading to the Digital Portal their list of documents by 4pm on',
          date1: '2023-10-04',
          input2: 'Any request to inspect a document, or for a copy of a document, shall be made directly to the other party by 4pm on',
          date2: '2023-10-18',
          input3: 'Requests will be complied with within 7 days of the receipt of the request.',
          input4: 'Each party must upload to the Digital Portal copies of those documents on which they wish to rely at trial by 4pm on',
          date3: '2023-11-01'
        },
        fastTrackWitnessOfFactToggle: [
          'SHOW'
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
          date: '2023-11-01',
          input9: 'Evidence will not be permitted at trial from a witness whose statement has not been uploaded in accordance with this Order. Evidence not uploaded, or uploaded late, will not be permitted except with permission from the Court.'
        },
        fastTrackSchedulesOfLossToggle: [
          'SHOW'
        ],
        fastTrackSchedulesOfLoss: {
          input1: 'The claimant must upload to the Digital Portal an up-to-date schedule of loss to the defendant by 4pm on',
          date1: '2023-11-15',
          input2: 'If the defendant wants to challenge this claim, upload to the Digital Portal counter-schedule of loss by 4pm on',
          date2: '2023-11-29',
          input3: 'If there is a claim for future pecuniary loss and the parties have not already set out their case on periodical payments, they must do so in the respective schedule and counter-schedule.'
        },
        fastTrackCostsToggle: [
          'SHOW'
        ],
        fastTrackCosts: {},
        fastTrackTrialToggle: [
          'SHOW'
        ],
        fastTrackHearingTime: {
          dateFrom: '2024-02-07',
          dateTo: '2024-04-03',
          hearingDuration: 'ONE_AND_HALF_HOUR',
          helpText1: 'If either party considers that the time estimate is insufficient, they must inform the court within 7 days of the date of this order.',
          helpText2: 'Not more than seven nor less than three clear days before the trial, the claimant must file at court and serve an indexed and paginated bundle of documents which complies with the requirements of Rule 39.5 Civil Procedure Rules and which complies with requirements of PD32. The parties must endeavour to agree the contents of the bundle before it is filed. The bundle will include a case summary and a chronology.',
          dateToToggle: [
            'SHOW'
          ]
        },
        fastTrackMethodToggle: [
          'SHOW'
        ],
        hearingMethodValuesFastTrack: {
          value: {
            code: 'dae9aeb5-1517-4faf-a9a9-8c4afa9e201d',
            label: 'In Person'
          },
          list_items: [
            {
              code: '8f30533d-03d9-4ec5-a9df-6372aec45584',
              label: 'Telephone'
            },
            {
              code: 'dae9aeb5-1517-4faf-a9a9-8c4afa9e201d',
              label: 'In Person'
            },
            {
              code: 'ea00b09f-df34-4c0e-b2c9-377794076ea3',
              label: 'Video'
            }
          ]
        },
        fastTrackClinicalNegligence: {
          input1: 'Documents should be retained as follows:',
          input2: 'a) The parties must retain all electronically stored documents relating to the issues in this claim.',
          input3: 'b) the defendant must retain the original clinical notes relating to the issues in this claim. The defendant must give facilities for inspection by the claimant, the claimant\'s legal advisers and experts of these original notes on 7 days written notice.',
          input4: 'c) Legible copies of the medical and educational records of the claimant are to be placed in a separate paginated bundle by the claimant\'s solicitors and kept up to date. All references to medical notes are to be made by reference to the pages in that bundle.'
        },
        "fastTrackCreditHire": {
          input1: 'If impecuniosity is alleged by the claimant and not admitted by the defendant, the claimant\'s disclosure as ordered earlier in this Order must include:\na) Evidence of all income from all sources for a period of 3 months prior to the commencement of hire until the earlier of:\n      i) 3 months after cessation of hire\n     ii) the repair or replacement of the claimant\'s vehicle\nb) Copies of all bank, credit card, and saving account statements for a period of 3 months prior to the commencement of hire until the earlier of:\n     i) 3 months after cessation of hire\n     ii) the repair or replacement of the claimant\'s vehicle\nc) Evidence of any loan, overdraft or other credit facilities available to the claimant.',
          input2: 'The claimant must upload to the Digital Portal a witness statement addressing\na) the need to hire a replacement vehicle; and\nb) impecuniosity',
          date1: '2023-10-04',
          input3: 'A failure to comply with the paragraph above will result in the claimant being debarred from asserting need or relying on impecuniosity as the case may be at the final hearing, save with permission of the Trial Judge.',
          input4: 'The parties are to liaise and use reasonable endeavours to agree the basic hire rate no later than 4pm on',
          date2: '2023-10-18',
          input5: 'If the parties fail to agree rates subject to liability and/or other issues pursuant to the paragraph above, each party may rely upon written evidence by way of witness statement of one witness to provide evidence of basic hire rates available within the claimant\'s geographical location, from a mainstream supplier, or a local reputable supplier if none is available.',
          input6: 'The defendant\'s evidence is to be uploaded to the Digital Portal by 4pm on',
          date3: '2023-11-01',
          input7: 'and the claimant\'s evidence in reply if so advised to be uploaded by 4pm on',
          date4: '2023-11-15',
          input8: 'This witness statement is limited to 10 pages per party, including any appendices.'
        },
        fastTrackAddNewDirections: [],
        fastTrackHearingNotes: {
          input: null
        },
        fastTrackOrderWithoutJudgement: {
          input: 'This order has been made without hearing. Each party has the right to apply to have this Order set aside or varied. Any such application must be received by the Court (together with the appropriate fee) by 4pm on 13 September 2023.'
        }
      },
    };
  }
};
