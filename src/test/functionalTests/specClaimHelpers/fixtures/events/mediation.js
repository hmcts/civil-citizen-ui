module.exports = {
  mediationSuccessfulPayload: () => {
    return {
      event: 'MEDIATION_SUCCESSFUL',
      caseData: {
        mediationSettlementAgreedAt: '2022-09-09',
        mediationAgreement: {
          name: 'staff uploaded doc',
          document: {
            document_url: '${TEST_DOCUMENT_URL}',
            document_binary_url: '${TEST_DOCUMENT_BINARY_URL}',
            document_filename: '${TEST_DOCUMENT_FILENAME}',
          },
          documentType: 'MEDIATION_AGREEMENT',
        },
        manageDocuments: [
          {
            id: '8e99d71c-883c-4486-a804-f5ce4f8c2dd3',
            value: {
              documentLink: {
                document_url: '${TEST_DOCUMENT_URL}',
                document_binary_url: '${TEST_DOCUMENT_BINARY_URL}',
                document_filename: '${TEST_DOCUMENT_FILENAME}',
              },
              documentName: 'staff uploaded doc',
              documentType: 'MEDIATION_AGREEMENT',
              createdDatetime: '2022-09-09T15:13:54',
            },
          },
        ],
      },
    };
  },

  mediationUnSuccessfulPayload: (carmEnabled = true, mediationReason) => {
    return {
      event: 'MEDIATION_UNSUCCESSFUL',
      caseData: mediationUnsuccessfulPayload(carmEnabled, mediationReason),
    };
  },
};

const mediationUnsuccessfulPayload = (carmEnabled, mediationReason) => {
  let payload;
  if (carmEnabled) {
    payload = {
      mediationUnsuccessfulReasonsMultiSelect: mediationReason,
      // list of mediation reasons:
      // ['PARTY_WITHDRAWS', 'APPOINTMENT_NOT_ASSIGNED', 'NOT_CONTACTABLE_CLAIMANT_ONE', 'NOT_CONTACTABLE_CLAIMANT_TWO', 'NOT_CONTACTABLE_DEFENDANT_ONE', 'NOT_CONTACTABLE_DEFENDANT_TWO']
    };
  } else {
    payload = {
      unsuccessfulMediationReason: 'PARTY_WITHDRAWS',
    };
  }
  return payload;
};
