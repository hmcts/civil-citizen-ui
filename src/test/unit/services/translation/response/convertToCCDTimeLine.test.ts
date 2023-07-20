import {Claim} from 'common/models/claim';
import {toCCDTimeline} from 'services/translation/response/convertToCCDTimeLine';
import {DefendantTimeline} from 'common/form/models/timeLineOfEvents/defendantTimeline';
import {PartialAdmission} from 'common/models/partialAdmission';
import {TimelineRow} from 'common/form/models/timeLineOfEvents/timelineRow';
import {CCDTimeLineOfEvents} from 'common/models/ccdResponse/ccdTimeLineOfEvents';

describe('translate TimeLine to CCD model', () => {
  const claim = new Claim();
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.timeline = new DefendantTimeline(
    [
      new TimelineRow(1, 1, 2001, 'test 1'),
      new TimelineRow(2, 2, 2002, 'test 2'),
    ],
    'test comment',
  );

  it('should return undefined if claimAmountBreakup doesnt exist', () => {
    const claimEmpty = new Claim();
    claimEmpty.partialAdmission = new PartialAdmission();
    const timelineResponseCCD = toCCDTimeline(claimEmpty.partialAdmission.timeline);
    expect(timelineResponseCCD).toBe(undefined);
  });

  it('should translate claimAmountBreakup to CCD', () => {
    const claimAmountCCD: CCDTimeLineOfEvents[] = [
      {
        id: '0',
        value: { timelineDate: new Date('01-01-2001'), timelineDescription: 'test 1' },
      },
      {
        id: '1',
        value: { timelineDate: new Date('02-02-2002'), timelineDescription: 'test 2' },
      },
    ];
    const timelineResponseCCD = toCCDTimeline(claim.partialAdmission.timeline);
    expect(timelineResponseCCD).toMatchObject(claimAmountCCD);
  });
});
