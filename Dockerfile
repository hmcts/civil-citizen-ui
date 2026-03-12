# ---- Base image ----
# Use 22 until base/node:24-alpine is available in hmctspublic.azurecr.io
FROM hmctspublic.azurecr.io/base/node:22-alpine as base
COPY --chown=hmcts:hmcts . .
RUN yarn workspaces focus --all --production \
  && yarn cache clean

# ---- Build image ----
FROM base as build
RUN yarn install && yarn build:prod

# ---- Runtime image ----
FROM base as runtime
RUN rm -rf webpack/ webpack.config.js
COPY --from=build $WORKDIR/src/main ./src/main
# TODO: expose the right port for your application
EXPOSE 3001
