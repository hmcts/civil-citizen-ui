module.exports = {
  createAnAssistedOrder: (document) => {
    const assistedOrderData = {
      event: 'GENERATE_DIRECTIONS_ORDER',
      caseDataUpdate: {
        finalOrderSelection: 'ASSISTED_ORDER',
        finalOrderMadeSelection: 'No',
        finalOrderDateHeardComplex: null,
        finalOrderJudgeHeardFrom: [
          'SHOW',
        ],
        finalOrderRepresentation: {
          typeRepresentationList: 'OTHER_REPRESENTATION',
          typeRepresentationComplex: {
            typeRepresentationDefendantTwoDynamic: null,
            typeRepresentationDefendantOneDynamic: 'Sir John Doe',
            typeRepresentationClaimantTwoDynamic: null,
            typeRepresentationClaimantOneDynamic: 'Test Inc',
            typeRepresentationClaimantList: null,
            typeRepresentationClaimantListTwo: null,
            typeRepresentationDefendantList: null,
            typeRepresentationDefendantTwoList: null,
            detailsRepresentationText: null,
            trialProcedureClaimantComplex: {
              list: null,
              listClaimTwo: null,
              listDef: null,
              listDefTwo: null,
            },
            trialProcedClaimTwoComplex: {
              listClaimTwo: null,
              list: null,
              listDef: null,
              listDefTwo: null,
            },
            trialProcedureComplex: {
              listDef: null,
              list: null,
              listClaimTwo: null,
              listDefTwo: null,
            },
            trialProcedureDefTwoComplex: {
              listDefTwo: null,
              list: null,
              listClaimTwo: null,
              listDef: null,
            },
          },
          typeRepresentationOtherComplex: {
            detailsRepresentationText: 'Enter details of representation',
            typeRepresentationClaimantList: null,
            typeRepresentationClaimantOneDynamic: null,
            typeRepresentationClaimantTwoDynamic: null,
            typeRepresentationDefendantOneDynamic: null,
            typeRepresentationDefendantTwoDynamic: null,
            typeRepresentationClaimantListTwo: null,
            typeRepresentationDefendantList: null,
            typeRepresentationDefendantTwoList: null,
            trialProcedureClaimantComplex: {
              list: null,
              listClaimTwo: null,
              listDef: null,
              listDefTwo: null,
            },
            trialProcedClaimTwoComplex: {
              list: null,
              listClaimTwo: null,
              listDef: null,
              listDefTwo: null,
            },
            trialProcedureComplex: {
              list: null,
              listClaimTwo: null,
              listDef: null,
              listDefTwo: null,
            },
            trialProcedureDefTwoComplex: {
              list: null,
              listClaimTwo: null,
              listDef: null,
              listDefTwo: null,
            },
          },
          typeRepresentationJudgePapersList: [
            'CONSIDERED',
          ],
        },
        finalOrderRecitals: [
          'SHOW',
        ],
        finalOrderRecitalsRecorded: null,
        finalOrderOrderedThatText: 'Blach',
        finalOrderFurtherHearingToggle: [
          'SHOW',
        ],
        finalOrderFurtherHearingComplex: {
          listFromDate: '2024-12-01',
          dateToDate: null,
          lengthList: 'MINUTES_30',
          datesToAvoidYesNo: 'No',
          hearingLocationList: {
            value: {
              code: 'LOCATION_LIST',
              label: 'Central London County Court',
            },
            list_items: [
              {
                code: 'LOCATION_LIST',
                label: 'Central London County Court',
              },
              {
                code: 'OTHER_LOCATION',
                label: 'Other location',
              },
            ],
          },
          alternativeHearingList: null,
          hearingMethodList: 'TELEPHONE',
          hearingNotesText: null,
          lengthListOther: {
            lengthListOtherDays: null,
            lengthListOtherHours: null,
            lengthListOtherMinutes: null,
          },
          datesToAvoidDateDropdown: {
            datesToAvoidDates: '2023-10-16',
          },
        },
        assistedOrderCostList: 'NO_ORDER_TO_COST',
        assistedOrderCostsBespoke: null,
        assistedOrderMakeAnOrderForCosts: null,
        assistedOrderCostsReserved: null,
        publicFundingCostsProtection: 'No',
        finalOrderAppealToggle: [
          'SHOW',
        ],
        finalOrderAppealComplex: {
          list: 'CLAIMANT',
          otherText: null,
          applicationList: 'GRANTED',
          appealGrantedDropdown: {
            circuitOrHighCourtList: 'CIRCUIT_COURT',
            appealChoiceSecondDropdownA: {
              appealGrantedRefusedDate: '2023-10-30',
            },
            appealChoiceSecondDropdownB: {
              appealGrantedRefusedDate: '2023-10-30',
            },
          },
          appealRefusedDropdown: {
            circuitOrHighCourtListRefuse: null,
            appealChoiceSecondDropdownA: {
              appealGrantedRefusedDate: '2023-10-30',
            },
            appealChoiceSecondDropdownB: {
              appealGrantedRefusedDate: '2023-10-30',
            },
          },
        },
        orderMadeOnDetailsList: 'WITHOUT_NOTICE',
        orderMadeOnDetailsOrderCourt: null,
        orderMadeOnDetailsOrderWithoutNotice: {
          withOutNoticeText: 'If you were not notified of the application before this order was made, you may apply to set aside, vary or stay the order. Any such application must be made by 4pm on',
          withOutNoticeDate: '2023-10-09',
        },
        finalOrderGiveReasonsYesNo: 'No',
        finalOrderGiveReasonsComplex: null,
        finalOrderDocumentCollection: null,
        finalOrderDocument: {
          documentLink: {
            document_url: document.document_url,
            document_binary_url: document.document_binary_url,
            document_filename: document.document_filename,
          },
          documentName: 'test document',
          documentSize: 1234,
          createdDatetime: '2023-02-06T13:11:52.466Z',
          createdBy: 'CIVIL',
        },
        smallClaimsMethodInPerson: {
          value: { code: '192280'},
        },
      },
    };
    return assistedOrderData;
  },
};
