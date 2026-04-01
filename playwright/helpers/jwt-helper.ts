function base64url(data: string): string {
  return Buffer.from(data).toString('base64url');
}

function buildJwt(header: object, payload: object, signature: string = ''): string {
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

const defaultPayload = {
  sub: 'fake-user-id-12345',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  tokenName: 'access_token',
  aud: 'civil_citizen_ui',
  roles: ['citizen'],
};

export function createFakeJwt(): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const fakeSignature = base64url('this-is-a-fake-signature');
  return buildJwt(header, defaultPayload, fakeSignature);
}

export function createAlgNoneJwt(): string {
  const header = { alg: 'none', typ: 'JWT' };
  return buildJwt(header, defaultPayload, '');
}

export function createExpiredJwt(): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    ...defaultPayload,
    exp: Math.floor(Date.now() / 1000) - 3600,
    iat: Math.floor(Date.now() / 1000) - 7200,
  };
  const fakeSignature = base64url('expired-token-signature');
  return buildJwt(header, payload, fakeSignature);
}

export function createOtherUserJwt(userId: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    ...defaultPayload,
    sub: userId,
  };
  const fakeSignature = base64url('other-user-signature');
  return buildJwt(header, payload, fakeSignature);
}

export function createRoleEscalationJwt(): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    ...defaultPayload,
    roles: ['caseworker', 'caseworker-civil', 'caseworker-civil-judge', 'admin'],
  };
  const fakeSignature = base64url('role-escalation-signature');
  return buildJwt(header, payload, fakeSignature);
}
