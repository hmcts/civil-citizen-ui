import { config } from './env-config';

export async function getAdminToken(): Promise<string> {
  const response = await fetch(
    `${config.idamApiUrl}/loginUser?username=${encodeURIComponent(config.adminUser)}&password=${config.adminPassword}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );
  const data = await response.json();
  return data.access_token;
}

export async function createTestUser(email: string, password: string, role = 'citizen'): Promise<string> {
  const token = await getAdminToken();
  const response = await fetch(`${config.idamTestSupportApiUrl}/test/idam/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      password,
      user: {
        email,
        forename: 'Security',
        surname: 'Test',
        displayName: 'Security Test',
        roleNames: [role],
      },
    }),
  });
  const data = await response.json();
  return data.id;
}

export async function deleteTestUser(email: string): Promise<void> {
  const token = await getAdminToken();
  await fetch(`${config.idamTestSupportApiUrl}/test/idam/users/${email}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}
