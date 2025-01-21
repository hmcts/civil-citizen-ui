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
};
