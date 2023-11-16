import {Claim} from 'models/claim';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {ClaimantTimeline} from 'form/models/timeLineOfEvents/claimantTimeline';
import {toCCDTimelineEvent} from 'models/ccdResponse/ccdTimeLine';

describe('translate TimeLine to CCD model', () => {

  it('should return undefined if timeline doesnt exist', () => {
    const claimEmpty = new Claim();
    claimEmpty.claimDetails = new ClaimDetails();
    const timelineResponseCCD = toCCDTimelineEvent(claimEmpty.claimDetails.timeline);
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
    const timelineResponseCCD = toCCDTimelineEvent(claim.claimDetails.timeline);
    expect(timelineResponseCCD).toHaveLength(2);
  });
});
