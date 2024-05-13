import {app} from '../../../../../../main/app';
import request from 'supertest';
import {GA_APPLICATION_COSTS_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {getApplicationCostsContent} from 'services/features/generalApplication/applicationCostsService';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/services/features/generalApplication/applicationCostsService');

describe('General Application - Application costs', () => {
  const mockContent = getApplicationCostsContent as jest.Mock;
  mockContent.mockImplementation(() => {
    return new PageSectionBuilder().build();
  });

  describe('on GET', () => {
    it('should return page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;

      await request(app)
        .get(GA_APPLICATION_COSTS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.APPLICATION_COSTS.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(GA_APPLICATION_COSTS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
