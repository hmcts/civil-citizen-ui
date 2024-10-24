import {NextFunction, Router} from 'express';
import {POSTCODE_LOOKUP_URL} from 'routes/urls';
import {AddressInfoResponse} from 'models/ordanceSurveyKey/ordanceSurveyKey';
import {lookupByPostcodeAndDataSet} from 'modules/ordance-survey-key/ordanceSurveyKeyService';

export default Router()
  .get(POSTCODE_LOOKUP_URL, async (req, res, next: NextFunction) => {

    try {
      const postcode = <string>req.query?.postcode;
      if (!postcode || postcode.trim().length === 0) {
        return res.status(400).json({
          error: {
            status: 400,
            message: 'Postcode not provided',
          },
        });
      }
      const response: AddressInfoResponse = await lookupByPostcodeAndDataSet(req.query.postcode as string);
      res.status(200).json(response);
    }  catch (error) {
      const statusCode = error?.response?.status ? error.response.status : undefined;
      return res.status(statusCode).json({
        error: {
          status: statusCode,
          message: error.message,
        },
      });
    }
  });

