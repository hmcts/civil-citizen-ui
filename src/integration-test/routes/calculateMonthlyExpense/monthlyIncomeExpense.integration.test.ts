import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';
import {app} from '../../../main/app';
import {TOTAL_AMOUNT_CALCULATION_URL} from '../../../main/routes/urls';

describe('Integration: monthly income and expense calculation', () => {
  it('returns the monthly total for the posted amounts', async () => {
    const response = await request(app)
      .post(TOTAL_AMOUNT_CALCULATION_URL)
      .send([{amount: '100', schedule: 'MONTH'}, {amount: '10', schedule: 'MONTH'}]);

    expect(response.status).toBe(200);
    expect(response.text).toContain('110');
  });
});
