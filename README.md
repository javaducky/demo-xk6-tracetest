# Demo for Tracetest and xk6-tracetest
Demo files for the [_"Trace-based Testing with Tracetest"_](https://www.meetup.com/Kubernetes-Cloud-Native-STL/events/292026311/) ([Video](https://www.youtube.com/watch?v=EU-M75ZejHY)), originally presented to the _Kubernetes & Cloud Native STL_ meetup group.

## Prerequisites
* [git](https://git-scm.com/) - For accessing the sourcecode repositories
* [Docker](https://docs.docker.com/get-docker/) - For building our custom k6 images and running the examples
* [Tracetest](https://tracetest.io/download) - Installs the command-line interface (CLI) for Tracetest

## :raising_hand: How do I use this project?
Clone the repo, then go through the lab in the order they're provided---some labs may build upon an earlier example.


## Lab 1: Start Tracetest server with the sample application 
The Tracetest CLI provides the option to include the [Docker Compose](https://docs.docker.com/compose/) set up as well as the [Pokéshop demo application](https://github.com/kubeshop/pokeshop) to use for testing.

```bash
tracetest server install
```

When prompted by the command-line, select the following options:
1. Using Docker Compose
1. Just learning tracing! Install Tracetest, OpenTelemetry Collector and the sample app.

Run the configured server as instructed by the 
```bash
docker compose -f tracetest/docker-compose.yaml up -d
```

Open the Tracetest user interface at http://localhost:11633.

> ### :facepalm: Need a do-over?
> No problem. Just delete the `tracetest` directory and run the `tracetest server install` again.

## Lab 2: Creating and running tests
TODO 

- Create the Import, Add, and List tests using "HTTP Request" as your trigger
- Run a couple examples, highlight the traces and how to create assertions

> :point_up: TIP: For the sample applications, you can conveniently pull in examples.

## Lab 3: Simulating downstream failures
TODO 
- Shutdown the worker container to simulate a service being down 
- Run a test without assertions which gives false success
- Add downstream assertion
- Run a test to show failed operation

## Lab 4: Create some activity with k6 
Build custom k6 with [xk6-tracetest extension](https://github.com/kubeshop/xk6-tracetest). This allows k6 to generate load for the Pokémon application so we can analyze the traces.

```bash
docker run --rm -e GOOS=darwin -u "$(id -u):$(id -g)" -v "${PWD}:/xk6" \
  grafana/xk6 build latest \
  --with github.com/kubeshop/xk6-tracetest
```

You'll now have a k6 binary in the current directory ready for use with Tracetest. You can confirm by running a version-check:

```bash
./k6 version
```

For the k6 tests, we need to create new test definitions using the _TraceID_ trigger, defining `TRACE_ID` as your variable name! Update the `testId` constant in the `k6-tests/pokemon-test.js` script to match the actual id for your test definition! See the [documentation](https://docs.tracetest.io/tools-and-integrations/k6/#creating-your-tracetest-test) for more info.

```bash
./k6 run -o xk6-tracetest k6-tests/pokemon-import.js
```

This will execute several iterations of the _Import_ process which you may then view in the Tracetest user interface.

- :ballot_box_with_check: Experiment to create assertions to cause failing tests
- :ballot_box_with_check: Create `pokemon-add.js` and `pokemon-list.js` tests

### :thumbsup: Cleaning up
Feel free to clean-up resources by running:
```bash
docker compose -f tracetest/docker-compose.yaml down
```
For the next sections, we'll be using a fresh install.


## Lab 5: Running an e-commerce example application

### Install our system under test (SUT)
For this demonstration, we're using the [OpenTelemetry Astronomy Shop](https://github.com/open-telemetry/opentelemetry-demo) running within Docker.


```bash
# Clone if not already done
git clone https://github.com/open-telemetry/opentelemetry-demo.git
```

```bash
docker compose up -f opentelemetry-demo/docker-compose.yml --no-build
```

Once the images are built and containers are started you can access:

- Webstore: http://localhost:8080/
- Grafana: http://localhost:8080/grafana/
- Feature Flags UI: http://localhost:8080/feature/
- Load Generator UI: http://localhost:8080/loadgen/ (TODO: Need to set this up for k6!!!)
- Jaeger UI: http://localhost:8080/jaeger/ui/

### Start Tracetest
Let's connect a local Tracetest instance to the OTEL demo.

```bash
docker compose -f tracetest-otel/docker-compose.yml up -d
```

Once started, you'll be able to access http://localhost:11633. 
