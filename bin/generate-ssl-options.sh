#!/usr/bin/env bash
#
# Script to generate private RSA key and a self-signed certificate under src/main/resources/localhost-ssl (git-ignored)
# These resources are used for exposing the application via HTTPS in development environment. They must not be used
# in other environments, as their purpose is to provide consistency, not security.

localhost_ssh_folder="src/main/resources/localhost-ssl"

if [ -f "$localhost_ssh_folder"/localhost.key -a -f "$localhost_ssh_folder"/localhost.crt ]
then
  echo "SSL files exist already. Going to re-use them"
else
  mkdir -p "$localhost_ssh_folder"
  openssl req -nodes -x509 -newkey rsa:4096 -keyout "$localhost_ssh_folder"/localhost.key -out "$localhost_ssh_folder"/localhost.crt -sha256 -days 3650 -subj "/C=GB/ST=A/L=B/O=C/OU=D/CN=E"
fi
