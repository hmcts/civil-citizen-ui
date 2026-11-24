import {readFileSync} from 'fs';
import {resolve} from 'path';
import {load} from 'js-yaml';

interface DeploymentValues {
  nodejs: {
    environment?: Record<string, string | number | boolean>;
    keyVaults: {'civil-cui': {secrets: unknown[]}};
  };
}

const values = (file: string): DeploymentValues =>
  load(readFileSync(resolve('charts/civil-citizen-ui', file), 'utf8')) as DeploymentValues;

const defaults = values('values.yaml').nodejs;
const preview = values('values.preview.template.yaml').nodejs;

describe('Preview Redis deployment', () => {
  it('switches the host, TLS port and matching access key together', () => {
    expect({...defaults.environment, ...preview.environment}).toMatchObject({
      REDIS_HOST: 'civil-citizen-ui-{{ .Values.global.environment }}.uksouth.redis.azure.net',
      REDIS_PORT: 10000,
      REDIS_TLS: true,
    });
    expect(preview.keyVaults['civil-cui'].secrets).toContainEqual({
      name: 'managed-redis-access-key', alias: 'draft-store-access-key',
    });
    expect(preview.keyVaults['civil-cui'].secrets).not.toContain('draft-store-access-key');
  });

  it.each(['values.yaml', 'values.aat.template.yaml'])('keeps %s on the existing cache', file => {
    const environment = values(file).nodejs;
    expect({...defaults.environment, ...environment.environment}).toMatchObject({
      REDIS_HOST: 'civil-citizen-ui-draft-store-{{ .Values.global.environment }}.redis.cache.windows.net',
      REDIS_PORT: 6380,
      REDIS_TLS: true,
    });
    expect(environment.keyVaults['civil-cui'].secrets).toContain('draft-store-access-key');
    expect(environment.keyVaults['civil-cui'].secrets).not.toContainEqual({
      name: 'managed-redis-access-key', alias: 'draft-store-access-key',
    });
  });
});
