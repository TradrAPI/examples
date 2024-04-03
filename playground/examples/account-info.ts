// retrieve trading account information

import { Tradr, Config } from "@tradrapi/trading-sdk";

// configure the SDK
const sdkConfig: Config = {
  // <EXCHANGE-CONFIG>
  auth: { apiKey: "<API-KEY>" },
  debug: true,
};

// create an instance of the SDK
const tradrApi = Tradr.make(sdkConfig);

// the id of the account to retrieve
// ⬇️⬇️⬇️ replace with your account id ⬇️⬇️⬇️
const ACCOUNT_ID = 0;

// retrieve the account
tradrApi.accounts.get(ACCOUNT_ID).then((data) => console.log(data));
