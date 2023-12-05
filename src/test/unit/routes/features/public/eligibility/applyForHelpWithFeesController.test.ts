import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  ELIGIBILITY_APPLY_HELP_WITH_FEES_URL,
  ELIGIBILITY_HELP_WITH_FEES_REFERENCE_URL,
} from '../../../../../../main/routes/urls';

describe('Some useful information about Help with Fees Controller', () => {

  describe('on GET', () => {
    it('should render Some info about Help with Fees page successfully', async () => {
      const res = await request(app).get(ELIGIBILITY_APPLY_HELP_WITH_FEES_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Apply For Help With Fees');
    });

    describe('on POST', () => {
      it('should redirect to Apply Help Fees Reference page', async () => {
        const res = await request(app).post(ELIGIBILITY_APPLY_HELP_WITH_FEES_URL);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(ELIGIBILITY_HELP_WITH_FEES_REFERENCE_URL);
      });
    });
  });
});
