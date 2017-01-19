#!/bin/bash

if [ $# -ne 1 ]
then
	echo >&2 "Usage: $0 <version>"
	exit 1
fi

version=$1

npm run prepublish
aws --profile=kiln s3 --region=eu-west-1 cp --acl=public-read slider.js s3://cdn.flourish.rocks/slider-v"$version".js
aws --profile=kiln s3 --region=eu-west-1 cp --acl=public-read slider-full.js s3://cdn.flourish.rocks/slider-v"$version".full.js

aws --profile=kiln s3 --region=eu-west-1 cp --acl=public-read slider.min.js s3://cdn.flourish.rocks/slider-v"$version".min.js
aws --profile=kiln s3 --region=eu-west-1 cp --acl=public-read slider-full.min.js s3://cdn.flourish.rocks/slider-v"$version".full.min.js
