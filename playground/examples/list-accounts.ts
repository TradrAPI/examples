// retrieve list of trading accounts for specified API key

import { Tradr, Config, ListAccountDto } from "@tradrapi/trading-sdk";

// configure the SDK
const sdkConfig: Config = {
  // <EXCHANGE-CONFIG>
  auth: { apiKey: "<API-KEY>" },
  debug: true,
};

// create an instance of the SDK
const tradrApi = Tradr.make(sdkConfig);

// filter and sort the accounts based on your needs
const filters: ListAccountDto = {
  // sort the accounts by creation date
  sortBy: "createdAt",
  // number of accounts to retrieve per request
  limit: 10,
};

// retrieve the accounts
tradrApi.accounts.list(filters).then((data) => console.log(data));
