import { Tradr, Config, ListAccountDto } from "npm:@tradrapi/trading-sdk";

const apiKey = prompt("Enter your API key:");

// Configure the SDK
const sdkConfig: Config = { auth: { apiKey } };

// Create an instance of the SDK
const tradrApi = Tradr.make(sdkConfig);

// Filter and sort the accounts based on your needs
const filters: ListAccountDto = {
  sortBy: "createdAt", // Sort the accounts by creation date
  limit: 10, // Number of accounts to retrieve per request
};

// Retrieve the accounts
tradrApi.accounts.list(filters).then((data) => console.log(data));
