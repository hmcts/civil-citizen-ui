export const functionalTestRouterJsonBody = (
  isJson: boolean,
  body: unknown,
): string | undefined => {
  if (!isJson || !body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return undefined;
  }
  return JSON.stringify(body);
};
