import { AppSession, FirstContact } from 'common/models/AppRequest';

export const getFirstContactData = (sessionData: AppSession): FirstContact => {
  if (sessionData.firstContact) {
    return sessionData.firstContact;
  }
};

export const saveFirstContactData = (sessionData: AppSession, updatedData: FirstContact): AppSession => {
  let firstContact: FirstContact = sessionData.firstContact;
  if (!firstContact) {
    firstContact = {};
  }
  sessionData.firstContact = { ...firstContact, ...updatedData };
  return sessionData;
};