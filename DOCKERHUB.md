# Stacktical Bench

This container provides you with the Stacktical Scalability Benchmarking application. It's an effortless way to add Scalability Testing to your CI/CD pipeline and detect scalability-impacting changes before they ship to production.

![Stacktical](https://stacktical.com/assets/img/stacktical_large_light.png)

## What is Stacktical?
Stacktical is a Continuous Scalability Testing platform that helps companies ship smarter, safer and cheaper online softwares using predictive technologies and AI.

Enter the world of scalability-driven software engineering and master the footprint of building great softwares in an ultra competitive, global market.
For more information about Stacktical, go to [https://stacktical.com](https://stacktical.com)

## Usage

### Register your application on [Stacktical](https://stacktical.com)

Upon a ownership verification of your application service an `STACKTICAL_APIKEY`, `STACKTICAL_APPID` and `STACKTICAL_SVCID` are provided. Those will allow you to securely test your scalability with the Stacktical bench image. 

### Run a Scalability Test in your CI/CD pipeline

```
docker run --rm \
  -e STACKTICAL_APIKEY={Stacktical Api Key} \
  -e STACKTICAL_APPID={Application Id} \
  -e STACKTICAL_SVCID={Application Service Id} \
  --name stacktical-bench stacktical/bench:latest
```

