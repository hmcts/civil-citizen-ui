/* tslint:disable:no-unused-expression */

import chai from 'chai';
import sinon from 'sinon';
import spies from 'sinon-chai';
import { mockReq as req, mockRes as res } from 'sinon-express-mock';

import { User } from 'idam/user';

import { claimStoreServiceMock } from 'test/http-mocks/claim-store';

import { attachDefaultHooks } from 'test/hooks';
import { ClaimantResponseGuard } from 'claimant-response/guards/claimantResponseGuard';
import { ClaimantResponseType } from 'claims/models/claimant-response/claimantResponseType';

chai.use(spies);

describe('Claimant Response guard', () => {
  attachDefaultHooks();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const next = (e?: any): void => {
    return void 0;
  };

  beforeEach(() => {
    const claim = {
      ...claimStoreServiceMock.sampleClaimObj,
      claimantResponse: { type: ClaimantResponseType.ACCEPTATION, amountPaid: 100 },
    };

    res.locals = {
      claim,
      user: new User('1', 'user@example.com', 'John', 'Smith', [], 'citizen', ''),
    };
    res.redirect = sinon.spy((location: string): void => {
      return void 0;
    });
  });

  context('When the claim has a claimant response', () => {
    it('should not pass the request through', async () => {
      const spy = sinon.spy(next);
      ClaimantResponseGuard.checkClaimantResponseDoesNotExist()(req, res, spy);

      chai.expect(spy).to.have.not.been.called;
    });
  });

  context('When the claim has no claimant response', () => {
    beforeEach(() => {
      res.locals.claim.claimantResponse = undefined;
    });

    it('should pass the request through', async () => {
      const spy = sinon.spy(next);
      ClaimantResponseGuard.checkClaimantResponseDoesNotExist()(req, res, spy);

      chai.expect(spy).to.have.been.called;
    });
  });
});
