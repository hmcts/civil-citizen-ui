const uuid = require('uuid');
const config = require('../config.js');
const address = require('../fixtures/address');

const getDateTimeISOString = days => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const getDate = days => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

module.exports = {
  date: (days = 0) => {
    return getDateTimeISOString(days).slice(0, 10);
  },

  dateNoWeekends: function dateNoWeekends(days = 0) {
    let date = getDate(days);

    if(date.getDay() !== 6 && date.getDay() !== 0) {
      return date.toISOString().slice(0, 10);
    } else {
      return dateNoWeekends(days - 1);
    }
  },

  dateTime: (days = 0) => {
    return getDateTimeISOString(days);
  },

  document: filename => {
    const documentId = uuid.v1();
    return {
      document_url: `${config.url.dmStore}/documents/${documentId}`,
      document_filename: filename,
      document_binary_url: `${config.url.dmStore}/documents/${documentId}/binary`,
    };
  },

  element: object => {
    return {
      id: uuid.v1(),
      value: object,
    };
  },

  listElement: string => {
    return {
      code: uuid.v1(),
      label: string,
    };
  },

  buildAddress: postFixLineOne => {
    return {
      AddressLine1: `${address.buildingAndStreet.lineOne + ' - ' + postFixLineOne}`,
      AddressLine2: address.buildingAndStreet.lineTwo,
      AddressLine3: address.buildingAndStreet.lineThree,
      PostTown: address.town,
      County: address.county,
      Country: address.country,
      PostCode: address.postcode,
    };
  },
};
