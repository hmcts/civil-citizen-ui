import {Claim} from 'common/models/claim';
import {TaskList} from 'common/models/taskList/taskList';
import {getClaimantResponseTaskLists,outstandingClaimantResponseTasks} from '../../../../../main/services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService';
import {Task} from 'common/models/taskList/task';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {
  buildClaimantHearingRequirementsSection,
  buildClaimantResponseSubmitSection,
  buildHowDefendantRespondSection,
  buildWhatToDoNextSection,
  buildYourResponseSection,
} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistBuilder';
import {Mediation} from 'models/mediation/mediation';
import {CompanyTelephoneNumber} from 'form/models/mediation/companyTelephoneNumber';
import {Party} from 'models/party';
import {ResponseType} from 'form/models/responseType';
import {ClaimantResponse} from 'models/claimantResponse';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {CaseState} from 'form/models/claimDetails';
import {PartialAdmission} from 'models/partialAdmission';

jest.mock('../../../../../main/services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistBuilder');

const howTheyRespondedTask = {
  title: 'Title 1',
  tasks: [
    {
      description: 'How they responded',
      status: TaskStatus.COMPLETE,
      url: 'some URL',
    },
  ],
};
const chooseWhatToDoNext = {
  title: 'Title 2',
  tasks: [
    {
      description: 'Choose what to do next',
      status: TaskStatus.INCOMPLETE,
      url: 'some URL',
    },
  ],
};

const buildYourResponse = {
  title: 'Title 3',
  tasks: [
    {
      description: 'Build Your Response',
      status: TaskStatus.INCOMPLETE,
      url: 'some URL',
    },
  ],
};

const submitTask = {
  title: 'Title 4',
  tasks: [
    {
      description: 'Submit Your Response',
      status: TaskStatus.INCOMPLETE,
      url: 'some URL',
      isCheckTask: true,
    },
  ],
};

const hearingDirections = {
  title: 'Title 5',
  tasks: [
    {
      description: 'Give us details in case there\'s a hearing',
      status: TaskStatus.INCOMPLETE,
      url: 'some URL',
    },
  ],
};

const claimId = '123';
const lng = 'en';

const mockBuildClaimantResponseSubmitSection = buildClaimantResponseSubmitSection as jest.Mock;
const mockBuildHowDefendantRespondSection = buildHowDefendantRespondSection as jest.Mock;
const mockBuildWhatToDoNextSection = buildWhatToDoNextSection as jest.Mock;
const mockBuildYourResponseSection = buildYourResponseSection as jest.Mock;
const mockBuildClaimantHearingRequirementsSection = buildClaimantHearingRequirementsSection as jest.Mock;

describe('outstanding Claimant Response Tasks', () => {
  beforeAll(() => {
    mockBuildClaimantResponseSubmitSection.mockImplementation(() => {
      return submitTask;
    });
    mockBuildHowDefendantRespondSection.mockImplementation(() => {
      return howTheyRespondedTask;
    });
    mockBuildWhatToDoNextSection.mockImplementation(() => {
      return chooseWhatToDoNext;
    });
    mockBuildYourResponseSection.mockImplementation(() => {
      return buildYourResponse;
    });
    mockBuildClaimantHearingRequirementsSection.mockImplementation(() => {
      return hearingDirections;
    });
  });

  describe('getClaimantResponseTaskLists', () => {
    let claim: Claim;

    beforeEach(() => {
      claim = new Claim();
    });
    it('should return an array of TaskLists with expected task groups for partial admission', () => {
      // given
      claim.isPartialAdmission = () => true;
      claim.isFullAdmission = () => false;

      // when
      const taskLists: TaskList[] = getClaimantResponseTaskLists(
        claim,
        claimId,
        lng,
      );

      // then
      expect(taskLists.length).toBeGreaterThan(0);

      // task groups that are included
      expect(taskLists.some((list) => (list.title = 'How they responded'))).toBe(true);
      expect(taskLists.some((list) => (list.title = 'Choose what to do next'))).toBe(true);
      expect(taskLists.some((list) => (list.title = 'Submit'))).toBe(true);

      // task groups are not included
      expect(taskLists.some((list) => list.title === 'Your Response')).toBe(false);
    });

    it('should return an array of TaskLists with expected task groups for full admission', () => {
      // given
      claim.isPartialAdmission = () => false;
      claim.isFullAdmission = () => true;

      // when
      const taskLists: TaskList[] = getClaimantResponseTaskLists(
        claim,
        claimId,
        lng,
      );

      // then
      expect(taskLists.length).toBeGreaterThan(0);

      // task groups that are included
      expect(taskLists.some((list) => (list.title = 'How they responded'))).toBe(true);
      expect(taskLists.some((list) => (list.title = 'Choose what to do next'))).toBe(true);
      expect(taskLists.some((list) => (list.title = 'Submit'))).toBe(true);

      // task groups are not included
      expect(taskLists.some((list) => list.title === 'What to Do Next')).toBe(false);
    });
  });
  describe('outstanding Claimant Response Tasks', () => {
    let claim: Claim;

    beforeEach(() => {
      claim = new Claim();
    });
    it('should return outstanding TaskLists', () => {
      // Given
      claim.isFullAdmission = () => true;

      // when
      const tasks: Task[] = outstandingClaimantResponseTasks(
        claim,
        claimId,
        lng,
      );

      // then
      expect(tasks.length).toBeGreaterThanOrEqual(1);

      // task groups that are included
      expect(tasks.some((task) => task.description === 'Choose what to do next')).toBe(true);
      expect(tasks.some((task) => task.description === 'Submit Your Response')).toBe(false);
      expect(tasks.some((task) => task.description === 'How they responded')).toBe(false);
    });
  });

  it('should return an array of TaskLists with expected task groups for full defence and paid full', () => {
    // given
    const claim=new Claim();
    claim.mediation=new Mediation();
    claim.mediation.companyTelephoneNumber=new CompanyTelephoneNumber();
    claim.mediation.companyTelephoneNumber.mediationPhoneNumber='1';
    claim.mediation.canWeUse={
      mediationPhoneNumber:'12',
    };
    claim.respondent1=new Party();
    claim.respondent1.responseType=ResponseType.FULL_DEFENCE;
    claim.claimantResponse=new ClaimantResponse();
    claim.claimantResponse.hasDefendantPaidYou=new GenericYesNo();
    claim.claimantResponse.hasDefendantPaidYou.option=YesNo.NO;
    claim.claimantResponse.hasFullDefenceStatesPaidClaimSettled=new GenericYesNo();
    claim.claimantResponse.hasFullDefenceStatesPaidClaimSettled.option=YesNo.NO;
    claim.claimantResponse.hasPartPaymentBeenAccepted=new GenericYesNo();
    claim.claimantResponse.hasPartPaymentBeenAccepted.option=YesNo.YES;
    claim.claimantResponse.hasPartAdmittedBeenAccepted=new GenericYesNo();
    claim.claimantResponse.hasPartAdmittedBeenAccepted.option=YesNo.NO;
    claim.totalClaimAmount=9000;
    claim.rejectAllOfClaim=new RejectAllOfClaim();
    claim.rejectAllOfClaim.howMuchHaveYouPaid=new HowMuchHaveYouPaid();
    claim.rejectAllOfClaim.howMuchHaveYouPaid.amount=9000;
    claim.rejectAllOfClaim.option=RejectAllOfClaimType.ALREADY_PAID;
    claim.ccdState=CaseState.AWAITING_APPLICANT_INTENTION;
    claim.partialAdmission=new PartialAdmission();
    claim.partialAdmission.alreadyPaid=new GenericYesNo();
    claim.partialAdmission.alreadyPaid.option = YesNo.YES;

    // when
    const taskLists: TaskList[] = getClaimantResponseTaskLists(
      claim,
      claimId,
      lng,
    );

    // then
    expect(taskLists.length).toBeGreaterThan(0);

    // task groups that are included
    expect(taskLists.some((list) => list.title = 'How they responded')).toBe(true);
    expect(taskLists.some((list) => list.title = 'Choose what to do next')).toBe(true);
    expect(taskLists.some((list) => list.title = 'Submit')).toBe(true);

    // task groups are not included
    expect(taskLists.some((list) => list.title === 'Your Response')).toBe(false);
  });

  it('should return an array of TaskLists with expected task groups for full defence and paid less', () => {
    // given
    const claim=new Claim();
    claim.mediation=new Mediation();
    claim.mediation.companyTelephoneNumber=new CompanyTelephoneNumber();
    claim.mediation.companyTelephoneNumber.mediationPhoneNumber='1';
    claim.mediation.canWeUse={
      mediationPhoneNumber:'12',
    };
    claim.respondent1=new Party();
    claim.respondent1.responseType=ResponseType.FULL_DEFENCE;
    claim.claimantResponse=new ClaimantResponse();
    claim.claimantResponse.hasDefendantPaidYou=new GenericYesNo();
    claim.claimantResponse.hasDefendantPaidYou.option=YesNo.NO;
    claim.claimantResponse.hasFullDefenceStatesPaidClaimSettled=new GenericYesNo();
    claim.claimantResponse.hasFullDefenceStatesPaidClaimSettled.option=YesNo.NO;
    claim.claimantResponse.hasPartPaymentBeenAccepted=new GenericYesNo();
    claim.claimantResponse.hasPartPaymentBeenAccepted.option=YesNo.YES;
    claim.claimantResponse.hasPartAdmittedBeenAccepted=new GenericYesNo();
    claim.claimantResponse.hasPartAdmittedBeenAccepted.option=YesNo.NO;
    claim.totalClaimAmount=9000;
    claim.rejectAllOfClaim=new RejectAllOfClaim();
    claim.rejectAllOfClaim.howMuchHaveYouPaid=new HowMuchHaveYouPaid();
    claim.rejectAllOfClaim.howMuchHaveYouPaid.amount=9000;
    claim.rejectAllOfClaim.option=RejectAllOfClaimType.ALREADY_PAID;
    claim.ccdState=CaseState.AWAITING_APPLICANT_INTENTION;
    claim.partialAdmission=new PartialAdmission();
    claim.partialAdmission.alreadyPaid=new GenericYesNo();
    claim.partialAdmission.alreadyPaid.option = YesNo.YES;

    // when
    const taskLists: TaskList[] = getClaimantResponseTaskLists(
      claim,
      claimId,
      lng,
    );

    // then
    expect(taskLists.length).toBeGreaterThan(0);

    // task groups that are included
    expect(taskLists.some((list) => list.title = 'Your Response')).toBe(true);

    // task groups are not included
    expect(taskLists.some((list) => list.title === 'How they responded')).toBe(false);
  });
});
