import {
  Tradr,
  ServerType,
  AccountType,
  AccountResult,
  BalanceOperation,
  DecoratedTickItem,
  SupportedCurrency,
} from 'npm:@tradrapi/trading-sdk';
import { randomUUID } from 'npm:crypto';

// Create a new instance of the SDK
const tradrApi = Tradr.make({
  exchange: {
    serviceUrl: 'https://dev.tradrapi.com',
    socketUrl: 'wss://dev-wss.tradrapi.com',
  },
  auth: { apiKey: '<API-KEY>' },
});

async function main() {
  let account: AccountResult;

  try {
    // Create a new demo account
    console.info('ℹ️ Opening a demo trading account');
    account = await tradrApi.accounts.open(
      {
        type: AccountType.Full,
        server: ServerType.Demo,
        firstName: 'TradrAPI',
        lastName: 'Bot',
        email: `simple-bot-${new Date().getTime()}@tradrapi.com`,
        currency: SupportedCurrency.USD,
        leverage: 100,
      },
      randomUUID(),
    );

    console.info(`✅ Demo trading account opened - ${account.id}`);

    // Fund the account with some demo money
    console.info('ℹ️ Funding the demo trading account');
    await tradrApi.admin.balance.update({
      accountId: account.id,
      amount: 10000,
      operation: BalanceOperation.Add,
    });

    // Confirming the account balance
    const balance = await tradrApi.balances.get(account.id);
    console.info(`✅ Trading account ${account.id} has a balance of ${balance.balance}`);
  } catch (e) {
    console.error('❌ Something went wrong', e);
    return;
  }

  // Define a callback for market prices
  function onTick(data: DecoratedTickItem) {
    console.log(`${data.tick.symbol} @ ${data.tick.ask}`);
  }

  // Listen for market prices
  console.info('ℹ️ Listening to live BTC price');
  tradrApi.socket.subscribeTicks(
    ['BTCUSD'],
    account?.spreadGroup?.name || '',
    onTick,
    'btc-listener',
  );
}

// Run the main function
main();
