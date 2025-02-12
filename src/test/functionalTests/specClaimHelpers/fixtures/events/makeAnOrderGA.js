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
        judgeTitle: 'Angel Morgan',
        bilingualHint: 'No',
        judicialDecisionMakeOrder: {
          dismissalOrderText: 'This application is dismissed.',
          displayjudgeApproveEditOptionDate: 'No',
          displayjudgeApproveEditOptionDateForUnlessOrder: 'No',
          displayjudgeApproveEditOptionDoc: 'No',
          isOrderProcessedByStayScheduler: 'No',
          isOrderProcessedByUnlessScheduler: 'No',
          judgeRecitalText: 'The Judge considered the without notice application of the claimant dated 31 January 2025\n\nAnd the Judge considered the information provided by the claimant',
          judicialByCourtsInitiative: 'OPTION_1',
          makeAnOrder: 'DISMISS_THE_APPLICATION',
          orderCourtOwnInitiative: 'As this order was made on the court\'s own initiative, any party affected by the order may apply to set aside, vary, or stay the order. Any such application must be made by 4pm on',
          orderCourtOwnInitiativeDate: '2026-02-07',
          orderText: 'Test order',
          orderWithoutNotice: 'If you were not notified of the application before this order was made, you may apply to set aside, vary, or stay the order. Any such application must be made by 4pm on',
          orderWithoutNoticeDate: '2025-02-07',
          showJudgeRecitalText: [
            'SHOW',
          ],
          showReasonForDecision: 'No',
        },
        dismissalOrderDocument: [
          {
            id: '41274b4c-a200-4a35-848e-af503c2fe929',
            value: {
              createdBy: 'Civil',
              createdDatetime: '2025-01-31T15:44:23.995901465',
              documentLink: {
                category_id: 'ordersMadeOnApplications',
                document_binary_url: document.document_binary_url,
                document_filename: document.document_filename,
                document_url: document.document_url,
              },
              documentName: 'Dismissal_order_for_application_2025-01-31 15:44:23.pdf',
              documentSize: 41057,
              documentType: 'DISMISSAL_ORDER',
            },
          },
        ],
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
          directionsResponseByDate: '2026-02-20',
          directionsText: 'test order',
          dismissalOrderText: 'This application is dismissed.',
          displayjudgeApproveEditOptionDate: 'No',
          displayjudgeApproveEditOptionDateForUnlessOrder: 'No',
          displayjudgeApproveEditOptionDoc: 'No',
          isOrderProcessedByStayScheduler: 'No',
          isOrderProcessedByUnlessScheduler: 'No',
          judgeRecitalText: 'The Judge considered the without notice application of the claimant dated 31 January 2025\n\nAnd the Judge considered the information provided by the claimant',
          judicialByCourtsInitiative: 'OPTION_2',
          makeAnOrder: 'GIVE_DIRECTIONS_WITHOUT_HEARING',
          orderCourtOwnInitiative: 'As this order was made on the court\'s own initiative, any party affected by the order may apply to set aside, vary, or stay the order. Any such application must be made by 4pm on',
          orderCourtOwnInitiativeDate: '2025-02-07',
          orderText: 'Test order',
          orderWithoutNotice: 'If you were not notified of the application before this order was made, you may apply to set aside, vary, or stay the order. Any such application must be made by 4pm on',
          orderWithoutNoticeDate: '2026-02-07',
          showJudgeRecitalText: [
            'SHOW',
          ],
          showReasonForDecision: 'No',
        },
        directionOrderDocument: [
          {
            id: '0a2c7796-b4e6-4961-8539-fcee7dadce3c',
            value: {
              createdBy: 'Civil',
              createdDatetime: '2025-01-31T16:17:36.62323274',
              documentLink: {
                category_id: 'ordersMadeOnApplications',
                document_binary_url: document.document_binary_url,
                document_filename: document.document_filename,
                document_url: document.document_url,
              },
              documentName: 'Directions_order_for_application_2025-01-31 16:17:36.pdf',
              documentSize: 41097,
              documentType: 'DIRECTION_ORDER',
            },
          },
        ],
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
        caseNameHmctsInternal: 'Miss Jane Doe v Sir John Doe',
        freeFormOrderedText: 'test test',
        freeFormRecitalText: 'test test',
        orderOnCourtsList: 'NOT_APPLICABLE',
        gaFinalOrderDocPreview: {
          document_url: document.document_url,
          document_filename: document.document_filename,
          document_binary_url: document.document_binary_url,
        },
        generalOrderDocument: [
          {
            id: 'e6fad1f6-0e7a-4696-aafc-2180a648da3c',
            value: {
              createdBy: 'Civil',
              createdDatetime: '2025-01-31T16:34:14.009499792',
              documentLink: {
                category_id: 'ordersMadeOnApplications',
                document_url: document.document_url,
                document_filename: document.document_filename,
                document_binary_url: document.document_binary_url,
              },
              documentName: 'General_order_for_application_2025-01-31 16:34:13.pdf',
              documentSize: 39128,
              documentType: 'GENERAL_ORDER',
            },
          },
        ],
      },
    };
  },
  withoutNoticeToWith: (document) => {
    return {
      event: 'MAKE_DECISION',
      caseDataUpdate: {
        judicialDecision: {
          decision: 'REQUEST_MORE_INFO',
        },
        judgeTitle: 'Angel Morgan',
        generalAppPBADetails: {
          additionalPaymentServiceRef: '2025-1750001396097',
          fee: {
            calculatedAmountInPence: '18400',
            code: 'FEE0444',
            version: '3',
          },
          paymentDetails: {
            reference: 'RC-1738-3429-3519-7932',
            status: 'SUCCESS',
          },
          serviceRequestReference: '2025-1750001396088',
        },
        applicationIsCloaked: 'No',
        applicationIsUncloakedOnce: 'Yes',
        judicialDecisionRequestMoreInfo: {
          isWithNotice: 'No',
          judgeRecitalText: 'The Judge considered the without notice application of the defendant dated 31 January 2025\n\nAnd the Judge considered the information provided by the defendant',
          judgeRequestMoreInfoByDate: '2025-02-07',
          requestMoreInfoOption: 'SEND_APP_TO_OTHER_PARTY',
        },
        requestForInformationDocument: [
          {
            id: 'f8711277-b154-4a2b-98bf-59ac064e6aa2',
            value: {
              createdBy: 'Civil',
              createdDatetime: '2025-01-31T16:52:18.73848318',
              documentLink: {
                category_id: 'applications',
                document_url: document.document_url,
                document_filename: document.document_filename,
                document_binary_url: document.document_binary_url,
              },
            },
          },
        ],
      },
    };
  },

  writtenRepresentations: (document) => {
    return {
      event: 'MAKE_DECISION',
      caseDataUpdate: {
        judicialDecision: {
          decision: 'MAKE_ORDER_FOR_WRITTEN_REPRESENTATIONS',
        },
        applicationIsCloaked: 'No',
        directionInRelationToHearingText: 'Test order',
        judgeRecitalText: 'The Judge considered the application of the claimant dated 10 February 2025',
        judgeTitle: 'judgeb birmin',
        judicialByCourtsInitiativeForWrittenRep: 'OPTION_1',
        judicialConcurrentDateText: 'The claimant and defendant should upload any written submissions and evidence by 4pm on 24 February 2025',
        judicialDecisionMakeAnOrderForWrittenRepresentations: {
          makeAnOrderForWrittenRepresentations: 'CONCURRENT_REPRESENTATIONS',
          sequentialApplicantMustRespondWithin: '2026-03-03',
          writtenConcurrentRepresentationsBy: '2026-02-24',
          writtenSequentailRepresentationsBy: '2026-02-24',
        },
        orderCourtOwnInitiativeForWrittenRep: {
          orderCourtOwnInitiative: 'As this order was made on the court\'s own initiative, any party affected by the order may apply to set aside, vary, or stay the order. Any such application must be made by 4pm on',
          orderCourtOwnInitiativeDate: '2026-02-17',
        },
        writtenRepConcurrentDocument: [
          {
            id: '8d043ac4-ca10-49c9-9c07-e1ed70273f8a',
            value: {
              createdBy: 'Civil',
              createdDatetime: '2025-02-10T15:19:41.207231403',
              documentLink: {
                category_id: 'applications',
                document_binary_url: document.document_binary_url,
                document_filename: document.document_filename,
                document_url: document.document_url,
              },
              documentName: 'Order_Written_Representation_Concurrent_for_application_2025-02-10 15:19:41.pdf',
              documentSize: 58957,
              documentType: 'WRITTEN_REPRESENTATION_CONCURRENT',
            },
          },
        ],
      },
    };
  },
};
