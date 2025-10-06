import request from 'supertest';
import nock from 'nock';
import config from 'config';
import {app} from '../../../../../main/app';
import {Claim} from 'common/models/claim';
import claim from '../../../../utils/mocks/civilClaimResponseMock.json';
import {VIEW_DEFENDANT_INFO} from 'routes/urls';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {CivilServiceClient} from 'client/civilServiceClient';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/app/client/civilServiceClient');

describe('View Defendant Information', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });

  });
  it('should return contact defendant details from claim ', async () => {
    const caseData = Object.assign(new Claim(), claim.case_data);
    jest.spyOn(launchDarkly, 'isDefendantNoCOnlineForCase').mockResolvedValue(false);

    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(caseData);

    await request(app)
      .get(VIEW_DEFENDANT_INFO)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('View information about the defendant');
        expect(res.text).toContain('Phone:');
        expect(res.text).toContain('Contact us for help');
        expect(res.text).toContain(claim.case_data.respondent1.partyDetails.partyName);
        expect(res.text).toContain(claim.case_data.respondent1.partyDetails.primaryAddress.addressLine1);
        expect(res.text).toContain(claim.case_data.respondent1.partyDetails.primaryAddress.addressLine2);
        expect(res.text).toContain(claim.case_data.respondent1.partyDetails.primaryAddress.addressLine3);
        expect(res.text).toContain(claim.case_data.respondent1.partyDetails.primaryAddress.postCode);
      });
  });
  it('should return contact defendant LR details from claim when NOC submitted for LiP Defendant ', async () => {
    const caseData = Object.assign(new Claim(), claim.case_data);
    jest.spyOn(launchDarkly, 'isDefendantNoCOnlineForCase').mockResolvedValue(true);
    caseData.specRespondent1Represented = YesNoUpperCamelCase.YES;
    caseData.respondentSolicitorDetails= {
      'address': {
        'PostCode': 'NN3 9SS',
        'PostTown': 'NORTHAMPTON',
        'AddressLine1': '29, SEATON DRIVE',
      },
      'orgName': 'Civil - Organisation 3',
    };

    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(caseData);
    await request(app)
      .get(VIEW_DEFENDANT_INFO)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('View information about the defendant');
        expect(res.text).toContain('Contact us for help');
        expect(res.text).toContain('29, SEATON DRIVE');
        expect(res.text).toContain('NORTHAMPTON');
        expect(res.text).toContain('NN3 9SS');
      });
  });

  it('should return contact defendant LR correspondence address details after NOC submitted and sol details updated ', async () => {
    const caseData = Object.assign(new Claim(), claim.case_data);
    jest.spyOn(launchDarkly, 'isDefendantNoCOnlineForCase').mockResolvedValue(true);
    caseData.specRespondent1Represented = YesNoUpperCamelCase.YES;
    caseData.respondentSolicitor1EmailAddress = 'abc@gmail.com';
    caseData.respondentSolicitorDetails= {
      'address': {
        'PostCode': 'NN3 9SS',
        'PostTown': 'NORTHAMPTON',
        'AddressLine1': '29, SEATON DRIVE',
      },
    };
    caseData.specRespondentCorrespondenceAddressRequired = YesNoUpperCamelCase.YES;
    caseData.specRespondentCorrespondenceAddressdetails= {
      'PostCode': 'L7 2PZ',
      'PostTown': 'ABC',
      'AddressLine1': '26, SEATON DRIVE',
    };

    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(caseData);
    await request(app)
      .get(VIEW_DEFENDANT_INFO)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('View information about the defendant');
        expect(res.text).toContain('Contact us for help');
        expect(res.text).toContain('26, SEATON DRIVE');
        expect(res.text).toContain('ABC');
        expect(res.text).toContain('L7 2PZ');
        expect(res.text).toContain('Email');
        expect(res.text).toContain('abc@gmail.com');
      });
  });
});
