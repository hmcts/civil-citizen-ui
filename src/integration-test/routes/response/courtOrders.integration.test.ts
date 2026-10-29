import express from 'express';
import request from 'supertest';
import path from 'path';
import {GenericForm} from 'form/models/genericForm';
import {CourtOrders} from 'form/models/statementOfMeans/courtOrders/courtOrders';

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(() => 'court-order-fixture'),
  getCaseDataFromStore: jest.fn().mockResolvedValue({}),
  saveDraftClaim: jest.fn().mockResolvedValue(undefined),
}));

import courtOrdersController from '../../../main/routes/features/response/statementOfMeans/courtOrders/courtOrdersController';
import {CITIZEN_COURT_ORDERS_URL, CITIZEN_PRIORITY_DEBTS_URL} from 'routes/urls';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';

// Actual router, service, form conversion and validation. Template rendering is
// checked separately against the real macros in the component tests.
const app = express();
app.set('views', path.resolve(__dirname, '../../../main/views'));
app.set('view engine', 'njk');
app.engine('njk', (_path, options, callback) => {
  const form = (options as {form: GenericForm<CourtOrders>}).form;
  callback(null, JSON.stringify({model: form.model, errors: form.getAllErrors()}));
});
app.use(express.urlencoded({extended: true}));
app.use((_req, res, next) => {
  res.type('json');
  next();
});
app.use(courtOrdersController);

function payload(count: number) {
  const params = new URLSearchParams({declared: 'yes'});
  for (let index = 0; index < count; index++) {
    params.set(`rows[${index}][claimNumber]`, `CN${index}`);
    params.set(`rows[${index}][amount]`, '100');
    params.set(`rows[${index}][instalmentAmount]`, '0');
  }
  return params.toString();
}

describe('court-order submission limit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getCaseDataFromStore as jest.Mock).mockResolvedValue({});
  });

  it('saves ten orders and continues to priority debts', async () => {
    const response = await request(app).post(CITIZEN_COURT_ORDERS_URL.replace(':id', 'fixture')).send(payload(10));
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(CITIZEN_PRIORITY_DEBTS_URL.replace(':id', 'fixture'));
    expect(saveDraftClaim).toHaveBeenCalledTimes(1);
    expect((saveDraftClaim as jest.Mock).mock.calls[0][1].statementOfMeans.courtOrders.rows).toHaveLength(10);
  });

  it('rejects eleven orders, keeps every value for correction and makes no save request', async () => {
    const response = await request(app).post(CITIZEN_COURT_ORDERS_URL.replace(':id', 'fixture')).send(payload(11));
    expect(response.status).toBe(200);
    expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({property: 'rows', text: 'ERRORS.MAXIMUM_TEN_COURT_ORDERS'})]));
    expect(response.body.model.rows).toHaveLength(11);
    expect(response.body.model.rows[10].claimNumber).toBe('CN10');
    expect(saveDraftClaim).not.toHaveBeenCalled();
  });
});
