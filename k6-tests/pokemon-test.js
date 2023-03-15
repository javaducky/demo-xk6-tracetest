import { check, sleep } from "k6";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.2/index.js";
import { Http, Tracetest } from "k6/x/tracetest";

export const options = {
  vus: 1,
  duration: "6s",
};

// BE SURE TO CHECK THIS!!! Should match the definition identifier for your test.
const testId = "i_VVpEa4R";

const tracetest = Tracetest({
  serverUrl: "http://localhost:11633",
});

const http = new Http();
const url = "http://localhost:8081/pokemon/import";

// Function executed for every test iteration.
export default function () {
  const pokemonId = randomIntBetween(1, 100);
  const payload = JSON.stringify({
    id: pokemonId,
  });
  const params = {
    tracetest: {
      testId,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = http.post(url, payload, params);

  check(response, {
    "is status 200": (r) => r.status === 200,
    "body matches id": (r) => JSON.parse(r.body).id === pokemonId,
  });
  sleep(1);

}

// enable this to return a non-zero status code if a tracetest test fails
export function teardown() {
  tracetest.validateResult();
}

export function handleSummary(data) {
  // combine the default summary with the tracetest summary
  const tracetestSummary = tracetest.summary();
  const defaultSummary = textSummary(data);
  const summary = `
    ${defaultSummary}
    ${tracetestSummary}
  `;

  return {
    stdout: summary,
    "tracetest.json": tracetest.json(),
  };
}