import {ResponseDeadline} from 'models/responseDeadline';
import {ResponseOptions} from 'form/models/responseDeadline';

export const toCUIResponseDeadline = (ccdAgreedDeadline: Date): ResponseDeadline => {
  if(ccdAgreedDeadline){
    const responseDeadline: ResponseDeadline = {};
    responseDeadline.calculatedResponseDeadline = ccdAgreedDeadline;
    responseDeadline.agreedResponseDeadline = ccdAgreedDeadline;
    responseDeadline.option = ResponseOptions.ALREADY_AGREED;
    return responseDeadline;
  }
};
