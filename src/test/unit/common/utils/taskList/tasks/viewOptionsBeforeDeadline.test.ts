import {Claim} from 'models/claim';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {ResponseOptions} from 'form/models/responseDeadline';
import {AdditionalTimeOptions} from 'form/models/additionalTime';
import {getViewOptionsBeforeDeadlineTask} from 'common/utils/taskList/tasks/viewOptionsBeforeDeadline';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {NEW_RESPONSE_DEADLINE_URL, UNDERSTANDING_RESPONSE_OPTIONS_URL} from 'routes/urls';
import {isPastDeadline} from 'common/utils/dateUtils';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));
jest.mock('common/utils/dateUtils', () => ({
  ...jest.requireActual('common/utils/dateUtils'),
  isPastDeadline: jest.fn(),
}));

const isPastDeadlineMock = isPastDeadline as jest.Mock;

describe('View options before deadline Task', () => {
  const claimId = '5129';
  const lang = 'en';
  const understandingUrl = constructResponseUrlWithIdParams(claimId, UNDERSTANDING_RESPONSE_OPTIONS_URL);
  const newDeadlineUrl = constructResponseUrlWithIdParams(claimId, NEW_RESPONSE_DEADLINE_URL);

  beforeEach(() => {
    jest.clearAllMocks();
    isPastDeadlineMock.mockReturnValue(false);
  });

  it('should return incomplete task by default', () => {
    const claim = new Claim();
    const task = getViewOptionsBeforeDeadlineTask(claim, claimId, lang);
    expect(task).toEqual({
      description: 'TASK_LIST.RESPOND_TO_CLAIM.VIEW_OPTIONS',
      url: understandingUrl,
      status: TaskStatus.INCOMPLETE,
    });
  });

  it('should mark complete when YES and more than 28 days and deadline not passed', () => {
    const claim = new Claim();
    claim.responseDeadline = {
      option: ResponseOptions.YES,
      additionalTime: AdditionalTimeOptions.MORE_THAN_28_DAYS,
    };
    isPastDeadlineMock.mockReturnValue(false);

    const task = getViewOptionsBeforeDeadlineTask(claim, claimId, lang);

    expect(task.status).toEqual(TaskStatus.COMPLETE);
    expect(task.url).toEqual(understandingUrl);
  });

  it('should set url to hash when YES more than 28 days and deadline passed', () => {
    const claim = new Claim();
    claim.responseDeadline = {
      option: ResponseOptions.YES,
      additionalTime: AdditionalTimeOptions.MORE_THAN_28_DAYS,
    };
    isPastDeadlineMock.mockReturnValue(true);

    const task = getViewOptionsBeforeDeadlineTask(claim, claimId, lang);

    expect(task.status).toEqual(TaskStatus.COMPLETE);
    expect(task.url).toEqual('#');
  });

  it('should remain incomplete when YES but additional time is up to 28 days', () => {
    const claim = new Claim();
    claim.responseDeadline = {
      option: ResponseOptions.YES,
      additionalTime: AdditionalTimeOptions.UP_TO_28_DAYS,
    };

    const task = getViewOptionsBeforeDeadlineTask(claim, claimId, lang);

    expect(task.status).toEqual(TaskStatus.INCOMPLETE);
    expect(task.url).toEqual(understandingUrl);
  });

  it('should mark complete and use new deadline url when already agreed with extension', () => {
    const claim = new Claim();
    claim.responseDeadline = {option: ResponseOptions.ALREADY_AGREED};
    claim.respondentSolicitor1AgreedDeadlineExtension = new Date('2030-01-01');

    const task = getViewOptionsBeforeDeadlineTask(claim, claimId, lang);

    expect(task.status).toEqual(TaskStatus.COMPLETE);
    expect(task.url).toEqual(newDeadlineUrl);
  });

  it('should remain incomplete when already agreed without extension', () => {
    const claim = new Claim();
    claim.responseDeadline = {option: ResponseOptions.ALREADY_AGREED};

    const task = getViewOptionsBeforeDeadlineTask(claim, claimId, lang);

    expect(task.status).toEqual(TaskStatus.INCOMPLETE);
    expect(task.url).toEqual(understandingUrl);
  });

  it('should mark complete for REQUEST_REFUSED when deadline not passed', () => {
    const claim = new Claim();
    claim.responseDeadline = {option: ResponseOptions.REQUEST_REFUSED};
    isPastDeadlineMock.mockReturnValue(false);

    const task = getViewOptionsBeforeDeadlineTask(claim, claimId, lang);

    expect(task.status).toEqual(TaskStatus.COMPLETE);
    expect(task.url).toEqual(understandingUrl);
  });

  it('should set url to hash for REQUEST_REFUSED when deadline passed', () => {
    const claim = new Claim();
    claim.responseDeadline = {option: ResponseOptions.REQUEST_REFUSED};
    isPastDeadlineMock.mockReturnValue(true);

    const task = getViewOptionsBeforeDeadlineTask(claim, claimId, lang);

    expect(task.status).toEqual(TaskStatus.COMPLETE);
    expect(task.url).toEqual('#');
  });

  it('should mark complete for NO when deadline not passed', () => {
    const claim = new Claim();
    claim.responseDeadline = {option: ResponseOptions.NO};
    isPastDeadlineMock.mockReturnValue(false);

    const task = getViewOptionsBeforeDeadlineTask(claim, claimId, lang);

    expect(task.status).toEqual(TaskStatus.COMPLETE);
    expect(task.url).toEqual(understandingUrl);
  });

  it('should set url to hash for NO when deadline passed', () => {
    const claim = new Claim();
    claim.responseDeadline = {option: ResponseOptions.NO};
    isPastDeadlineMock.mockReturnValue(true);

    const task = getViewOptionsBeforeDeadlineTask(claim, claimId, lang);

    expect(task.status).toEqual(TaskStatus.COMPLETE);
    expect(task.url).toEqual('#');
  });
});
