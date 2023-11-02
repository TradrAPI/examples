import { Tradr } from 'npm:@tradrapi/trading-sdk';

/** Development key */
const API_KEY = 'bHxKy1w3B+kvbbN4KymBp9ZE6X4z8hFP3LwNVUI9tpM=';

const tradrApi = Tradr.make({
  exchange: {
    serviceUrl: 'https://dev.tradrapi.com',
    socketUrl: 'wss://dev.tradrapi.com',
  },
  auth: { apiKey: API_KEY },
  debug: true,
});

/* Output the accounts */
tradrApi.accounts.get(100039504).then(console.log);
