import * as express from 'express';
import { Claim, Respondent, PrimaryAddress } from 'common/models/claim';
//import { CivilServiceClient } from '../../../app/client/civilServiceClient';
//import config from 'config';
const validator = require('../../../common/utils/validator');


//const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
//const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

let claim: Claim = new Claim();
const respondent: Respondent = new Respondent();
const primaryAddress: PrimaryAddress = new PrimaryAddress();

type IErrorList = {
  [key: string]: string
};

let errorList: IErrorList[] = [];
let addressLineOneValidated: object = {};
let birthdayValidated: object = {};
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

const birthdayObj = {
  classes: 'govuk-input--width-20',
  id: 'birthdayObj',
  name: 'birthdayObj',
  autocomplete: 'birthdayObj',
};

const validateField = (formVal: string, errorMsg: string, formName: string, formObject: object) => {
  let formControlValidated: object;
  if (validator.isEmpty(formVal)) {

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

const validateDateField = (formVal: string, errorMsg: string, formName: string, formObject: object) => {
  let formControlValidated: object;
  if (!validator.isNumber(formVal)) {
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

function renderCitizenDetailsPage(res: express.Response, errorList:IErrorList[], addressLineOneObj:object, townOrCityObj:object, citizenDetails:object): void {
  res.render('features/response/your-details', {
    errorList: errorList,
    addressLineOneObj: addressLineOneObj,
    townOrCityObj: townOrCityObj,
    citizenDetails: citizenDetails,
  });
}

function renderCitizenDobPage(res: express.Response, errorList:IErrorList[], birthdayObj:object): void {
  res.render('features/response/routes/your-dob', {
    errorList: errorList,
    birthdayObj: birthdayObj,
  });
}

// -- Retrive Claim
(async () => {

  //claim = await civilServiceClient.retrieveClaimDetails('1643033241924739');
  claim = {
    legacyCaseReference: '000CMC001',
    applicant1: {
      individualTitle: 'string',
      individualLastName: 'string',
      individualFirstName: 'string',
      individualDateOfBirth: new Date(),
    },
    totalClaimAmount: 110,
    respondent1ResponseDeadline: new Date(),
    detailsOfClaim: 'string',
    respondent1: {
      primaryAddress: {
        County: 'string',
        Country: 'string',
        PostCode: 'string',
        PostTown: 'string',
        AddressLine1: 'string',
        AddressLine2: 'string',
        AddressLine3: 'string',
      },
      individualTitle: 'string',
      individualLastName: 'string',
      individualFirstName: 'string',
      individualDateOfBirth: new Date(),

    },
    individualTitle: 'string',
    individualLastName: 'string',
    individualFirstName: 'string',
    formattedResponseDeadline: function (): string {
      throw new Error('Function not implemented.');
    },
    formattedTotalClaimAmount: function (): string {
      throw new Error('Function not implemented.');
    },
  };
})();

// -- Display Claim Details
const getClaimDetails = async (req:express.Request, res:express.Response)  => {
  renderPage(res, claim);
};

// -- Display Citizen  Details
const getCitizenDetails = async (req: express.Request, res: express.Response) => {
  // -- Retrive from Redis
  const draftStoreClient = req.app.locals.draftStoreClient;
  let citizenDetails = await draftStoreClient.get(claim.legacyCaseReference);
  citizenDetails = JSON.parse(citizenDetails);
  console.log('REDIS:', citizenDetails);

  // Add value to Form input
  const addressInput = {
    ...addressLineOneObj,
    value: citizenDetails ? citizenDetails.respondent1.primaryAddress.AddressLine1 : '',
  };
  const townInput = {
    ...townOrCityObj,
    value: citizenDetails ?  citizenDetails.respondent1.primaryAddress.PostTown : '',
  };

  // -- Render Page
  renderCitizenDetailsPage(res, errorList, addressInput, townInput, citizenDetails);
};

// Save details
const formHandler = async (req:express.Request, res:express.Response) => {
  console.log('REQ BODY', req.body);
  addressLineOneValidated = validateField(req.body.addressLineOne, 'Enter first address line', 'addressLineOne', addressLineOneObj);
  townOrCityValidated = validateField(req.body.city, 'Enter a valid town/city', 'city', townOrCityObj);
  const draftStoreClient = req.app.locals.draftStoreClient;

  // -- If valid save into Redis
  if (req.body?.addressLineOne && req.body?.city) {

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

    await draftStoreClient.set(claim.legacyCaseReference, JSON.stringify(claim));
    res.redirect('case/1643033241924739/response/your-dob');
  } else { // -- else get existing values and render page with error message
    let citizenDetails = await draftStoreClient.get(claim.legacyCaseReference);
    citizenDetails = JSON.parse(citizenDetails);
    console.log('REDIS:', citizenDetails);
    renderCitizenDetailsPage(res, errorList, addressLineOneValidated, townOrCityValidated, citizenDetails);
  }
};

const formDateHandler = async (req:express.Request, res:express.Response) => {
  console.log('REQ BODY', req.body);
  claim.legacyCaseReference='000CMC001';

  //Todo validate dates
  birthdayValidated = validateDateField(req.body.day, 'Enter a correct number', 'day', birthdayObj);
  birthdayValidated = validateDateField(req.body.month, 'Enter a correct number', 'month', birthdayObj);
  birthdayValidated = validateDateField(req.body.year, 'Enter a correct number', 'year', birthdayObj);
  birthdayValidated = validateField(req.body.day, 'Enter a number', 'day', birthdayObj);
  birthdayValidated = validateField(req.body.month, 'Enter a number', 'month', birthdayObj);
  birthdayValidated = validateField(req.body.year, 'Enter a number', 'year', birthdayObj);

  console.log('REQ day' + req.body?.day);

  const draftStoreClient = req.app.locals.draftStoreClient;
  // -- If valid save into Redis
  if (req.body?.day && req.body?.month && req.body?.year) {
    const birthDate : Date = new Date(req.body.year,req.body.month,req.body.day);

    birthDate.setFullYear(req.body.year,req.body.month,req.body.day);
    respondent.individualDateOfBirth= birthDate;
    claim.respondent1 = respondent;
    console.log('DATE: ' + claim.respondent1);
    await draftStoreClient.set(claim.legacyCaseReference, JSON.stringify(claim));
    res.redirect('/citizen-phone');
  } else { // -- else get existing values and render page with error message
    let citizenDetails = await draftStoreClient.get(claim.legacyCaseReference);
    citizenDetails = JSON.parse(citizenDetails);
    console.log('REDIS:', citizenDetails);
    renderCitizenDobPage(res, errorList, birthdayValidated);
  }
};

module.exports = { getClaimDetails, getCitizenDetails, formHandler,formDateHandler, validateField };
