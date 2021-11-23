#!/bin/bash
set -e

localhost_ssl_folder="src/main/resources/localhost-ssl"

openssl req -x509 -sha256 -nodes -key "$localhost_ssl_folder"/localhost.key -new -subj "/C=UK/ST=London/L=London/O=MOJ/OU=CC/CN=localhost" -days 3650 > "$localhost_ssl_folder"/localhost-ca.crt

