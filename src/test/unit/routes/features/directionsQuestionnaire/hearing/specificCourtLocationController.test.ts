import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {
  DQ_COURT_LOCATION_URL, DQ_WELSH_LANGUAGE_URL,
} from 'routes/urls';
import * as specificCourtLocationService from 'services/features/directionsQuestionnaire/hearing/specificCourtLocationService';
import * as directionQuestionnaireService
  from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';
import {app} from '../../../../../../main/app';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('modules/oidc');
jest.mock('modules/draft-store');
jest.mock('services/features/directionsQuestionnaire/hearing/specificCourtLocationService');
jest.mock('services/features/directionsQuestionnaire/directionQuestionnaireService');

const getSpecificCourtLocation = specificCourtLocationService.getSpecificCourtLocationForm as jest.Mock;
const saveDirectionQuestionnaire = directionQuestionnaireService.saveDirectionQuestionnaire as jest.Mock;
describe('specificCourtController test', ()=>{
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on GET', ()=>{
    it('should return view successfully', async () => {
      getSpecificCourtLocation.mockImplementation(async() => {
        return new SpecificCourtLocation();
      });
      await request(app).get(DQ_COURT_LOCATION_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Please select your preferred court hearing location.');
      });
    });
    it('should show error page if there is an error', async ()=>{
      getSpecificCourtLocation.mockImplementation(async() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app).get(DQ_COURT_LOCATION_URL).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });
  describe('on POST', ()=> {

    it('should show error message when court location is required but location is not selected and reason for court locaiton is not entered', async ()=>{
      await request(app).post(DQ_COURT_LOCATION_URL).send({option: 'yes'}).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Select a court');
        expect(res.text).toContain('Tell us why you want the hearing to be held at this court');
      });
    });

    it('should redirect to next page successfully when there are no errors and yes is selected', async () =>{
      await request(app).post(DQ_COURT_LOCATION_URL).send({reason:'reason', courtLocation:'courtLocation'}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.get('location')).toBe(DQ_WELSH_LANGUAGE_URL);
      });
    });
    it('should show error page when there is an error', async ()=>{
      saveDirectionQuestionnaire.mockImplementation(async() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app).post(DQ_COURT_LOCATION_URL).send({reason:'reason', courtLocation:'courtLocation'}).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });
});
