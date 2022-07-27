import {
  NumberOfChildren,
} from '../../../../../../../main/common/form/models/statementOfMeans/dependants/numberOfChildren';

describe('Number Of Children model tests', () => {
  it('should have no children when all undefined', () => {
    //Given
    const numberOfChildren = new NumberOfChildren(undefined, undefined, undefined);
    //Then
    expect(numberOfChildren.totalNumberOfChildren()).toBe(0);
  });
  it('should have no children when all fractions i.e. not Integers', () => {
    //Given
    const numberOfChildren = new NumberOfChildren(2.3, 1.4, 0.4);
    //Then
    expect(numberOfChildren.totalNumberOfChildren()).toBe(0);
  });
  it('should have 2 children when under11 is 2, rest undefined', () => {
    //Given
    const numberOfChildren = new NumberOfChildren(2, undefined, undefined);
    //Then
    expect(numberOfChildren.totalNumberOfChildren()).toBe(2);
  });
  it('should have 6 children when each entry is 2', () => {
    //Given
    const numberOfChildren = new NumberOfChildren(2, 2, 2);
    //Then
    expect(numberOfChildren.totalNumberOfChildren()).toBe(6);
  });
});
