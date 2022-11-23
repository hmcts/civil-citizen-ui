import {Claim} from '../../../../../main/common/models/claim';
import {toCCDTimeline} from '../../../../../main/services/translation/response/convertToCCDTimeLine';
import {DefendantTimeline} from '../../../../../main/common/form/models/timeLineOfEvents/defendantTimeline';
import {PartialAdmission} from '../../../../../main/common/models/partialAdmission';
import {TimelineRow} from '../../../../../main/common/form/models/timeLineOfEvents/timelineRow';
import {CCDTimeLineOfEvents} from '../../../../../main/common/models/ccdResponse/ccdTimeLineOfEvents';

describe('translate TimeLine to CCD model', () => {
  const claim = new Claim();
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.timeline = new DefendantTimeline(
    [
      new TimelineRow('01-01-2001', 'test 1'),
      new TimelineRow('02-02-2002', 'test 2'),
    ],
    'test comment'
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
        value: { timelineDate: '01-01-2001', timelineDescription: 'test 1' }
      },
      {
        id: '1',
        value: { timelineDate: '02-02-2002', timelineDescription: 'test 2' }
      },
    ];
    const timelineResponseCCD = toCCDTimeline(claim.partialAdmission.timeline);
    expect(timelineResponseCCD).toMatchObject(claimAmountCCD);
  });
});
