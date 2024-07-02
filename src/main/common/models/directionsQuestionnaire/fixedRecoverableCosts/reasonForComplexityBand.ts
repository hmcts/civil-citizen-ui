export class ReasonForComplexityBand {

  title = 'PAGES.COMPLEXITY_BAND_REASON.TEXT_AREA.LABEL';
  hint = 'PAGES.COMPLEXITY_BAND_REASON.TEXT_AREA.HINT';

  reasonsForBandSelection?: string;

  constructor(reasonsForBandSelection?: string) {
    this.reasonsForBandSelection = reasonsForBandSelection;
  }
}
