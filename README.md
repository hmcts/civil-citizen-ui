# Civil Citizen UI

[![Greenkeeper badge](https://badges.greenkeeper.io/hmcts/civil-citizen-ui.svg)](https://greenkeeper.io/)

[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

[![codecov](https://codecov.io/gh/hmcts/civil-citizen-ui/branch/master/graph/badge.svg)](https://codecov.io/gh/hmcts/civil-citizen-ui)

## Getting Started

### Prerequisites

Running the application requires the following tools to be installed in your environment:

  * [Node.js](https://nodejs.org/) v14.0.0 or later
  * [yarn](https://yarnpkg.com/)
  * [Docker](https://www.docker.com)

### Running the application

Install dependencies by executing the following command:

 ```bash
$ yarn install
 ```
Bundle:

```bash
$ yarn webpack
```

Run:

```bash
$ yarn start
```

The application's home page will be available at https://localhost:3001

### Running with Docker

Create docker image:

```bash
  docker-compose build
```

Run the application by executing the following command:

```bash
  docker-compose up
```

This will start the frontend container exposing the application's port

In order to test if the application is up, you can visit https://localhost:3001 in your browser.

## Developing

### Code style

We use [ESLint](https://github.com/typescript-eslint/typescript-eslint)
alongside [stylelint](https://github.com/stylelint/stylelint)

Running the linting with auto fix:
```bash
$ yarn lint --fix
```

### Running the tests

This template app uses [Jest](https://jestjs.io//) as the test engine. You can run unit tests by executing
the following command:

```bash
$ yarn test
```

Here's how to run functional tests (the template contains just one sample test):

```bash
$ yarn test:routes
```

Running accessibility tests:

```bash
$ yarn test:a11y
```

Running functional tests:

Update required secrets on your machine then run below command

```bash
$ yarn test:functional
```
Running E2E tests:

For that we need to follow three steps:
1) Start wiremock server
```bash
$ yarn wiremock:start
```
2) Start the application as E2E
```bash
$ yarn start:e2e
```
3) Execute E2E test
```bash
$ yarn test:e2e
```

Running Preview pipeline :

Raise a PR and add below labels to run the pipeline without any issues
```bash
pr-values:elasticsearch
```
Add "enable_keep_helm" label to retain helm release on preview
Add "pr-values:enableNotifyEmails" label to be able to send live notifications on the PR

Running Crossbrowser tests:

Install saucelabs on local machine

```bash
$ yarn test:crossbrowser
```

Make sure all the paths in your application are covered by accessibility tests (see [a11y.test.ts](src/test/a11y/a11y.test.ts)).

### Security

#### CSRF prevention

[Cross-Site Request Forgery](https://github.com/pillarjs/understanding-csrf) prevention has already been
set up in this template, at the application level. However, you need to make sure that CSRF token
is present in every HTML form that requires it. For that purpose you can use the `csrfProtection` macro,
included in this template app. Your njk file would look like this:

```
{% from "macros/csrf.njk" import csrfProtection %}
...
<form ...>
  ...
    {{ csrfProtection(csrfToken) }}
  ...
</form>
...
```

#### Helmet

This application uses [Helmet](https://helmetjs.github.io/), which adds various security-related HTTP headers
to the responses. Apart from default Helmet functions, following headers are set:

* [Referrer-Policy](https://helmetjs.github.io/docs/referrer-policy/)
* [Content-Security-Policy](https://helmetjs.github.io/docs/csp/)

There is a configuration section related with those headers, where you can specify:
* `referrerPolicy` - value of the `Referrer-Policy` header


Here's an example setup:

```json
    "security": {
      "referrerPolicy": "origin",
    }
```

Make sure you have those values set correctly for your application.

### Healthcheck

The application exposes a health endpoint (https://localhost:3001/health), created with the use of
[Nodejs Healthcheck](https://github.com/hmcts/nodejs-healthcheck) library. This endpoint is defined
in [health.ts](src/main/routes/health.ts) file. Make sure you adjust it correctly in your application.
In particular, remember to replace the sample check with checks specific to your frontend app,
e.g. the ones verifying the state of each service it depends on.

## Adding Git Conventions

### Include the git conventions.
* Make sure your git version is at least 2.9 using the `git --version` command
* Run the following command:
```
git config --local core.hooksPath .git-config/hooks
```
Once the above is done, you will be required to follow specific conventions for your commit messages and branch names.

If you violate a convention, the git error message will report clearly the convention you should follow and provide
additional information where necessary.

*Optional:*
* Install this plugin in Chrome: https://github.com/refined-github/refined-github

  It will automatically set the title for new PRs according to the first commit message, so you won't have to change it manually.

  Note that it will also alter other behaviours in GitHub. Hopefully these will also be improvements to you.

*In case of problems*

1. Get in touch with your Technical Lead so that they can get you unblocked
2. If the rare eventuality that the above is not possible, you can disable enforcement of conventions using the following command

   `git config --local --unset core.hooksPath`

   Still, you shouldn't be doing it so make sure you get in touch with a Technical Lead soon afterwards.

## Development / Debugging Environment - Preview with Mirrord

As an alternative for a development environment there is a procedure in place where after running the command
below the required services for Civil are created in Preview under the developer's name, so these will be exclusively
for the named developer use.

While connected to the VPN simply run one of the below commands from your project's (civil-citizer-ui) folder:

Note: be sure to have Docker running
```shell
npx @hmcts/dev-env@latest && ./bin/setup-devuser-preview-env.sh
```
You can optionally specify a branch for CCD definitions and Camunda definitions like below or leave it blank to use master.

```shell
npx @hmcts/dev-env@latest && ./bin/setup-devuser-preview-env.sh ccdBranchName camundaBranchName generalAppCCDBranch dmnBranch waStandaloneBranch
```

Once the pods are up and running you can connect to them using a plugin called Mirrord on Intellij or VSCode.
https://mirrord.dev

If you want to clean up the environment just run:

```shell
npx @hmcts/dev-env@latest --delete
```

To run the specialised charts, where you can get Elasticsearch for instance, run:

```shell
npx @hmcts/dev-env@latest --template values.elasticsearch.preview.template.yaml && ./bin/setup-devuser-preview-env.sh
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

