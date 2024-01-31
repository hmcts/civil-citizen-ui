import {Bundle} from 'models/caseProgression/bundles/bundle';
import {BundlesFormatter} from 'services/features/caseProgression/bundles/bundlesFormatter';

const title = 'title';

describe('test of method orderBundlesNewToOld', () => {

  it('should order bundles by createdOn date', () => {
    //Given
    const oldestDate = new Date('01-01-2023');
    const middleDate = new Date('02-01-2023');
    const newestDate = new Date('03-01-2023');
    const caseBundles = [new Bundle(title, null, middleDate), new Bundle(title, null, newestDate), new Bundle(title, null, oldestDate)];

    //when
    BundlesFormatter.orderBundlesNewToOld(caseBundles);

    //Then
    expect(caseBundles[0].createdOn).toStrictEqual(newestDate);
    expect(caseBundles[1].createdOn).toStrictEqual(middleDate);
    expect(caseBundles[2].createdOn).toStrictEqual(oldestDate);
  });
  it('should order bundles by createdOn date, place those without dates last', () => {
    //Given
    const oldestDate = new Date('01-01-2023');
    const middleDate = new Date('02-01-2023');
    const newestDate = new Date('03-01-2023');
    const caseBundles = [new Bundle(title), new Bundle(title, null, middleDate), new Bundle(title, null, newestDate), new Bundle(title, null, oldestDate), new Bundle(title)];

    //when
    BundlesFormatter.orderBundlesNewToOld(caseBundles);

    //Then
    expect(caseBundles[0].createdOn).toStrictEqual(newestDate);
    expect(caseBundles[1].createdOn).toStrictEqual(middleDate);
    expect(caseBundles[2].createdOn).toStrictEqual(oldestDate);
    expect(caseBundles[3].createdOn).toBeNull();
    expect(caseBundles[4].createdOn).toBeNull();
  });
  it('should not return an error when no dates are present', () => {
    //Given
    const caseBundles = [new Bundle(title)];

    //when
    BundlesFormatter.orderBundlesNewToOld(caseBundles);

    //Then
    expect(caseBundles[0].createdOn).toBeNull();
  });

  it('should not return an error when list is empty', () => {
    //Given
    const caseBundles = [] as Bundle[];

    //when
    BundlesFormatter.orderBundlesNewToOld(caseBundles);

    //Then
    expect(caseBundles.length).toStrictEqual(0);
  });
});
