// Retrieve list of trading accounts for specified API key

import { Tradr, Config, ListAccountDto } from "@tradrapi/trading-sdk";

// Configure the SDK
const sdkConfig: Config = {
  // <EXCHANGE-CONFIG>
  auth: { apiKey: "<API-KEY>" },
  debug: true,
};

// Create an instance of the SDK
const tradrApi = Tradr.make(sdkConfig);

// Filter and sort the accounts based on your needs
const filters: ListAccountDto = {
  sortBy: "createdAt",  // Sort the accounts by creation date
  limit: 10, // Number of accounts to retrieve per request
  // ℹ️ ⬇ ️Apply more filters, press ctrl+space to see all available filters
};

// Retrieve the accounts
tradrApi.accounts.list(filters).then((data) => console.log(data));
