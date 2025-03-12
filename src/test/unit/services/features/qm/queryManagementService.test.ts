import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getCancelUrl, getQueryManagement, saveQueryManagement} from 'services/features/qm/queryManagementService';
import {QueryManagement, WhatDoYouWantToDo, WhatToDoTypeOption} from 'form/models/qm/queryManagement';
import express from 'express';
import * as utilityService from 'modules/utilityService';
import {Claim} from 'models/claim';

jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/utilityService');

const req = {params: {id: '123'}} as unknown as express.Request;
const mockGetClaimById = utilityService.getClaimById as jest.Mock;

describe('save queryManagement data', () => {
  it('should save data successfully when query management not exists', async () => {
    //Given
    const claimExpected = new Claim();
    claimExpected.queryManagement = new QueryManagement();
    claimExpected.queryManagement.whatDoYouWantToDo = new WhatDoYouWantToDo(WhatToDoTypeOption.CHANGE_CASE);
    const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
    mockGetClaimById.mockImplementation(async () => {
      return new Claim();
    });
    //when
    await saveQueryManagement('1', new WhatDoYouWantToDo(WhatToDoTypeOption.CHANGE_CASE), 'whatDoYouWantToDo', req);
    //then
    expect(spySave).toBeCalledWith('1',claimExpected);

  });

  it('should save data successfully when query management exists', async () => {
    //Given
    const claimExpected = new Claim();
    claimExpected.queryManagement = new QueryManagement();
    claimExpected.queryManagement.whatDoYouWantToDo = new WhatDoYouWantToDo(WhatToDoTypeOption.CHANGE_CASE);
    const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
    mockGetClaimById.mockImplementation(async () => {
      return claimExpected;
    });
    //when
    await saveQueryManagement('1', new WhatDoYouWantToDo(WhatToDoTypeOption.CHANGE_CASE), 'whatDoYouWantToDo', req);
    //then
    expect(spySave).toBeCalledWith('1',claimExpected);

  });
});

describe('get queryManagement', () => {
  it('should get data successfully when query management not exists', async () => {
    //Given
    const claimExpected = new Claim();
    claimExpected.queryManagement = new QueryManagement();
    claimExpected.queryManagement.whatDoYouWantToDo = new WhatDoYouWantToDo(WhatToDoTypeOption.CHANGE_CASE);
    mockGetClaimById.mockImplementation(async () => {
      return new Claim();
    });
    //when
    const result = await getQueryManagement('1', req);
    //then
    expect(result).toEqual(new QueryManagement());

  });

  it('should get data successfully when query management exists', async () => {
    //Given
    const claimExpected = new Claim();
    claimExpected.queryManagement = new QueryManagement();
    claimExpected.queryManagement.whatDoYouWantToDo = new WhatDoYouWantToDo(WhatToDoTypeOption.CHANGE_CASE);
    mockGetClaimById.mockImplementation(async () => {
      return claimExpected;
    });
    //when
    const result = await getQueryManagement('1', req);
    //then
    expect(result).toEqual(claimExpected.queryManagement);

  });

});

describe('get CancelUrl', () => {
  it('get cancel url', async () => {
    //when
    const result = getCancelUrl('1');
    //then
    expect(result).toEqual('/case/1/queryManagement/cancel');

  });

});

