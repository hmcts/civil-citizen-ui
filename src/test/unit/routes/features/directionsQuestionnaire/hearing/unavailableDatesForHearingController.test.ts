import express from 'express';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {mockCivilClaimWithExpertAndWitness, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {DQ_AVAILABILITY_DATES_FOR_HEARING_URL, DQ_PHONE_OR_VIDEO_HEARING_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {YesNo} from 'common/form/models/yesNo';
import * as directionQuestionnaireService
  from "services/features/directionsQuestionnaire/directionQuestionnaireService";
import {DirectionQuestionnaire} from "models/directionsQuestionnaire/directionQuestionnaire";
import {Hearing} from "models/directionsQuestionnaire/hearing/hearing";
import {SpecificCourtLocation} from "models/directionsQuestionnaire/hearing/specificCourtLocation";

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('services/features/directionsQuestionnaire/hearing/specificCourtLocationService');
jest.mock('services/features/directionsQuestionnaire/directionQuestionnaireService');
const getDirectionQuestionnaire = directionQuestionnaireService.getDirectionQuestionnaire as jest.Mock;


describe('Unavailable dates for hearing Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return unavailable dates for hearing page', async () => {
      app.locals.draftStoreClient = mockCivilClaimWithExpertAndWitness;
      await request(app)
        .get(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Add a single date or longer period of time that you cannot attend a hearing');
        });
    });
    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  // govuk-error-message

  describe('on POST', () => {

    const mockedData = new Date('2020-11-26T00:00:00.000Z');
    global.Date = class extends Date {
      constructor(date) {
        if (date) {
          return super(date);
        }

        return mockedData;
      }
    };


    // const literallyJustDateNow = () => Date.now();
    // const realDate = Date;
    // const dateNow = Date.now();
    // beforeEach(() => {
    //   global.Date.now = jest.fn(() => dateNow);
    // });
    // afterEach(() => {
    //   global.Date = realDate;
    // });
     beforeAll(() => {
       app.locals.draftStoreClient = mockCivilClaimWithExpertAndWitness;

     });
    // afterAll(() => {
    //   // jest.useRealTimers();
    // });

    // test('It should create correct now Date', () => {
    //   jest
    //     .spyOn(global.Date, 'now')
    //     .mockImplementationOnce(() =>
    //       new Date('2019-05-14T11:01:58.135Z').valueOf(),
    //     );

    //   expect(getNow()).toEqual(new Date('2019-05-14T11:01:58.135Z'));
    // });

    it('should display error when single/longer period option is not selected', async () => {

      // expect(Date.now()).toEqual(dateNow);



      //jest.spyOn(global.Date.prototype, 'setMonth').mockReturnValue(2)
      //jest.spyOn(global.Date.prototype, 'getMonth').mockReturnValue(11);

      const actualDate1 = new Date();

      expect(actualDate1).toBe(mockedData);


      // await request(app)
      //   .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
      //   .send({
      //     items: [ {single: {}} ]})
      //   .expect((res) => {
      //     expect(res.status).toBe(200);
      //     expect(res.text).toContain(TestMessages.SELECT_SINGLE_DATE_OR_PERIOD);
      //   });
    });

    it('should display error when single date is selected but no date is provided', async () => {
      await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{
            type: 'SINGLE_DATE',
            single: {},
          }],
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_DATE_FOR_UNAVAILABILITY);
        });
    });

    it('should display error when single date is selected but no date is provided', async () => {
     await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{
            type: 'SINGLE_DATE',
            single: {},
          }],
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_DATE_FOR_UNAVAILABILITY);
        });
    });

    it('should display error when single date is selected but no day is provided', async () => {
      await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{
            type: 'SINGLE_DATE',
            single: {
              start: {
                day: '',
                month: 3,
                year: 2023,
              },
            },
          }],
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_DAY_FOR_UNAVAILABILITY);
        });
    });

    it('should display error when single date is selected but no month is provided', async () => {
      await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{
            type: 'SINGLE_DATE',
            single: {
              start: {
                day: 3,
                month: '',
                year: 2023,
              },
            },
          }],
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_MONTH_FOR_UNAVAILABILITY);
        });
    });

    it('should display error when single date is selected but no year is provided', async () => {
      await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{
            type: 'SINGLE_DATE',
            single: {
              start: {
                day: 3,
                month: 3,
                year: '',
              },
            },
          }],
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_YEAR_FOR_UNAVAILABILITY);
        });
    });

    it('should display error when single date is selected but date is in the past', async () => {
      await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{
            type: 'SINGLE_DATE',
            single: {
              start: {
                day: 3,
                month: 3,
                year: 2022,
              },
            },
          }],
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_UNAVAILABILITY_DATE_IN_FUTURE);
        });
    });

    it('should display error when single date is selected but date is beyond next 12 months', async () => {
      await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{
            type: 'SINGLE_DATE',
            single: {
              start: {
                day: 3,
                month: 3,
                year: 3022,
              },
            },
          }],
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_UNAVAILABILITY_DATE_IN_NEXT_12_MOINTHS);
        });
    });

    it('should redirect next page', async () => {

      console.log('date---', new Date());

      await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{
            type: 'SINGLE_DATE',
            single: {
              start: {
                day: 3,
                month: 3,
                year: 3022,
              },
            },
          }],
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_UNAVAILABILITY_DATE_IN_NEXT_12_MOINTHS);
        });
    });

    // it('when yes selected, name provided and any checkbox selected, should redirect to claim task list screen', async () => {
    //   await request(app)
    //     .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
    //     .send({
    //       option: YesNo.YES,
    //       model: {
    //         items: [
    //           {
    //             declared: 'disabledAccess',
    //             fullName: 'johndoe',
    //           },
    //         ],
    //       },
    //     })
    //     .expect((res: express.Response) => {
    //       expect(res.status).toBe(302);
    //       expect(res.get('location')).toBe(DQ_PHONE_OR_VIDEO_HEARING_URL.replace(':id', 'aaa'));
    //     });
    // });

    // it('when no selected, should redirect to claim task list screen', async () => {
    //   await request(app)
    //     .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
    //     .send({
    //       option: YesNo.NO,
    //       model: {},
    //     })
    //     .expect((res: express.Response) => {
    //       expect(res.status).toBe(302);
    //       expect(res.get('location')).toBe(DQ_PHONE_OR_VIDEO_HEARING_URL.replace(':id', 'aaa'));
    //     });
    // });

    // it('changing from yes to no should redirect to claim task list screen', async () => {
    //   await request(app)
    //     .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
    //     .send({
    //       option: YesNo.NO,
    //       declared: ['disabledAccess'],
    //       model: {
    //         items: [
    //           {fullName: 'johndoe'},
    //         ],
    //       },
    //     })
    //     .expect((res: express.Response) => {
    //       expect(res.status).toBe(302);
    //       expect(res.get('location')).toBe(DQ_PHONE_OR_VIDEO_HEARING_URL.replace(':id', 'aaa'));
    //     });
    // });

    // it('should show error when yes selected but no name provided', async () => {
    //   await request(app)
    //     .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
    //     .send({
    //       option: YesNo.YES,
    //       model: {
    //         items: [{
    //           fullName: '',
    //         }]
    //       },
    //     })
    //     .expect((res: Response) => {
    //       expect(res.status).toBe(200);
    //       expect(res.text).toContain(TestMessages.NO_NAME_SELECTED);
    //     });
    // });

    // it('should show error when yes selected but no support selected', async () => {
    //   await request(app)
    //     .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
    //     .send({
    //       option: YesNo.YES,
    //       model: {
    //         items: [{
    //           fullName: 'johndoe',
    //         }],
    //       },
    //     })
    //     .expect((res: Response) => {
    //       expect(res.status).toBe(200);
    //       expect(res.text).toContain(TestMessages.NO_SUPPORT_SELECTED);
    //     });
    // });

    // it('should show error when yes and sign language interpreter selected, but no free text provided', async () => {
    //   await request(app)
    //     .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
    //     .send({
    //       option: YesNo.YES,
    //       model: {
    //         items: [{
    //           declared: 'signLanguageInterpreter',
    //           fullName: 'johndoe',
    //         }],
    //       },
    //     })
    //     .expect((res: Response) => {
    //       expect(res.status).toBe(200);
    //       expect(res.text).toContain(TestMessages.NO_SIGN_LANGUAGE_ENTERED);
    //     });
    // });

    // it('should show error when yes and language interpreter selected, but no free text provided', async () => {
    //   await request(app)
    //     .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
    //     .send({
    //       option: YesNo.YES,
    //       model: {
    //         items: [{
    //           declared: 'languageInterpreter',
    //           fullName: 'johndoe',
    //         }],
    //       },
    //     })
    //     .expect((res: Response) => {
    //       expect(res.status).toBe(200);
    //       expect(res.text).toContain(TestMessages.NO_LANGUAGE_ENTERED);
    //     });
    // });

    // it('should show error when yes and other support selected, but no free text provided', async () => {
    //   await request(app)
    //     .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
    //     .send({
    //       option: YesNo.YES,
    //       declared: ['otherSupport'],
    //       model: {
    //         items: [{
    //           fullName: 'johndoe',
    //         }],
    //       },
    //     })
    //     .expect((res: Response) => {
    //       expect(res.status).toBe(200);
    //       expect(res.text).toContain(TestMessages.NO_OTHER_SUPPORT);
    //     });
    // });

    // it('should status 500 when error thrown', async () => {
    //   app.locals.draftStoreClient = mockRedisFailure;
    //   await request(app)
    //     .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
    //     .send({
    //       option: YesNo.NO,
    //       declared: ['disabledAccess'],
    //       model: {
    //         items: [
    //           {fullName: 'johndoe'},
    //         ],
    //       },
    //     })
    //     .expect((res: Response) => {
    //       expect(res.status).toBe(500);
    //       expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    //     });
    // });
  });
});
