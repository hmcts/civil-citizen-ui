import {Claim} from 'models/claim';
import {toCCDTimeline} from 'services/translation/response/convertToCCDTimeLine';
import {CCDTimeLineOfEvents} from 'models/ccdResponse/ccdTimeLineOfEvents';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {ClaimantTimeline} from 'form/models/timeLineOfEvents/claimantTimeline';

describe('translate TimeLine to CCD model', () => {


  it('should return undefined if timeline doesnt exist', () => {
    const claimEmpty = new Claim();
    claimEmpty.claimDetails = new ClaimDetails();
    const timelineResponseCCD = toCCDTimeline(claimEmpty.claimDetails.timeline);
    expect(timelineResponseCCD).toBe(undefined);
  });
  it('should translate timeline to CCD', () => {
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.timeline = new ClaimantTimeline(
      [
        new TimelineRow(1, 1, 2001, 'test 1'),
        new TimelineRow(2, 2, 2002, 'test 2'),
      ],
    );
    const claimAmountCCD: CCDTimeLineOfEvents[] = [
      {
        id: '0',
        value: {timelineDate: new Date('01-01-2001'), timelineDescription: 'test 1'},
      },
      {
        id: '1',
        value: {timelineDate: new Date('02-02-2002'), timelineDescription: 'test 2'},
      },
    ];
    const timelineResponseCCD = toCCDTimeline(claim.claimDetails.timeline);
    expect(timelineResponseCCD).toMatchObject(claimAmountCCD);
  });
});
