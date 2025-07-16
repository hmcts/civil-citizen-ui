const uploadTranslatedDoc = (document, translationDocType) => {
  const userData = {
    userInput: {
      UploadTranslatedDocument: {
        'translatedDocuments': [
          {
            'value': {
              'documentType': translationDocType,
              'file': {
                document_url: document.document_url,
                document_binary_url: document.document_binary_url,
                'document_filename': 'notice_of_discontinuance_000MC022.pdf',
              },
            },
            'id': null,
          },
        ],
      },
    },
  };
  return userData;
};

module.exports = uploadTranslatedDoc;
