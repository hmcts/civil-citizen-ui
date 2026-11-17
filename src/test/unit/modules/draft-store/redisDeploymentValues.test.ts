import {readFileSync} from 'fs';
import {resolve} from 'path';
import {load} from 'js-yaml';

interface DeploymentValues {
  nodejs: {keyVaults: {'civil-cui': {secrets: unknown[]}}};
}

const secrets = (file: string): unknown[] => {
  const values = load(readFileSync(resolve('charts/civil-citizen-ui', file), 'utf8')) as DeploymentValues;
  return values.nodejs.keyVaults['civil-cui'].secrets;
};

describe('Managed Redis secret overrides', () => {
  it.each([
    ['values.yaml', 'values.managed-redis.yaml'],
    ['values.aat.template.yaml', 'values.managed-redis.yaml'],
    ['values.preview.template.yaml', 'values.managed-redis.preview.yaml'],
  ])('preserves every unrelated secret from %s', (original, override) => {
    // Helm replaces this entire list. Dropping another secret or changing the
    // LaunchDarkly environment would break an otherwise valid Redis cutover.
    expect(secrets(override)).toEqual(secrets(original).map(secret =>
      secret === 'draft-store-access-key'
        ? {name: 'managed-redis-access-key', alias: 'draft-store-access-key'}
        : secret,
    ));
  });
});
