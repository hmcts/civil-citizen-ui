import request, {Response, SuperTest, Test} from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/sharedMocks';
import {app} from '../../../main/app';
import {
  ELIGIBILITY_CLAIM_VALUE_URL,
  ELIGIBILITY_SINGLE_DEFENDANT_URL,
  ELIGIBILITY_DEFENDANT_ADDRESS_URL,
  ELIGIBILITY_CLAIM_TYPE_URL,
  ELIGIBILITY_CLAIMANT_ADDRESS_URL,
  ELIGIBILITY_TENANCY_DEPOSIT_URL,
  ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL,
  ELIGIBILITY_DEFENDANT_AGE_URL,
  ELIGIBILITY_CLAIMANT_AGE_URL,
  ELIGIBILITY_HELP_WITH_FEES_URL,
  ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../main/routes/urls';
import {TotalAmountOptions} from '../../../main/common/models/eligibility/totalAmountOptions';
import {ClaimTypeOptions} from '../../../main/common/models/eligibility/claimTypeOptions';
import {YesNo} from '../../../main/common/form/models/yesNo';
import {AgeEligibilityOptions} from '../../../main/common/form/models/eligibility/defendant/AgeEligibilityOptions';

type EligibilityCookie = {
  totalAmount?: string;
  singleDefendant?: string;
  eligibleDefendantAddress?: string;
  claimType?: string;
  eligibleClaimantAddress?: string;
  tenancyDeposit?: string;
  governmentDepartment?: string;
  eligibilityDefendantAge?: string;
  claimantOver18?: string;
  eligibleHelpWithFees?: string;
};

type JourneyStep = {
  url: string;
  form: Record<string, string>;
  cookieKey: keyof EligibilityCookie;
  expectedCookieValue: string;
};

const NOT_ELIGIBLE_TITLE = 'You can’t use this service';

const postForm = async (agent: SuperTest<Test>, url: string, form: Record<string, string>): Promise<Response> => {
  return agent.post(url).send(form);
};

const getSetCookieHeaders = (header: string | string[] | undefined): string[] | undefined => {
  if (!header) {
    return undefined;
  }
  return Array.isArray(header) ? header : [header];
};

const decodeEligibilityCookie = (setCookieHeader?: string[]): EligibilityCookie | undefined => {
  if (!setCookieHeader?.length) {
    return undefined;
  }
  const eligibilityCookieHeader = setCookieHeader.find((cookieHeader) => cookieHeader.startsWith('eligibility='));
  if (!eligibilityCookieHeader) {
    return undefined;
  }

  const rawValue = eligibilityCookieHeader.split(';')[0].replace('eligibility=', '');
  const decoded = decodeURIComponent(rawValue);
  const withoutJsonPrefix = decoded.startsWith('j:') ? decoded.slice(2) : decoded;
  return JSON.parse(withoutJsonPrefix) as EligibilityCookie;
};

const postStepAndAssertCookie = async (agent: SuperTest<Test>, step: JourneyStep): Promise<void> => {
  const response = await postForm(agent, step.url, step.form);
  expect(response.status).toBe(302);
  const eligibilityCookie = decodeEligibilityCookie(getSetCookieHeaders(response.header['set-cookie']));
  expect(eligibilityCookie?.[step.cookieKey]).toBe(step.expectedCookieValue);
};

const runJourney = async (agent: SuperTest<Test>, steps: JourneyStep[]): Promise<void> => {
  for (const step of steps) {
    await postStepAndAssertCookie(agent, step);
  }
};

describe('Integration: Eligibility journey decision matrix', () => {
  it('routes unknown amount to not eligible', async () => {
    const postResponse = await request(app)
      .post(ELIGIBILITY_CLAIM_VALUE_URL)
      .send({totalAmount: TotalAmountOptions.UNKNOWN});
    expect(postResponse.status).toBe(302);

    expect(postResponse.header.location).toBe('/eligibility/not-eligible?reason=claim-value-not-known');
    const eligibilityCookie = decodeEligibilityCookie(getSetCookieHeaders(postResponse.header['set-cookie']));
    expect(eligibilityCookie?.totalAmount).toBe(TotalAmountOptions.UNKNOWN);

    const notEligibleResponse = await request(app).get(`${postResponse.header.location}&lang=en`).expect(200);
    expect(notEligibleResponse.text).toContain(NOT_ELIGIBLE_TITLE);
    expect(notEligibleResponse.text).toContain('You need to know the claim amount to use this service.');
  });

  it('routes claim over 25k to not eligible', async () => {
    const agent = request.agent(app);
    const postResponse = await agent
      .post(ELIGIBILITY_CLAIM_VALUE_URL)
      .send({totalAmount: TotalAmountOptions.OVER_25000});
    expect(postResponse.status).toBe(302);

    expect(postResponse.header.location).toBe('/eligibility/not-eligible?reason=claim-value-over-25000');
    const eligibilityCookie = decodeEligibilityCookie(getSetCookieHeaders(postResponse.header['set-cookie']));
    expect(eligibilityCookie?.totalAmount).toBe(TotalAmountOptions.OVER_25000);

    const notEligibleResponse = await agent.get(`${postResponse.header.location}&lang=en`).expect(200);
    expect(notEligibleResponse.text).toContain(NOT_ELIGIBLE_TITLE);
    expect(notEligibleResponse.text).toContain('This service is for claims of £25,000 or less.');
  });

  it('routes multiple defendants to not eligible', async () => {
    const agent = request.agent(app);
    await runJourney(agent, [
      {
        url: ELIGIBILITY_CLAIM_VALUE_URL,
        form: {totalAmount: TotalAmountOptions.LESS_25000},
        cookieKey: 'totalAmount',
        expectedCookieValue: TotalAmountOptions.LESS_25000,
      },
    ]);
    const response = await postForm(agent, ELIGIBILITY_SINGLE_DEFENDANT_URL, {option: YesNo.YES});
    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/eligibility/not-eligible?reason=multiple-defendants');
    const eligibilityCookie = decodeEligibilityCookie(getSetCookieHeaders(response.header['set-cookie']));
    expect(eligibilityCookie?.singleDefendant).toBe(YesNo.YES);

    const notEligibleResponse = await agent.get(`${response.header.location}&lang=en`).expect(200);
    expect(notEligibleResponse.text).toContain('You can’t use this service if this claim is against more than one person or organisation.');
  });

  it('routes defendant outside England/Wales to not eligible', async () => {
    const agent = request.agent(app);
    await runJourney(agent, [
      {
        url: ELIGIBILITY_CLAIM_VALUE_URL,
        form: {totalAmount: TotalAmountOptions.LESS_25000},
        cookieKey: 'totalAmount',
        expectedCookieValue: TotalAmountOptions.LESS_25000,
      },
      {
        url: ELIGIBILITY_SINGLE_DEFENDANT_URL,
        form: {option: YesNo.NO},
        cookieKey: 'singleDefendant',
        expectedCookieValue: YesNo.NO,
      },
    ]);
    const response = await postForm(agent, ELIGIBILITY_DEFENDANT_ADDRESS_URL, {option: YesNo.NO});
    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/eligibility/not-eligible?reason=defendant-address');
    const eligibilityCookie = decodeEligibilityCookie(getSetCookieHeaders(response.header['set-cookie']));
    expect(eligibilityCookie?.eligibleDefendantAddress).toBe(YesNo.NO);

    const notEligibleResponse = await agent.get(`${response.header.location}&lang=en`).expect(200);
    expect(notEligibleResponse.text).toContain('You can only use this service to claim against a person or organisation with an address in England or Wales.');
  });

  it('routes multiple claimants to not eligible', async () => {
    const agent = request.agent(app);
    await runJourney(agent, [
      {
        url: ELIGIBILITY_CLAIM_VALUE_URL,
        form: {totalAmount: TotalAmountOptions.LESS_25000},
        cookieKey: 'totalAmount',
        expectedCookieValue: TotalAmountOptions.LESS_25000,
      },
      {
        url: ELIGIBILITY_SINGLE_DEFENDANT_URL,
        form: {option: YesNo.NO},
        cookieKey: 'singleDefendant',
        expectedCookieValue: YesNo.NO,
      },
      {
        url: ELIGIBILITY_DEFENDANT_ADDRESS_URL,
        form: {option: YesNo.YES},
        cookieKey: 'eligibleDefendantAddress',
        expectedCookieValue: YesNo.YES,
      },
    ]);
    const response = await postForm(agent, ELIGIBILITY_CLAIM_TYPE_URL, {claimType: ClaimTypeOptions.MORE_THAN_ONE_PERSON_OR_ORGANISATION});
    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/eligibility/not-eligible?reason=multiple-claimants');
    const eligibilityCookie = decodeEligibilityCookie(getSetCookieHeaders(response.header['set-cookie']));
    expect(eligibilityCookie?.claimType).toBe(ClaimTypeOptions.MORE_THAN_ONE_PERSON_OR_ORGANISATION);

    const notEligibleResponse = await agent.get(`${response.header.location}&lang=en`).expect(200);
    expect(notEligibleResponse.text).toContain('You can’t use this service if more than one person or organisation is making the claim.');
  });

  it('routes claimant represented by solicitor to not eligible', async () => {
    const agent = request.agent(app);
    await runJourney(agent, [
      {
        url: ELIGIBILITY_CLAIM_VALUE_URL,
        form: {totalAmount: TotalAmountOptions.LESS_25000},
        cookieKey: 'totalAmount',
        expectedCookieValue: TotalAmountOptions.LESS_25000,
      },
      {
        url: ELIGIBILITY_SINGLE_DEFENDANT_URL,
        form: {option: YesNo.NO},
        cookieKey: 'singleDefendant',
        expectedCookieValue: YesNo.NO,
      },
      {
        url: ELIGIBILITY_DEFENDANT_ADDRESS_URL,
        form: {option: YesNo.YES},
        cookieKey: 'eligibleDefendantAddress',
        expectedCookieValue: YesNo.YES,
      },
    ]);
    const response = await postForm(agent, ELIGIBILITY_CLAIM_TYPE_URL, {claimType: ClaimTypeOptions.A_CLIENT});
    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/eligibility/not-eligible?reason=claim-on-behalf');
    const eligibilityCookie = decodeEligibilityCookie(getSetCookieHeaders(response.header['set-cookie']));
    expect(eligibilityCookie?.claimType).toBe(ClaimTypeOptions.A_CLIENT);

    const notEligibleResponse = await agent.get(`${response.header.location}&lang=en`).expect(200);
    expect(notEligibleResponse.text).toContain('This service is currently for claimants representing themselves.');
  });

  it('routes claimant without UK postcode to not eligible', async () => {
    const agent = request.agent(app);
    await runJourney(agent, [
      {
        url: ELIGIBILITY_CLAIM_VALUE_URL,
        form: {totalAmount: TotalAmountOptions.LESS_25000},
        cookieKey: 'totalAmount',
        expectedCookieValue: TotalAmountOptions.LESS_25000,
      },
      {
        url: ELIGIBILITY_SINGLE_DEFENDANT_URL,
        form: {option: YesNo.NO},
        cookieKey: 'singleDefendant',
        expectedCookieValue: YesNo.NO,
      },
      {
        url: ELIGIBILITY_DEFENDANT_ADDRESS_URL,
        form: {option: YesNo.YES},
        cookieKey: 'eligibleDefendantAddress',
        expectedCookieValue: YesNo.YES,
      },
      {
        url: ELIGIBILITY_CLAIM_TYPE_URL,
        form: {claimType: ClaimTypeOptions.JUST_MYSELF},
        cookieKey: 'claimType',
        expectedCookieValue: ClaimTypeOptions.JUST_MYSELF,
      },
    ]);
    const response = await postForm(agent, ELIGIBILITY_CLAIMANT_ADDRESS_URL, {option: YesNo.NO});
    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/eligibility/not-eligible?reason=claimant-address');
    const eligibilityCookie = decodeEligibilityCookie(getSetCookieHeaders(response.header['set-cookie']));
    expect(eligibilityCookie?.eligibleClaimantAddress).toBe(YesNo.NO);

    const notEligibleResponse = await agent.get(`${response.header.location}&lang=en`).expect(200);
    expect(notEligibleResponse.text).toContain('You need have a postal address in England or Wales to use this service.');
  });

  it('routes tenancy deposit claims to not eligible', async () => {
    const agent = request.agent(app);
    await runJourney(agent, [
      {
        url: ELIGIBILITY_CLAIM_VALUE_URL,
        form: {totalAmount: TotalAmountOptions.LESS_25000},
        cookieKey: 'totalAmount',
        expectedCookieValue: TotalAmountOptions.LESS_25000,
      },
      {
        url: ELIGIBILITY_SINGLE_DEFENDANT_URL,
        form: {option: YesNo.NO},
        cookieKey: 'singleDefendant',
        expectedCookieValue: YesNo.NO,
      },
      {
        url: ELIGIBILITY_DEFENDANT_ADDRESS_URL,
        form: {option: YesNo.YES},
        cookieKey: 'eligibleDefendantAddress',
        expectedCookieValue: YesNo.YES,
      },
      {
        url: ELIGIBILITY_CLAIM_TYPE_URL,
        form: {claimType: ClaimTypeOptions.JUST_MYSELF},
        cookieKey: 'claimType',
        expectedCookieValue: ClaimTypeOptions.JUST_MYSELF,
      },
      {
        url: ELIGIBILITY_CLAIMANT_ADDRESS_URL,
        form: {option: YesNo.YES},
        cookieKey: 'eligibleClaimantAddress',
        expectedCookieValue: YesNo.YES,
      },
    ]);
    const response = await postForm(agent, ELIGIBILITY_TENANCY_DEPOSIT_URL, {option: YesNo.YES});
    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/eligibility/not-eligible?reason=claim-is-for-tenancy-deposit');
    const eligibilityCookie = decodeEligibilityCookie(getSetCookieHeaders(response.header['set-cookie']));
    expect(eligibilityCookie?.tenancyDeposit).toBe(YesNo.YES);

    const notEligibleResponse = await agent.get(`${response.header.location}&lang=en`).expect(200);
    expect(notEligibleResponse.text).toContain('You can’t make a claim for a tenancy deposit using this service.');
  });

  it('routes government department claims to not eligible', async () => {
    const agent = request.agent(app);
    await runJourney(agent, [
      {
        url: ELIGIBILITY_CLAIM_VALUE_URL,
        form: {totalAmount: TotalAmountOptions.LESS_25000},
        cookieKey: 'totalAmount',
        expectedCookieValue: TotalAmountOptions.LESS_25000,
      },
      {
        url: ELIGIBILITY_SINGLE_DEFENDANT_URL,
        form: {option: YesNo.NO},
        cookieKey: 'singleDefendant',
        expectedCookieValue: YesNo.NO,
      },
      {
        url: ELIGIBILITY_DEFENDANT_ADDRESS_URL,
        form: {option: YesNo.YES},
        cookieKey: 'eligibleDefendantAddress',
        expectedCookieValue: YesNo.YES,
      },
      {
        url: ELIGIBILITY_CLAIM_TYPE_URL,
        form: {claimType: ClaimTypeOptions.JUST_MYSELF},
        cookieKey: 'claimType',
        expectedCookieValue: ClaimTypeOptions.JUST_MYSELF,
      },
      {
        url: ELIGIBILITY_CLAIMANT_ADDRESS_URL,
        form: {option: YesNo.YES},
        cookieKey: 'eligibleClaimantAddress',
        expectedCookieValue: YesNo.YES,
      },
      {
        url: ELIGIBILITY_TENANCY_DEPOSIT_URL,
        form: {option: YesNo.NO},
        cookieKey: 'tenancyDeposit',
        expectedCookieValue: YesNo.NO,
      },
    ]);
    const response = await postForm(agent, ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL, {option: YesNo.YES});
    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/eligibility/not-eligible?reason=government-department');
    const eligibilityCookie = decodeEligibilityCookie(getSetCookieHeaders(response.header['set-cookie']));
    expect(eligibilityCookie?.governmentDepartment).toBe(YesNo.YES);

    const notEligibleResponse = await agent.get(`${response.header.location}&lang=en`).expect(200);
    expect(notEligibleResponse.text).toContain('government departments');
  });

  it('routes claimant under 18 to not eligible', async () => {
    const agent = request.agent(app);
    await runJourney(agent, [
      {
        url: ELIGIBILITY_CLAIM_VALUE_URL,
        form: {totalAmount: TotalAmountOptions.LESS_25000},
        cookieKey: 'totalAmount',
        expectedCookieValue: TotalAmountOptions.LESS_25000,
      },
      {
        url: ELIGIBILITY_SINGLE_DEFENDANT_URL,
        form: {option: YesNo.NO},
        cookieKey: 'singleDefendant',
        expectedCookieValue: YesNo.NO,
      },
      {
        url: ELIGIBILITY_DEFENDANT_ADDRESS_URL,
        form: {option: YesNo.YES},
        cookieKey: 'eligibleDefendantAddress',
        expectedCookieValue: YesNo.YES,
      },
      {
        url: ELIGIBILITY_CLAIM_TYPE_URL,
        form: {claimType: ClaimTypeOptions.JUST_MYSELF},
        cookieKey: 'claimType',
        expectedCookieValue: ClaimTypeOptions.JUST_MYSELF,
      },
      {
        url: ELIGIBILITY_CLAIMANT_ADDRESS_URL,
        form: {option: YesNo.YES},
        cookieKey: 'eligibleClaimantAddress',
        expectedCookieValue: YesNo.YES,
      },
      {
        url: ELIGIBILITY_TENANCY_DEPOSIT_URL,
        form: {option: YesNo.NO},
        cookieKey: 'tenancyDeposit',
        expectedCookieValue: YesNo.NO,
      },
      {
        url: ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL,
        form: {option: YesNo.NO},
        cookieKey: 'governmentDepartment',
        expectedCookieValue: YesNo.NO,
      },
      {
        url: ELIGIBILITY_DEFENDANT_AGE_URL,
        form: {option: AgeEligibilityOptions.YES},
        cookieKey: 'eligibilityDefendantAge',
        expectedCookieValue: AgeEligibilityOptions.YES,
      },
    ]);
    const response = await postForm(agent, ELIGIBILITY_CLAIMANT_AGE_URL, {option: YesNo.NO});
    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/eligibility/not-eligible?reason=under-18');
    const eligibilityCookie = decodeEligibilityCookie(getSetCookieHeaders(response.header['set-cookie']));
    expect(eligibilityCookie?.claimantOver18).toBe(YesNo.NO);

    const notEligibleResponse = await agent.get(`${response.header.location}&lang=en`).expect(200);
    expect(notEligibleResponse.text).toContain('You need to be 18 or over to use this service.');
  });

  it('routes happy path to eligible outcome', async () => {
    const agent = request.agent(app);
    await runJourney(agent, [
      {
        url: ELIGIBILITY_CLAIM_VALUE_URL,
        form: {totalAmount: TotalAmountOptions.LESS_25000},
        cookieKey: 'totalAmount',
        expectedCookieValue: TotalAmountOptions.LESS_25000,
      },
      {
        url: ELIGIBILITY_SINGLE_DEFENDANT_URL,
        form: {option: YesNo.NO},
        cookieKey: 'singleDefendant',
        expectedCookieValue: YesNo.NO,
      },
      {
        url: ELIGIBILITY_DEFENDANT_ADDRESS_URL,
        form: {option: YesNo.YES},
        cookieKey: 'eligibleDefendantAddress',
        expectedCookieValue: YesNo.YES,
      },
      {
        url: ELIGIBILITY_CLAIM_TYPE_URL,
        form: {claimType: ClaimTypeOptions.JUST_MYSELF},
        cookieKey: 'claimType',
        expectedCookieValue: ClaimTypeOptions.JUST_MYSELF,
      },
      {
        url: ELIGIBILITY_CLAIMANT_ADDRESS_URL,
        form: {option: YesNo.YES},
        cookieKey: 'eligibleClaimantAddress',
        expectedCookieValue: YesNo.YES,
      },
      {
        url: ELIGIBILITY_TENANCY_DEPOSIT_URL,
        form: {option: YesNo.NO},
        cookieKey: 'tenancyDeposit',
        expectedCookieValue: YesNo.NO,
      },
      {
        url: ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL,
        form: {option: YesNo.NO},
        cookieKey: 'governmentDepartment',
        expectedCookieValue: YesNo.NO,
      },
      {
        url: ELIGIBILITY_DEFENDANT_AGE_URL,
        form: {option: AgeEligibilityOptions.YES},
        cookieKey: 'eligibilityDefendantAge',
        expectedCookieValue: AgeEligibilityOptions.YES,
      },
      {
        url: ELIGIBILITY_CLAIMANT_AGE_URL,
        form: {option: YesNo.YES},
        cookieKey: 'claimantOver18',
        expectedCookieValue: YesNo.YES,
      },
    ]);
    const response = await postForm(agent, ELIGIBILITY_HELP_WITH_FEES_URL, {option: YesNo.NO});
    expect(response.status).toBe(302);
    expect(response.header.location).toBe(ELIGIBLE_FOR_THIS_SERVICE_URL);
    const eligibilityCookie = decodeEligibilityCookie(getSetCookieHeaders(response.header['set-cookie']));
    expect(eligibilityCookie?.eligibleHelpWithFees).toBe(YesNo.NO);

    const eligibleResponse = await agent.get(`${ELIGIBLE_FOR_THIS_SERVICE_URL}?lang=en`).expect(200);
    expect(eligibleResponse.text).toContain('Based on your answers you can make a money claim using this service.');
    expect(eligibleResponse.text).toContain('Continue');
  });
});
