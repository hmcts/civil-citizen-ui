module.exports = {
  mediationSuccessfulPayload: () => {
    return {
      event: 'MEDIATION_SUCCESSFUL',
      caseData: {
        mediationSettlementAgreedAt: '2022-09-09',
        mediationAgreement: {
          name: 'staff uploaded doc',
          documentType: 'MEDIATION_AGREEMENT',
          document: {
            document_url: 'http://dm-store-aat.service.core-compute-aat.internal/documents/7b5de1e5-38c3-4962-8c46-f50a2a29bb7e',
            document_binary_url: 'http://dm-store-aat.service.core-compute-aat.internal/documents/7b5de1e5-38c3-4962-8c46-f50a2a29bb7e/binary',
            document_filename: '000MC038-claim-response.pdf',
          },
        },
      },
    };
  },

  mediationUnSuccessfulPayload: (carmEnabled = false) => {
    return {
      event: 'MEDIATION_UNSUCCESSFUL',
      caseData: mediationUnsuccessfulPayload(carmEnabled),
    };
  },
};

const mediationUnsuccessfulPayload = (carmEnabled) => {
  let payload;
  if (carmEnabled) {
    payload = {
      mediationUnsuccessfulReasonsMultiSelect: ['PARTY_WITHDRAWS', 'APPOINTMENT_NOT_ASSIGNED', 'NOT_CONTACTABLE_CLAIMANT_TWO'],
    };
  } else {
    payload = {
      unsuccessfulMediationReason: 'PARTY_WITHDRAWS',
    };
  }
  return payload;
};
