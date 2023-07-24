module.exports = {
  generateSDODocument: () => {
    const generateSDOData = {
      event: 'CREATE_SDO',
      caseDataUpdate: {
        fastTrackOrderAndHearingDetails: {},
        fastTrackJudgesRecital: {
          input: "Upon considering the statements of case and the information provided by the parties,"
        },
        fastTrackAllocation: {},
        fastTrackAltDisputeResolutionToggle: [
          "SHOW"
        ],
        fastTrackAltDisputeResolution: {},
        fastTrackVariationOfDirectionsToggle: [
          "SHOW"
        ],
        fastTrackVariationOfDirections: {},
        fastTrackSettlementToggle: [
          "SHOW"
        ],
        fastTrackSettlement: {},
        fastTrackDisclosureOfDocumentsToggle: [
          "SHOW"
        ],
        fastTrackDisclosureOfDocuments: {
          input1: "Standard disclosure shall be provided by the parties by uploading to the Digital Portal their list of documents by 4pm on",
          date1: "2023-08-21",
          input2: "Any request to inspect a document, or for a copy of a document, shall be made directly to the other party by 4pm on",
          date2: "2023-09-04",
          input3: "Requests will be complied with within 7 days of the receipt of the request.",
          input4: "Each party must upload to the Digital Portal copies of those documents on which they wish to rely at trial by 4pm on",
          date3: "2023-09-18"
        },
        fastTrackWitnessOfFactToggle: [
          "SHOW"
        ],
        fastTrackWitnessOfFact: {
          input1: "Each party must upload to the Digital Portal copies of the statements of all witnesses of fact on whom they intend to rely.",
          input2: "3",
          input3: "3",
          input4: "For this limitation, a party is counted as a witness.",
          input5: "Each witness statement should be no more than",
          input6: "10",
          input7: "A4 pages. Statements should be double spaced using a font size of 12.",
          input8: "Witness statements shall be uploaded to the Digital Portal by 4pm on",
          date: "2023-09-18",
          input9: "Evidence will not be permitted at trial from a witness whose statement has not been uploaded in accordance with this Order. Evidence not uploaded, or uploaded late, will not be permitted except with permission from the Court."
        },
        fastTrackSchedulesOfLossToggle: [
          "SHOW"
        ],
        fastTrackSchedulesOfLoss: {
          input1: "The claimant must upload to the Digital Portal an up-to-date schedule of loss to the defendant by 4pm on",
          date1: "2023-10-02",
          input2: "If the defendant wants to challenge this claim, upload to the Digital Portal counter-schedule of loss by 4pm on",
          date2: "2023-10-16",
          input3: "If there is a claim for future pecuniary loss and the parties have not already set out their case on periodical payments, they must do so in the respective schedule and counter-schedule."
        },
        fastTrackCostsToggle: [
          "SHOW"
        ],
        fastTrackCosts: {},
        fastTrackTrialToggle: [
          "SHOW"
        ],
        fastTrackHearingTime: {
          dateFrom: "2023-12-25",
          dateTo: "2024-02-19",
          hearingDuration: "TWO_HOURS",
          helpText1: "If either party considers that the time estimate is insufficient, they must inform the court within 7 days of the date of this order.",
          helpText2: "Not more than seven nor less than three clear days before the trial, the claimant must file at court and serve an indexed and paginated bundle of documents which complies with the requirements of Rule 39.5 Civil Procedure Rules and which complies with requirements of PD32. The parties must endeavour to agree the contents of the bundle before it is filed. The bundle will include a case summary and a chronology.",
          dateToToggle: [
            "SHOW"
          ]
        },
        fastTrackMethodToggle: [
          "SHOW"
        ],
        hearingMethodValuesFastTrack: {
          value: {
            code: "613ad70e-b872-42d2-98f2-a13b0e17bb62",
            label: "In Person"
          },
          list_items: [
            {
              code: "5e67f6f1-abd7-4ca4-b13d-645d2800d99e",
              label: "Telephone"
            },
            {
              code: "613ad70e-b872-42d2-98f2-a13b0e17bb62",
              "label": "In Person"
            },
            {
              code: "b44b5e74-7691-4d7c-8a78-164e7c9cbcf3",
              label: "Video"
            }
          ]
        },
        fastTrackRoadTrafficAccident: {
          input: "Photographs and/or a place of the accident location shall be prepared and agreed by the parties and uploaded to the Digital Portal by 4pm on",
          date: "2023-09-18"
        },
        fastTrackAddNewDirections: [],
        fastTrackHearingNotes: {
          input: null
        },
        fastTrackOrderWithoutJudgement: {
          input: "This order has been made without hearing. Each party has the right to apply to have this Order set aside or varied. Any such application must be received by the Court (together with the appropriate fee) by 4pm on 31 July 2023."
        }
      },
      event: {
        id: "CREATE_SDO",
        summary: "",
        "description": ""
      },
      event_data: {
        drawDirectionsOrderRequired: "No",
        claimsTrack: "fastTrack",
        fastClaims: [
          "fastClaimRoadTrafficAccident"
        ],
        fastTrackOrderAndHearingDetails: {},
        fastTrackJudgesRecital: {
          input: "Upon considering the statements of case and the information provided by the parties,"
        },
        fastTrackAllocation: {},
        fastTrackAltDisputeResolutionToggle: [
          "SHOW"
        ],
        fastTrackAltDisputeResolution: {},
        fastTrackVariationOfDirectionsToggle: [
          "SHOW"
        ],
        fastTrackVariationOfDirections: {},
        fastTrackSettlementToggle: [
          "SHOW"
        ],
        fastTrackSettlement: {},
        fastTrackDisclosureOfDocumentsToggle: [
          "SHOW"
        ],
        fastTrackDisclosureOfDocuments: {
          input1: "Standard disclosure shall be provided by the parties by uploading to the Digital Portal their list of documents by 4pm on",
          date1: "2023-08-21",
          input2: "Any request to inspect a document, or for a copy of a document, shall be made directly to the other party by 4pm on",
          date2: "2023-09-04",
          input3: "Requests will be complied with within 7 days of the receipt of the request.",
          input4: "Each party must upload to the Digital Portal copies of those documents on which they wish to rely at trial by 4pm on",
          date3: "2023-09-18"
        },
        fastTrackWitnessOfFactToggle: [
          "SHOW"
        ],
        fastTrackWitnessOfFact: {
          input1: "Each party must upload to the Digital Portal copies of the statements of all witnesses of fact on whom they intend to rely.",
          input2: "3",
          input3: "3",
          input4: "For this limitation, a party is counted as a witness.",
          input5: "Each witness statement should be no more than",
          input6: "10",
          input7: "A4 pages. Statements should be double spaced using a font size of 12.",
          input8: "Witness statements shall be uploaded to the Digital Portal by 4pm on",
          date: "2023-09-18",
          input9: "Evidence will not be permitted at trial from a witness whose statement has not been uploaded in accordance with this Order. Evidence not uploaded, or uploaded late, will not be permitted except with permission from the Court."
        },
        fastTrackSchedulesOfLossToggle: [
          "SHOW"
        ],
        fastTrackSchedulesOfLoss: {
          input1: "The claimant must upload to the Digital Portal an up-to-date schedule of loss to the defendant by 4pm on",
          date1: "2023-10-02",
          input2: "If the defendant wants to challenge this claim, upload to the Digital Portal counter-schedule of loss by 4pm on",
          date2: "2023-10-16",
          input3: "If there is a claim for future pecuniary loss and the parties have not already set out their case on periodical payments, they must do so in the respective schedule and counter-schedule."
        },
        fastTrackCostsToggle: [
          "SHOW"
        ],
        fastTrackCosts: {},
        fastTrackTrialToggle: [
          "SHOW"
        ],
        fastTrackHearingTime: {
          dateFrom: "2023-12-25",
          dateTo: "2024-02-19",
          hearingDuration: "TWO_HOURS",
          helpText1: "If either party considers that the time estimate is insufficient, they must inform the court within 7 days of the date of this order.",
          helpText2: "Not more than seven nor less than three clear days before the trial, the claimant must file at court and serve an indexed and paginated bundle of documents which complies with the requirements of Rule 39.5 Civil Procedure Rules and which complies with requirements of PD32. The parties must endeavour to agree the contents of the bundle before it is filed. The bundle will include a case summary and a chronology.",
          dateToToggle: [
            "SHOW"
          ]
        },
        fastTrackMethodToggle: [
          "SHOW"
        ],
        hearingMethodValuesFastTrack: {
          value: {
            code: "613ad70e-b872-42d2-98f2-a13b0e17bb62",
            label: "In Person"
          },
          list_items: [
            {
              code: "5e67f6f1-abd7-4ca4-b13d-645d2800d99e",
              label: "Telephone"
            },
            {
              code: "613ad70e-b872-42d2-98f2-a13b0e17bb62",
              label: "In Person"
            },
            {
              code: "b44b5e74-7691-4d7c-8a78-164e7c9cbcf3",
              label: "Video"
            }
          ]
        },
        fastTrackRoadTrafficAccident: {
          input: "Photographs and/or a place of the accident location shall be prepared and agreed by the parties and uploaded to the Digital Portal by 4pm on",
          date: "2023-09-18"
        },
        fastTrackAddNewDirections: [],
        fastTrackHearingNotes: {
          input: null
        },
        fastTrackOrderWithoutJudgement: {
          input: "This order has been made without hearing. Each party has the right to apply to have this Order set aside or varied. Any such application must be received by the Court (together with the appropriate fee) by 4pm on 31 July 2023."
        }

      },
    };
    return generateSDOData;
  },
};
