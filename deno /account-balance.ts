import { Tradr, Config } from "npm:@tradrapi/trading-sdk";

const apiKey = prompt("Enter your API key:");

// The id of the account to retrieve
const accountId = prompt("Enter the account ID to retrieve:");

// Configure the SDK
const sdkConfig: Config = { auth: { apiKey } };

// Create an instance of the SDK
const tradrApi = Tradr.make(sdkConfig);

// Retrieve the account
tradrApi.balances.get(accountId).then((data) => console.log(data));
