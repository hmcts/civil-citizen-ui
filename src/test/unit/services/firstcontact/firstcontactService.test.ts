import {AppSession} from 'common/models/AppRequest';
import {getFirstContactData, saveFirstContactData} from 'services/firstcontact/firstcontactService';

describe('firstcontactService', () => {
  describe('getFirstContactData', () => {
    it('should return firstContact when present', () => {
      const session = {firstContact: {claimReference: '123'}} as AppSession;
      expect(getFirstContactData(session)).toEqual({claimReference: '123'});
    });

    it('should return undefined when firstContact is missing', () => {
      expect(getFirstContactData({} as AppSession)).toBeUndefined();
    });
  });

  describe('saveFirstContactData', () => {
    it('should create firstContact when missing and merge updated data', () => {
      const session = {} as AppSession;
      const result = saveFirstContactData(session, {claimReference: 'ABC'});

      expect(result.firstContact).toEqual({claimReference: 'ABC'});
    });

    it('should merge updated data into existing firstContact', () => {
      const session = {firstContact: {claimReference: 'ABC', pin: '1'}} as AppSession;
      const result = saveFirstContactData(session, {pin: '999'});

      expect(result.firstContact).toEqual({claimReference: 'ABC', pin: '999'});
    });
  });
});
