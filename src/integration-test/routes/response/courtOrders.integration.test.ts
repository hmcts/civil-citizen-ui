import express from 'express';
import request from 'supertest';
import path from 'path';
import {GenericForm} from 'form/models/genericForm';
import {CourtOrders} from 'form/models/statementOfMeans/courtOrders/courtOrders';
import {Claim} from 'models/claim';

jest.mock('modules/draft-store/response/responseDraftStoreService', () => ({
  getResponseClaimById: jest.fn().mockResolvedValue(new Claim()),
  getResponseDraft: jest.fn().mockResolvedValue({
    claimResponse: {id: 'draft-1', case_data: new Claim()},
    rawResponse: {draftId: 'draft-1', payload: new Claim()},
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '',
    expiresAt: '',
  }),
  updateResponseDraft: jest.fn().mockResolvedValue(undefined),
}));

import courtOrdersController from '../../../main/routes/features/response/statementOfMeans/courtOrders/courtOrdersController';
import {CITIZEN_COURT_ORDERS_URL, CITIZEN_PRIORITY_DEBTS_URL} from 'routes/urls';
import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';

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

describe('court-order submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getResponseDraft as jest.Mock).mockResolvedValue({
      claimResponse: {id: 'draft-1', case_data: new Claim()},
      rawResponse: {draftId: 'draft-1', payload: new Claim()},
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '',
      expiresAt: '',
    });
  });

  it('saves ten orders and continues to priority debts', async () => {
    const response = await request(app).post(CITIZEN_COURT_ORDERS_URL.replace(':id', 'fixture')).send(payload(10));
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(CITIZEN_PRIORITY_DEBTS_URL.replace(':id', 'fixture'));
    expect(updateResponseDraft).toHaveBeenCalledTimes(1);
    expect((updateResponseDraft as jest.Mock).mock.calls[0][2].statementOfMeans.courtOrders.rows).toHaveLength(10);
  });

  it('redisplays an invalid amount, retains every submitted row and makes no save request', async () => {
    const params = new URLSearchParams(payload(11));
    params.set('rows[10][amount]', '0');
    const response = await request(app).post(CITIZEN_COURT_ORDERS_URL.replace(':id', 'fixture')).send(params.toString());
    expect(response.status).toBe(200);
    expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({property: 'rows[10][amount]', text: 'ERRORS.AMOUNT_REQUIRED'})]));
    expect(response.body.model.rows).toHaveLength(11);
    expect(response.body.model.rows[10].claimNumber).toBe('CN10');
    expect(response.body.model.rows[10].amount).toBe(0);
    expect(updateResponseDraft).not.toHaveBeenCalled();
  });
});
