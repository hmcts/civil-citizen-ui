import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {
  deleteQueryManagement,
  getCancelUrl,
  getCaption,
  getQueryManagement,
  saveQueryManagement,
} from 'services/features/queryManagement/queryManagementService';
import {QueryManagement, WhatDoYouWantToDo, WhatToDoTypeOption} from 'form/models/queryManagement/queryManagement';
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

  it('should remove data successfully when query management exists', async () => {
    //Given
    const claimExpected = new Claim();
    claimExpected.queryManagement = new QueryManagement();
    claimExpected.queryManagement.whatDoYouWantToDo = new WhatDoYouWantToDo(WhatToDoTypeOption.CHANGE_CASE);
    const spyDelete = jest.spyOn(draftStoreService, 'deleteFieldDraftClaimFromStore');
    mockGetClaimById.mockImplementation(async () => {
      return claimExpected;
    });
    //when
    await deleteQueryManagement('1', req);
    //then
    expect(spyDelete).toBeCalledTimes(1);

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

describe('get Caption', () => {
  it('get caption GET_UPDATE', async () => {
    //when
    const result = getCaption(WhatToDoTypeOption.GET_UPDATE);
    //then
    expect(result).toEqual('PAGES.QM.CAPTIONS.GET_UPDATE');

  });

  it('get caption SEND_UPDATE', async () => {
    //when
    const result = getCaption(WhatToDoTypeOption.SEND_UPDATE);
    //then
    expect(result).toEqual('PAGES.QM.CAPTIONS.SEND_UPDATE');

  });

  it('get caption SEND_DOCUMENTS', async () => {
    //when
    const result = getCaption(WhatToDoTypeOption.SEND_DOCUMENTS);
    //then
    expect(result).toEqual('PAGES.QM.CAPTIONS.SEND_DOCUMENTS');

  });

  it('get caption SOLVE_PROBLEM', async () => {
    //when
    const result = getCaption(WhatToDoTypeOption.SOLVE_PROBLEM);
    //then
    expect(result).toEqual('PAGES.QM.CAPTIONS.SOLVE_PROBLEM');

  });

  it('get caption MANAGE_HEARING', async () => {
    //when
    const result = getCaption(WhatToDoTypeOption.MANAGE_HEARING);
    //then
    expect(result).toEqual('PAGES.QM.CAPTIONS.MANAGE_HEARING');

  });

});

