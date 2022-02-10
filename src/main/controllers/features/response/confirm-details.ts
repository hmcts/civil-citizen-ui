import * as express from 'express';
import { Claim, Respondent, PrimaryAddress } from '../../../common/models/claim';
import { CivilServiceClient } from '../../../app/client/civilServiceClient';
import config from 'config';
const validator = require('validator');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const claim: Claim = new Claim();
const respondent: Respondent = new Respondent();
const primaryAddress: PrimaryAddress = new PrimaryAddress();

type IErrorList = {
  [key: string]: string
};

let errorList: IErrorList[] = [];
let addressLineOneValidated: object = {};
let townOrCityValidated: object = {};

const addressLineOneObj = {
  classes: 'govuk-input--width-20',
  id: 'addressLineOne',
  name: 'addressLineOne',
  autocomplete: 'addressLineOne',
};

const townOrCityObj = {
  classes: 'govuk-input--width-20',
  id: 'city',
  name: 'city',
  autocomplete: 'city',
};

const isEmpty = (val:string) => validator.isEmpty(val);

const validateField = (formVal: string, errorMsg: string, formName: string, formObject: object) => {
  let formControlValidated: object = {};
  if (isEmpty(formVal)) {

    if (!errorList.some(item => item.href === `#${formName}`)) {
      errorList.push({
        text: errorMsg,
        href: `#${formName}`,
      });
    }

    formControlValidated = {
      ...formObject,
      errorMessage: { 'text': errorMsg },
    };
  }
  else {
    formControlValidated = {
      ...formObject,
      value: formVal,
    };
    errorList = errorList.filter(function (item) {
      return item.href != `#${formName}`;
    });
  }

  return formControlValidated;
};


function renderPage(res: express.Response, claimDetails: Claim): void {
  res.render('features/response/claim-details', {
    claim: claimDetails,
  });
}

function renderYourDetailsPage(res: express.Response, errorList:IErrorList[], addressLineOneObj:object, townOrCityObj:object, citizenDetails:object): void {
  res.render('features/response/your-details', {
    errorList: errorList,
    addressLineOneObj: addressLineOneObj,
    townOrCityObj: townOrCityObj,
    citizenDetails: citizenDetails,
  });
}

const getClaimDetails = async (req:express.Request, res:express.Response) => {
  const claimDetails: Claim = await civilServiceClient.retrieveClaimDetails('1643033241924739');
  renderPage(res, claimDetails);
};

const getCitizenDetails = (req:express.Request, res:express.Response) => {
  (async () => {
    const draftStoreClient = req.app.locals.draftStoreClient;

    let citizenDetails = await draftStoreClient.get('000CMC001');
    citizenDetails = JSON.parse(citizenDetails);
    console.log('REDIS:', citizenDetails);

    const addressInput = {
      ...addressLineOneObj,
      value: citizenDetails ? citizenDetails.respondent1.primaryAddress.AddressLine1 : '',
    };
    const townInput = {
      ...townOrCityObj,
      value: citizenDetails ?  citizenDetails.respondent1.primaryAddress.PostTown : '',
    };
    renderYourDetailsPage(res, errorList, addressInput, townInput, citizenDetails);
  })();
};

const formHandler = (req:express.Request, res:express.Response) => {
  console.log('REQ BODY', req.body);
  addressLineOneValidated = validateField(req.body.addressLineOne, 'Enter first address line', 'addressLineOne', addressLineOneObj);
  townOrCityValidated = validateField(req.body.city, 'Enter a valid town/city', 'city', townOrCityObj);
  const draftStoreClient = req.app.locals.draftStoreClient;

  if (!isEmpty(req.body.addressLineOne) && !isEmpty(req.body.city)) {

    claim.legacyCaseReference = '000CMC001';
    respondent.individualTitle = 'Mrs.';
    respondent.individualLastName = 'Richards';
    respondent.individualFirstName = 'Mary';
    primaryAddress.AddressLine1 = req.body.addressLineOne;
    primaryAddress.AddressLine2 = req.body.addressLineTwo;
    primaryAddress.AddressLine3 = req.body.addressLineThree;
    primaryAddress.PostTown = req.body.city;
    primaryAddress.PostCode = req.body.postcode;
    respondent.primaryAddress = primaryAddress;
    claim.respondent1 = respondent;

    (async () => {
      await draftStoreClient.set(claim.legacyCaseReference, JSON.stringify(claim));
      res.redirect('case/1643033241924739/response/your-dob');
    })();
  } else {
    (async () => {
      let citizenDetails = await draftStoreClient.get('000CMC001');
      citizenDetails = JSON.parse(citizenDetails);
      console.log('REDIS:', citizenDetails);
      renderYourDetailsPage(res, errorList, addressLineOneValidated, townOrCityValidated, citizenDetails);
    })();
  }
};

module.exports = { getClaimDetails, getCitizenDetails, formHandler, validateField };
