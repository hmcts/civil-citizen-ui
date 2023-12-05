module.exports = {
  createCaseProgressionToHearingInitiated: (hearingDate) => {
    const hearingScheduledData = {
      event: 'HEARING_INITIATED',
      caseDataUpdate: {
        hearingNoticeList: 'SMALL_CLAIMS',
        hearingNoticeListOther: null,
        listingOrRelisting: 'LISTING',
        hearingLocation: {
          value: {
            code: '01691997-da6a-4357-b9c2-46c8b941c1d9',
            label: 'Central London County Court - Thomas More Building, Royal Courts of Justice, Strand, London - WC2A 2LL',
          },
          list_items: [
            {
              code: '01691997-da6a-4357-b9c2-46c8b941c1d9',
              label: 'Central London County Court - Thomas More Building, Royal Courts of Justice, Strand, London - WC2A 2LL',
            },
          ],
        },
        channel: 'IN_PERSON',
        hearingDate: hearingDate,
        hearingTimeHourMinute: '0930',
        hearingDuration: 'MINUTES_150',
        information: null,
      },
    };
    return hearingScheduledData;
  },
};
