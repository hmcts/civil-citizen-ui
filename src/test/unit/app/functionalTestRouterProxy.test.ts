import {functionalTestRouterJsonBody} from '../../../main/app/functionalTestRouterProxy';

describe('functionalTestRouterJsonBody', () => {
  it('does not add an empty body to a bodyless admin request', () => {
    expect(functionalTestRouterJsonBody(false, {})).toBeUndefined();
    expect(functionalTestRouterJsonBody(true, {})).toBeUndefined();
  });

  it('serializes a JSON mapping payload', () => {
    expect(functionalTestRouterJsonBody(true, {priority: 100})).toBe('{"priority":100}');
  });
});
