module.exports = {
  makeAnOrderGA: (document) => {
    return {
      event: 'MAKE_AN_ORDER',
      caseDataUpdate: {
        judicialDecision: {
          decision: 'MAKE_AN_ORDER',
        },
        judgeTitle: 'judgeb birmin',
        bilingualHint: 'No',
        judicialDecisionMakeOrder: {
          makeAnOrder: 'APPROVE_OR_EDIT',
          judgeRecitalText: 'The Judge considered the application of the claimant dated 5 December 2024',
          orderText: 'Test order',
          judgeApproveEditOptionDoc: null,
          judgeApproveEditOptionDate: null,
          judgeApproveEditOptionDateForUnlessOrder: null,
          dismissalOrderText: 'This application is dismissed.',
          directionsText: null,
          directionsResponseByDate: null,
          judicialByCourtsInitiative: 'OPTION_1',
          orderCourtOwnInitiative: 'As this order was made on the court\'s own initiative, any party affected by the order may apply to set aside, vary, or stay the order. Any such application must be made by 4pm on',
          orderCourtOwnInitiativeDate: '2024-12-12',
          orderWithoutNotice: 'If you were not notified of the application before this order was made, you may apply to set aside, vary, or stay the order. Any such application must be made by 4pm on',
          orderWithoutNoticeDate: '2024-12-12',
          showReasonForDecision: 'No',
          reasonForDecisionText: null,
          displayjudgeApproveEditOptionDate: 'No',
          displayjudgeApproveEditOptionDoc: 'Yes',
          isOrderProcessedByStayScheduler: 'No',
          isOrderProcessedByUnlessScheduler: 'No',
          displayjudgeApproveEditOptionDateForUnlessOrder: 'No',
          showJudgeRecitalText: [
            'SHOW',
          ],
        },
        judicialMakeOrderDocPreview: {
          document_url: document.document_url,
          document_binary_url: document.document_binary_url,
          document_filename: document.document_filename,
          document_hash: document.document_hash,
        },
      },
    };
  },
  dismissAnOrderGA: (document) => {
    return {
      event: 'MAKE_AN_ORDER',
      caseDataUpdate: {
        judicialDecision: {
          decision: 'MAKE_AN_ORDER',
        },
        judgeTitle: 'judgeb birmin',
        bilingualHint: 'No',
        judicialDecisionMakeOrder: {
          makeAnOrder: 'DISMISS_THE_APPLICATION',
          judgeRecitalText: 'The Judge considered the application of the claimant dated 5 December 2024',
          orderText: 'Test order',
          judgeApproveEditOptionDoc: null,
          judgeApproveEditOptionDate: null,
          judgeApproveEditOptionDateForUnlessOrder: null,
          dismissalOrderText: 'This application is dismissed.',
          directionsText: null,
          directionsResponseByDate: null,
          judicialByCourtsInitiative: 'OPTION_1',
          orderCourtOwnInitiative: 'As this order was made on the court\'s own initiative, any party affected by the order may apply to set aside, vary, or stay the order. Any such application must be made by 4pm on',
          orderCourtOwnInitiativeDate: '2024-12-12',
          orderWithoutNotice: 'If you were not notified of the application before this order was made, you may apply to set aside, vary, or stay the order. Any such application must be made by 4pm on',
          orderWithoutNoticeDate: '2024-12-12',
          showReasonForDecision: 'No',
          reasonForDecisionText: null,
          displayjudgeApproveEditOptionDate: 'No',
          displayjudgeApproveEditOptionDoc: 'Yes',
          isOrderProcessedByStayScheduler: 'No',
          isOrderProcessedByUnlessScheduler: 'No',
          displayjudgeApproveEditOptionDateForUnlessOrder: 'No',
          showJudgeRecitalText: [
            'SHOW',
          ],
        },
        judicialMakeOrderDocPreview: {
          document_url: document.document_url,
          document_binary_url: document.document_binary_url,
          document_filename: document.document_filename,
          document_hash: document.document_hash,
        },
      },
    };
  },
  giveDirections: (document) => {
    return {
      event: 'MAKE_AN_ORDER',
      caseDataUpdate: {
        judicialDecision: {
          decision: 'MAKE_AN_ORDER',
        },
        judgeTitle: 'judgeb birmin',
        bilingualHint: 'No',
        judicialDecisionMakeOrder: {
          makeAnOrder: 'GIVE_DIRECTIONS_WITHOUT_HEARING',
          judgeRecitalText: 'The Judge considered the application of the claimant dated 5 December 2024',
          orderText: 'Test order',
          judgeApproveEditOptionDoc: null,
          judgeApproveEditOptionDate: null,
          judgeApproveEditOptionDateForUnlessOrder: null,
          dismissalOrderText: 'This application is dismissed.',
          directionsText: null,
          directionsResponseByDate: null,
          judicialByCourtsInitiative: 'OPTION_1',
          orderCourtOwnInitiative: 'As this order was made on the court\'s own initiative, any party affected by the order may apply to set aside, vary, or stay the order. Any such application must be made by 4pm on',
          orderCourtOwnInitiativeDate: '2024-12-12',
          orderWithoutNotice: 'If you were not notified of the application before this order was made, you may apply to set aside, vary, or stay the order. Any such application must be made by 4pm on',
          orderWithoutNoticeDate: '2024-12-12',
          showReasonForDecision: 'No',
          reasonForDecisionText: null,
          displayjudgeApproveEditOptionDate: 'No',
          displayjudgeApproveEditOptionDoc: 'Yes',
          isOrderProcessedByStayScheduler: 'No',
          isOrderProcessedByUnlessScheduler: 'No',
          displayjudgeApproveEditOptionDateForUnlessOrder: 'No',
          showJudgeRecitalText: [
            'SHOW',
          ],
        },
        judicialMakeOrderDocPreview: {
          document_url: document.document_url,
          document_binary_url: document.document_binary_url,
          document_filename: document.document_filename,
          document_hash: document.document_hash,
        },
      },
    };
  },
  freeFormOrder: (document) => {
    return {
      event: 'FREE_FORM_ORDER',
      caseDataUpdate: {
        judicialDecision: {
          decision: 'FREE_FORM_ORDER',
        },
        judgeTitle: 'judgeb birmin',
        bilingualHint: 'No',
        isDocumentVisible: 'No',
        orderOnCourtsList: 'ORDER_WITHOUT_NOTICE',
        CaseAccessCategory: 'SPEC_CLAIM',
        applicantPartyName: 'Sir John Doe',
        caseNameGaInternal: 'Jane Doe v John Doe',
        claimant1PartyName: 'Miss Jane Doe',
        orderWithoutNotice:{
          withoutNoticeSelectionDate: '2026-01-30',
          withoutNoticeSelectionTextArea: 'If you were not notified of the application before this order was made, you may apply to set aside, vary, or stay the order. Any such application must be made by 4pm on',
        },
        defendant1PartyName: 'Sir John Doe',
        freeFormOrderedText: 'test test',
        freeFormRecitalText: 'test test',
        gaFinalOrderDocPreview:{
          document_url: document.document_url,
          document_filename: document.document_filename,
          document_binary_url: document.document_binary_url,
          document_hash: document.document_hash,
        },
      },
    };
  },
  requestMoreInformation: (document) => {
    return {
      event: 'REQUEST_MORE_INFO',
      caseDataUpdate: {
        judicialDecision: {
          decision: 'REQUEST_MORE_INFO',
        },
        judgeTitle: 'judgeb birmin',
        bilingualHint: 'No',
        judicialDecisionRequestMoreInfo: {
          isWithNotice: 'Yes',
          judgeRecitalText: 'The Judge considered the application of the claimant dated 29 January 2025',
          judgeRequestMoreInfoByDate: '2026-02-05',
          judgeRequestMoreInfoText: 'Test request for more information',
        },
        requestForInformationDocument: [
          {
            id: '1ebaf4dd-a1e5-4d8e-801d-bf27a1a3fa99',
            value: {
              createdBy: 'Civil',
              createdDatetime: '2025-01-29T10:43:42.716255484',
              documentLink: {
                category_id: 'applications',
                document_binary_url: document.document_binary_url,
                document_filename: document.document_filename,
                document_url: document.document_url,
              },
              documentName: 'Request_for_information_for_application_2025-01-29 10:43:42.pdf',
              documentSize: 56542,
              documentType: 'REQUEST_FOR_INFORMATION',
            },
          },
        ],
      },
    };
  },
};
