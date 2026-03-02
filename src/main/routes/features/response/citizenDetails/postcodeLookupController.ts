import { NextFunction, Router } from 'express';
import { POSTCODE_LOOKUP_URL } from 'routes/urls';
import { AddressInfoResponse } from 'models/ordanceSurveyKey/ordanceSurveyKey';
import { lookupByPostcodeAndDataSet } from 'modules/ordance-survey-key/ordanceSurveyKeyService';

export default Router().get(POSTCODE_LOOKUP_URL, async (req, res, next: NextFunction) => {
  try {
    const raw = req.query?.postcode;
    if (typeof raw !== 'string' || raw.trim().length === 0) {
      return res.status(400).json({
        error: { status: 400, message: 'Postcode not provided' },
      });
    }

    const postcode = raw.trim();
    const response: AddressInfoResponse = await lookupByPostcodeAndDataSet(postcode);

    res.status(200).json(response);
  } catch (error: any) {
    const statusCode = error?.response?.status || 500;
    res.status(statusCode).json({
      error: {
        status: statusCode,
        message: error?.message ?? 'Internal Server Error',
      },
    });
  }
});