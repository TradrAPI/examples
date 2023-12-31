import { Tradr } from 'npm:@tradrapi/trading-sdk';

const tradrApi = Tradr.make({
  exchange: {
    serviceUrl: 'https://dev.tradrapi.com',
    socketUrl: 'wss://dev-wss.tradrapi.com',
  },
  auth: { apiKey: '<API-KEY>' },
  debug: true,
});

tradrApi.accounts.get(100039504).then(console.log);
