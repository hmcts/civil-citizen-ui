import {NextFunction, Router} from 'express';
import {POSTCODE_LOOKUP_URL} from 'routes/urls';
import {lookupByPostcodeAndDataSet} from 'modules/ordance-survey-key/ordanceSurveyKey';

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
      //const osPlacesClient = getOSPlacesClientInstance();
      //osPlacesClient.lookupByPostcodeAndDataSet(req.query.postcode as string, 'DPA,LPI')
      const response = await lookupByPostcodeAndDataSet(req.query.postcode as string);  // Call the service

      res.status(200).json(response);
    }  catch (error) {
      res.status(error.response.status).json({
        error: {
          status: error.response.status,
          message: error.message,
        },
      });
    }
  });

