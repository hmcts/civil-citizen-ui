import {CivilClaimResponse} from 'models/civilClaimResponse';
import {MOCK_MEDIATION_AGREEMENT_DOCUMENT} from '../documents/documentsMock';
import {DocumentType} from 'models/document/documentType';

export const MEDIATION_AGREEMENT_MOCK = (): CivilClaimResponse => {
  const civilClaimResponse = new CivilClaimResponse();
  civilClaimResponse.id = '1111';
  civilClaimResponse.case_data =
    {
      'totalClaimAmount': 1111,
      'mediationSettlementAgreedAt': new Date('11-04-2024'),
      'mediationAgreement': {
        'name': 'test',
        'document': MOCK_MEDIATION_AGREEMENT_DOCUMENT,
        'documentType': DocumentType.MEDIATION_AGREEMENT,
        'documentUploadedDatetime': new Date('11-04-2024'),
      },
    };
  return civilClaimResponse;
};

