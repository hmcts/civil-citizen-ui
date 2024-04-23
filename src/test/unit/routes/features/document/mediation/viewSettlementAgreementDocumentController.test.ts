import config from 'config';
import nock from 'nock';
import {VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT} from 'routes/urls';
import request from 'supertest';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';

import {Claim} from 'models/claim';
import {MediationAgreement} from 'models/mediation/mediationAgreement';
import {DocumentType} from 'models/document/documentType';
import {MOCK_MEDIATION_AGREEMENT_DOCUMENT} from '../../../../../utils/mocks/documents/documentsMock';
import {app} from '../../../../../../main/app';
import {CaseRole} from 'form/models/caseRoles';
import {MEDIATION_AGREEMENT_MOCK} from '../../../../../utils/mocks/Mediation/mediationAgreementMock';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');

const civilServiceUrl = config.get<string>('services.civilService.url');
const claimId = '123';

describe('view mediation settlement agreement document controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  const claim = new Claim();
  claim.id = claimId;

  claim.mediationSettlementAgreedAt = new Date('2024-01-01');
  claim.mediationAgreement = {
    name: 'fileName',
    documentType: DocumentType.MEDIATION_AGREEMENT,
    document: MOCK_MEDIATION_AGREEMENT_DOCUMENT,
  } as MediationAgreement;

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    nock(civilServiceUrl)
      .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
      .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
  });

  describe('on Get', () => {
    it('should view mediation agreement ', async () => {
      //Given
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, MEDIATION_AGREEMENT_MOCK());
      //then
      await request(app)
        .get(VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VIEW_MEDIATION_SETTLEMENT_AGREEMENT);
        });
    });

    it('should return http 500 when has error', async () => {
      //given
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(500);

      //then
      await request(app)
        .get(VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
