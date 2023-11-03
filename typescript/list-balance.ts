import { Tradr } from 'npm:@tradrapi/trading-sdk';

const tradrApi = Tradr.make({
    exchange: {
        serviceUrl: 'https://dev.tradrapi.com',
        socketUrl: 'wss://dev.tradrapi.com',
    },
    auth: { apiKey: '<API-KEY>' },
    debug: true,
});

tradrApi.balances.get(100039504).then(console.log);
