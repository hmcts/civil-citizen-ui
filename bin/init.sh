#!/usr/bin/env bash
#
# Script to initialise project by executing steps as follows:
#   - Replace port number
#   - Replace package `demo`
#   - Replace slug from `spring-boot-template` to one of two (first in first used):
#      - user input
#      - git config value of the root project. Value in use: `remote.origin.url`
#   - Clean-up README file from template related info
#   - Self-destruct

read -p "Port number for new app: " port
read -p "Product name for new app (to replace rpe product references): " product
read -p "Component name for new app (to replace rpe component references) : " component

declare -a files_with_port=(Dockerfile README.md src/main/server.ts docker-compose.yml charts/rpe-expressjs-template/values.yaml)
declare -a files_with_product=(package.json Jenkinsfile_CNP.disabled Jenkinsfile_nightly docker-compose.yml src/main/modules/properties-volume/index.ts src/main/modules/appinsights/index.ts charts/rpe-expressjs-template/Chart.yaml charts/rpe-expressjs-template/values.yaml Dockerfile README.md sonar-project.properties)

# Replace port number
for i in ${files_with_port[@]}
do
  perl -i -pe "s/3100/$port/g" ${i}
done

# Replace spring-boot-template slug
for i in ${files_with_product[@]}
do
  perl -i -pe "s/rpe/$product/g" ${i}
  perl -i -pe "s/expressjs-template/$component/g" ${i}
done

# Rename directory to provided package name
git mv charts/rpe-expressjs-template/ charts/${product}-${component}

# Rename CNP file
git mv Jenkinsfile_CNP.disabled Jenkinsfile_CNP

declare -a headers_to_delete=("Purpose" "What's inside" "Setup" )

# Clean-up README file
for i in "${headers_to_delete[@]}"
do
  perl -0777 -i -p0e "s/## $i.+?\n(## )/\$1/s" README.md
done

# Rename title to slug
perl -i -pe "s/.*\n/# ${product}-${component}\n/g if 1 .. 1" README.md

# remove ci checks github actions.
rm -r .github/workflows

# Self-destruct
rm bin/init.sh
