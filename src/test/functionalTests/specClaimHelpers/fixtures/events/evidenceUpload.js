module.exports = {
  evidenceUploadFastTrack: (document) => {
    return {
      event: 'EVIDENCE_UPLOAD_APPLICANT',
      caseDataUpdate: {
        caseProgAllocatedTrack: 'FAST_CLAIM',
        caseTypeFlag: 'do_not_show',
        disclosureSelectionEvidence: [
          'DISCLOSURE_LIST',
          'DOCUMENTS_FOR_DISCLOSURE',
        ],
        witnessSelectionEvidence: [
          'WITNESS_STATEMENT',
          'WITNESS_SUMMARY',
          'NOTICE_OF_INTENTION',
          'DOCUMENTS_REFERRED',
        ],
        expertSelectionEvidence: [
          'EXPERT_REPORT',
          'JOINT_STATEMENT',
          'QUESTIONS_FOR_EXPERTS',
          'ANSWERS_FOR_EXPERTS',
        ],
        trialSelectionEvidence: [
          'CASE_SUMMARY',
          'SKELETON_ARGUMENT',
          'AUTHORITIES',
          'COSTS',
          'DOCUMENTARY',
        ],
        documentDisclosureList: [
          {
            value: {
              createdDatetime: null,
              documentUpload: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: 'Order_2023-10-09.pdf',
              },
            },
            id: null,
          },
        ],
        documentForDisclosure: [
          {
            value: {
              typeOfDocument: 'Testing',
              documentIssuedDate: '2023-03-01',
              createdDatetime: null,
              documentUpload: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: 'fast_track_sdo_000MC014.pdf',
              },
            },
            id: null,
          },
        ],
        documentWitnessStatement: [
          {
            value: {
              witnessOptionName: 'Witness Nae',
              witnessOptionUploadDate: '2023-03-01',
              createdDatetime: null,
              witnessOptionDocument: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: 'hearing_small_claim_000MC013.pdf',
              },
            },
            id: null,
          },
        ],
        documentWitnessSummary: [
          {
            value: {
              witnessOptionName: 'Suary 23',
              witnessOptionUploadDate:'2020-01-01',
              createdDatetime: null,
              witnessOptionDocument: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: '000MC038-claim-response.pdf',
              },
            },
            id: null,
          },
        ],
        documentHearsayNotice: [
          {
            value: {
              witnessOptionName: 'Witness',
              witnessOptionUploadDate: '2023-03-01',
              createdDatetime: null,
              witnessOptionDocument: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: 'fast_track_sdo_000MC014.pdf',
              },
            },
            id: null,
          },
        ],
        documentReferredInStatement: [
          {
            value: {
              witnessOptionName:'john',
              typeOfDocument: 'Upper',
              documentIssuedDate: '2023-01-01',
              createdDatetime: null,
              documentUpload: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: 'Order_2023-10-09.pdf',
              },
            },
            id: null,
          },
        ],
        documentExpertReport: [
          {
            value: {
              expertOptionName: 'nae',
              expertOptionExpertise: 'Expertise',
              expertOptionUploadDate: '2023-03-02',
              createdDatetime: null,
              expertDocument: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: '000MC038-claim-response.pdf',
              },
            },
            id: null,
          },
        ],
        documentJointStatement: [
          {
            value: {
              expertOptionName: 'Nae',
              expertOptionExpertises: 'expertise',
              expertOptionUploadDate: '2023-04-01',
              createdDatetime: null,
              expertDocument: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: 'Order_2023-10-09.pdf',
              },
            },
            id: null,
          },
        ],
        documentQuestions: [
          {
            value: {
              expertOptionName: 'testing',
              expertOptionOtherParty: 'Party',
              expertDocumentQuestion: 'Document',
              expertOptionUploadDate: '2023-04-01',
              createdDatetime: null,
              expertDocument: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: 'fast_track_sdo_000MC014.pdf',
              },
            },
            id: null,
          },
        ],
        documentAnswers: [
          {
            value: {
              expertOptionName: 'Ep',
              expertOptionOtherParty: 'Other party',
              expertDocumentAnswer: 'Question',
              expertOptionUploadDate: '2023-03-10',
              createdDatetime: null,
              expertDocument: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: 'hearing_small_claim_000MC013.pdf',
              },
            },
            id: null,
          },
        ],
        documentCaseSummary: [
          {
            value: {
              createdDatetime: null,
              documentUpload: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: 'Order_2023-10-09.pdf',
              },
            },
            id: null,
          },
        ],
        documentSkeletonArgument: [
          {
            value: {
              createdDatetime: null,
              documentUpload: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: 'fast_track_sdo_000MC014.pdf',
              },
            },
            id: null,
          },
        ],
        documentAuthorities: [
          {
            value: {
              createdDatetime: null,
              documentUpload: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: '000MC038-claim-response.pdf',
              },
            },
            id: null,
          },
        ],
        documentCosts: [
          {
            value: {
              createdDatetime: null,
              documentUpload: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: 'hearing_small_claim_000MC013.pdf',
              },
            },
            id: null,
          },
        ],
        documentEvidenceForTrial: [
          {
            value: {
              typeOfDocument: 'Deadline',
              documentIssuedDate: '2023-02-01',
              createdDatetime: null,
              documentUpload: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: 'fast_track_sdo_000MC014.pdf',
              },
            },
            id: null,
          },
        ],
        documentDisclosureListApp2: [],
        documentForDisclosureApp2: [],
        documentWitnessStatementApp2: [],
        documentWitnessSummaryApp2: [],
        documentHearsayNoticeApp2: [],
        documentReferredInStatementApp2: [],
        documentExpertReportApp2: [],
        documentJointStatementApp2: [],
        documentQuestionsApp2: [],
        documentAnswersApp2: [],
        documentCaseSummaryApp2: [],
        documentSkeletonArgumentApp2: [],
        documentAuthoritiesApp2: [],
        documentCostsApp2: [],
        documentEvidenceForTrialApp2: [],
        caseDocumentUploadDate: null,
      },
    };
  },
  evidenceUploadSmallClaims: (document) => {
    return {
      event: 'EVIDENCE_UPLOAD_APPLICANT',
      caseDataUpdate: {
        caseProgAllocatedTrack: 'SMALL_CLAIM',
        caseTypeFlag: 'do_not_show',

        witnessSelectionEvidenceSmallClaim: [
          'WITNESS_STATEMENT',
          'WITNESS_SUMMARY',
          'DOCUMENTS_REFERRED',
        ],
        expertSelectionEvidenceSmallClaim: [
          'EXPERT_REPORT',
          'JOINT_STATEMENT',
        ],
        trialSelectionEvidenceSmallClaim: [
          'AUTHORITIES',
          'COSTS',
          'DOCUMENTARY',
        ],
        documentWitnessStatement: [
          {
            value: {
              witnessOptionName: 'Witness Nae',
              witnessOptionUploadDate: '2023-03-01',
              createdDatetime: null,
              witnessOptionDocument: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: 'hearing_small_claim_000MC013.pdf',
              },
            },
            id: null,
          },
        ],
        documentWitnessSummary: [
          {
            value: {
              witnessOptionName: 'Suary 23',
              witnessOptionUploadDate:'2020-01-01',
              createdDatetime: null,
              witnessOptionDocument: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: '000MC038-claim-response.pdf',
              },
            },
            id: null,
          },
        ],
        documentReferredInStatement: [
          {
            value: {
              witnessOptionName:'john',
              typeOfDocument: 'Upper',
              documentIssuedDate: '2023-01-01',
              createdDatetime: null,
              documentUpload: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: 'Order_2023-10-09.pdf',
              },
            },
            id: null,
          },
        ],
        documentExpertReport: [
          {
            value: {
              expertOptionName: 'nae',
              expertOptionExpertise: 'Expertise',
              expertOptionUploadDate: '2023-03-02',
              createdDatetime: null,
              expertDocument: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: '000MC038-claim-response.pdf',
              },
            },
            id: null,
          },
        ],
        documentJointStatement: [
          {
            value: {
              expertOptionName: 'Nae',
              expertOptionExpertises: 'expertise',
              expertOptionUploadDate: '2023-04-01',
              createdDatetime: null,
              expertDocument: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: 'Order_2023-10-09.pdf',
              },
            },
            id: null,
          },
        ],
        documentAuthorities: [
          {
            value: {
              createdDatetime: null,
              documentUpload: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: '000MC038-claim-response.pdf',
              },
            },
            id: null,
          },
        ],
        documentCosts: [
          {
            value: {
              createdDatetime: null,
              documentUpload: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: 'hearing_small_claim_000MC013.pdf',
              },
            },
            id: null,
          },
        ],
        documentEvidenceForTrial: [
          {
            value: {
              typeOfDocument: 'Deadline',
              documentIssuedDate: '2023-02-01',
              createdDatetime: null,
              documentUpload: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: 'fast_track_sdo_000MC014.pdf',
              },
            },
            id: null,
          },
        ],
        caseDocumentUploadDate: null,
      },
    };
  },
};
