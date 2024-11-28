import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

//export const getContactsDuration = new Trend('get_contacts', true);
export const getDurationRandom = new Trend('get_random', true);

export const statusRandomRate = new Rate('status_200');
//export const RateContentOK = new Rate('content_OK');

export const options = {
  thresholds: {
    get_random: ['p(95)<5700'],
    http_req_failed: ['rate<0.12'],
    status_200: ['rate>0.95']
  },
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 70 },
    { duration: '1m', target: 150 },
    { duration: '1m', target: 220 },
    { duration: '1m', target: 300 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://emojihub.yurace.pro/api/random';

  const params = {
    timeout: '60s',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`, params);

  getDurationRandom.add(res.timings.duration);
  statusRandomRate.add(res.status === OK);

  check(res, {
    'GET Random - Status 200': () => res.status === OK
  });
}
