const {date} = require('../../../api/dataHelper');
const uuid = require('uuid');

module.exports = {
  uploadMediationDocumentsClaimantOne_Citizen: () => {
    return {
      event: 'CUI_UPLOAD_MEDIATION_DOCUMENTS',
      caseDataUpdate: {
        app1MediationDocumentsReferred: [
          {
            id: uuid.v1(),
            value: {
              document: {
                category_id: 'ClaimantOneMediationDocs',
                document_url: '${TEST_DOCUMENT_URL}',
                document_filename: '${TEST_DOCUMENT_FILENAME}',
                document_binary_url: '${TEST_DOCUMENT_BINARY_URL}',
              },
              documentDate: date(-1),
              documentType: 'Doc referred',
              documentUploadedDatetime: '2024-05-01T10:51:05',
            },
          },
        ],
        app1MediationNonAttendanceDocs: [
          {
            id: uuid.v1(),
            value: {
              document: {
                category_id: 'ClaimantOneMediationDocs',
                document_url: '${TEST_DOCUMENT_URL}',
                document_filename: '${TEST_DOCUMENT_FILENAME}',
                document_binary_url: '${TEST_DOCUMENT_BINARY_URL}',
              },
              documentDate: date(-1),
              documentType: 'Non attendance doc',
              documentUploadedDatetime: '2024-05-01T10:51:05',
            },
          },
        ],
      },
    };
  },

  uploadMediationDocumentsRespondentOne_Citizen: () => {
    return {
      event: 'CUI_UPLOAD_MEDIATION_DOCUMENTS',
      caseDataUpdate: {
        res1MediationDocumentsReferred: [
          {
            id: uuid.v1(),
            value: {
              document: {
                category_id: 'RespondentOneMediationDocs',
                document_url: '${TEST_DOCUMENT_URL}',
                document_filename: '${TEST_DOCUMENT_FILENAME}',
                document_binary_url: '${TEST_DOCUMENT_BINARY_URL}',
              },
              documentDate: date(-1),
              documentType: 'Doc referred',
              documentUploadedDatetime: '2024-05-01T10:51:05',
            },
          },
        ],
        res1MediationNonAttendanceDocs: [
          {
            id: uuid.v1(),
            value: {
              document: {
                category_id: 'RespondentOneMediationDocs',
                document_url: '${TEST_DOCUMENT_URL}',
                document_filename: '${TEST_DOCUMENT_FILENAME}',
                document_binary_url: '${TEST_DOCUMENT_BINARY_URL}',
              },
              documentDate: date(-1),
              documentType: 'Non attendance doc',
              documentUploadedDatetime: '2024-05-01T10:51:05',
            },
          },
        ],
      },
    };
  },
};

