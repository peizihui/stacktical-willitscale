# stacktical-willitscale

Stacktical-willitscale is an effortless way to add Scalability Testing capabilities and SLO generation to your CI/CD pipeline and detect scalability-impacting changes before they ship to production.

## Requirements
* An activated Stacktical account (sign up here if needed)
* A Tech Stack representing your project
* A configured Service in your Tech Stack
* Docker

## Docker Application parameters

If all requirements are met, the Tech Stack management screen should provide you with the credentials needed to use this Docker Application, namely:

* The STACKTICAL_APPID
* The STACKTICAL_APIKEY
* The STACKTICAL_SVCID

Note:

Are you a Slack user? We highly recommend that you link your Stacktical account to your Slack team in the Service section to share your Scalability Report on your configured Slack channel, every time you do a test. It's a great way to keep all scalability stakeholders in the loop.

## Using this Docker Application to run a Scalability Test

Now that you have your Tech Stack project credentials and a Service identifier, you can run a load test and scalability test in one go with your Stacktical willitscale Docker application.

First, download the container using:

`docker pull stacktical/willitscale:latest`

Then, use it like this:

```
docker run --rm \
  --ulimit nofile=32768:65536 \
  -e STACKTICAL_APPID={MY_TECH_STACK_APP_ID} \
  -e STACKTICAL_APIKEY={MY_TECH_STACK_API_KEY} \
  -e STACKTICAL_SVCID={MY_TESTED_SERVICE_ID} \
  --name willitscale stacktical/willitscale:latest
Replace everything between {} with your own parameters.
```

Congratulations, your scalability test should be running by now!

## About Stacktical

Stacktical is a french software company specialized in applying predictive and blockchain technologies to performance, employee and customer management practices.
