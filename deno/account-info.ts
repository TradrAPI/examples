// retrieve trading account information

import { Tradr, Config } from "@tradrapi/trading-sdk";

const apiKey = prompt("Enter your API key:");

// the id of the account to retrieve
const accountId = prompt("Enter the account ID to retrieve:");

// configure the SDK
const sdkConfig: Config = {
  auth: { apiKey },
  debug: true,
};

// create an instance of the SDK
const tradrApi = Tradr.make(sdkConfig);

// retrieve the account
tradrApi.accounts.get(accountId).then((data) => console.log(data));
