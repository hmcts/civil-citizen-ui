import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {Claim} from '../../../../../../main/common/models/claim';
import {Mediation} from '../../../../../../main/common/models/mediation/mediation';
import {TaskStatus} from '../../../../../../main/common/models/taskList/TaskStatus';
import {getFreeTelephoneMediationTask} from '../../../../../../main/common/utils/taskList/tasks/freeTelephoneMediation';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Free telephone mediation', () => {
  const claim = new Claim();
  const claimId = '5129';
  const lang = 'en';

  const resultIncomplete = {
    description: 'TASK_LIST.RESOLVING_THE_CLAIM.FREE_TELEPHONE_MEDIATION',
    url: '/case/5129/mediation/free-telephone-mediation',
    status: TaskStatus.INCOMPLETE,
  };

  const resultComplete = { ...resultIncomplete, status: TaskStatus.COMPLETE };

  describe('getFreeTelephoneMediationTask', () => {

    it('should return incomplete', () => {
      const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
      expect(freeTelephoneMediationTask).toEqual(resultIncomplete);
    });

    it('should return complete if no mediation', () => {
      claim.mediation = new Mediation(undefined, { option: YesNo.NO }, undefined, undefined);
      const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
      expect(freeTelephoneMediationTask).toEqual(resultComplete);
    });

    describe('type Individual or Sole Trader', () => {
      it('should return complete if canWeUse NO and provide new phone', () => {
        claim.mediation = new Mediation(
          { option: YesNo.NO, mediationPhoneNumber: '666555444' },
          { option: YesNo.YES },
          undefined,
          undefined,
        );
        const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
        expect(freeTelephoneMediationTask).toEqual(resultComplete);
      });
  
      it('should return complete if canWeUse YES and use same phone', () => {
        claim.mediation = new Mediation(
          { option: YesNo.YES },
          { option: YesNo.YES },
          undefined,
          undefined,
        );
        const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
        expect(freeTelephoneMediationTask).toEqual(resultComplete);
      });
    });

    describe('type Organisation or Company', () => {
      it('should return complete if companyTelephoneNumber NO', () => {
        claim.mediation = new Mediation(
          undefined,
          { option: YesNo.YES },
          undefined,
          { option: YesNo.NO, mediationPhoneNumber: '666555444', mediationContactPerson: 'Jon Doe' },
        );
        const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
        expect(freeTelephoneMediationTask).toEqual(resultComplete);
      });

      it('should return complete if companyTelephoneNumber YES', () => {
        claim.mediation = new Mediation(
          undefined,
          { option: YesNo.YES },
          undefined,
          { option: YesNo.YES, mediationPhoneNumberConfirmation: '666555444' },
        );
        const freeTelephoneMediationTask = getFreeTelephoneMediationTask(claim, claimId, lang);
        expect(freeTelephoneMediationTask).toEqual(resultComplete);
      });
    });

  });

});
