import {Claim} from 'models/claim';
import {getClaimTimeline} from 'services/features/common/claimTimelineService';

describe('getClaimTimeline', () => {
  it('should return empty timeline when claim has no timeline of events', () => {
    expect(getClaimTimeline(new Claim(), 'en')).toEqual([]);
  });

  it('should format full dates and month and year only dates', () => {
    const claim = new Claim();
    claim.timelineOfEvents = [
      {id: '1', value: {timelineDate: '2024-03-15', timelineDay: '15', timelineMonth: '3', timelineYear: '2024', timelineDescription: 'Contract signed'}},
      {id: '2', value: {timelineDate: undefined, timelineMonth: '6', timelineYear: '2023', timelineDescription: 'Goods delivered'}},
      {id: '3', value: {timelineDate: '2022-01-01', timelineDescription: 'Existing claim event'}},
    ];

    expect(getClaimTimeline(claim, 'en')).toEqual([
      {timelineDate: '15 March 2024', timelineDescription: 'Contract signed'},
      {timelineDate: 'June 2023', timelineDescription: 'Goods delivered'},
      {timelineDate: '1 January 2022', timelineDescription: 'Existing claim event'},
    ]);
  });
});
