// Retrieve trading account balance, equity, and margin information

import { Tradr, Config } from "@tradrapi/trading-sdk";

/** ⬇️ SET YOUR ACCOUNT ID HERE ⬇️ **/
const ACCOUNT_ID = 0;

// Configure the SDK
const sdkConfig: Config = {
  // <EXCHANGE-CONFIG>
  auth: { apiKey: "<API-KEY>" },
  debug: true,
};

// Create an instance of the SDK
const tradrApi = Tradr.make(sdkConfig);

// Retrieve the account
tradrApi.balances.get(ACCOUNT_ID).then((data) => console.log(data));
