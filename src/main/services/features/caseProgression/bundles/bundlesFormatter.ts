import {Bundle} from 'models/caseProgression/bundles/bundle';

export class BundlesFormatter {

  static orderBundlesNewToOld(documentsWithDates: Bundle[]): Bundle[] {

    documentsWithDates.sort((a: Bundle, b: Bundle) => {

      return +b.createdOn - +a.createdOn;
    });

    return documentsWithDates;
  }
}
