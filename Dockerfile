# ---- Base image ----
FROM hmctsprod.azurecr.io/base/node:24-alpine as base

RUN if ! grep -q '^hmcts:' /etc/group 2>/dev/null; then \
      addgroup -S hmcts -g 1000; \
    fi && \
    if ! grep -q '^hmcts:' /etc/passwd 2>/dev/null; then \
      adduser -S hmcts -u 1000 -G hmcts -h /home/hmcts -s /sbin/nologin; \
    fi

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
