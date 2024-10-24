module.exports = {
  uploadDoc: (document) => {
    return {
      event: 'UPLOAD_TRANSLATED_DOCUMENT',
      caseDataUpdate: {

        translatedDocuments: [
          {
            value: {
              documentType: 'CLAIM_ISSUE',
              file: {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                document_filename: 'test.pdf',
              },
            },
            id: null,
          },
        ],
      },
    };
  },
};
