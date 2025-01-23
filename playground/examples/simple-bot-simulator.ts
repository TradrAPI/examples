// Simple bot that listens to market prices and calculates linear regression
// on the fly. If the regression is within a certain threshold, it will place
// a prediction for the future price.

/** ⬇️ SET YOUR ACCOUNT ID HERE ⬇️ **/
const ACCOUNT_ID = 0;

const MIN_PREDICTION_FREQ = 40; // Minimum ticks for prediction
const PREDICT_FORWARD_SEC = 2; // Predict n seconds in the future
const PREDICTION_LIFETIME_SEC = 7; // Allow n seconds grace

const MIN_REGRESSION_VARIANCE = 0.01; // Do not predict if the variance is too low
const MIN_PREDICTED_PROFIT_PERCENTAGE = 1; // Do not predict if the profit potential is too low

const SYMBOLS = ['BTCUSD', 'ETHUSD'];
const DISPLAY_OUTCOMES = 10;
////////////////////////////////////////////////////////////////////////////////

import { randomUUID } from 'crypto';
import * as process from 'node:process';
import regression, { DataPoint } from 'regression';

import { Tradr, Config, ServerType, AccountResult, DecoratedTickItem } from '@tradrapi/trading-sdk';

// Configure the SDK
const sdkConfig: Config = {
  // <EXCHANGE-CONFIG>
  auth: { apiKey: "<API-KEY>" },
  debug: true,
};

const tradrApi = Tradr.make(sdkConfig);

interface Prediction {
  id: string;
  symbol: string;
  price: number;
  prediction: number;
  direction: number;
  movement: number;
  variance: number;
  at: number;
}

interface Outcome {
  prediction: Prediction;
  price: number;
  movement: number;
  wasCorrect: boolean;
}

interface MarketStatus {
  price: number;
  gradient: number;
  movement: number;
}

// Store the account
let account: AccountResult;

// Create counters
let mainCounter: number = 0;
const subCounters: Map<string, number> = new Map();

// Create datasets for linear regression
const tickRates: Map<string, [number, number]> = new Map();
const marketStatuses: Map<string, MarketStatus> = new Map();
const marketDataPoints: Map<string, DataPoint[]> = new Map();

// Create datasets for predictions
const outcomes: Map<string, Outcome> = new Map();
const predictions: Map<string, Prediction[]> = new Map();

/** Main function */
async function main() {
  console.clear();

  if (!ACCOUNT_ID || typeof ACCOUNT_ID !== 'number') {
    console.info(`❌ Please set a valid account id for the bot to use`);
    process.exit(1);
  }

  try {
    // Create a new demo account
    console.info('ℹ️ Checking demo trading account');
    account = await tradrApi.accounts.get(ACCOUNT_ID);
    if (ServerType.Demo !== account.serverType) {
      console.info(`❌ Account ${ACCOUNT_ID} is not a demo account`);
      process.exit(1);
    }

    console.info(`✅ Demo trading ${account.id} is valid.`);

    // Confirming the account balance
    const balance = await tradrApi.balances.get(account.id);
    if (balance.balance === 0) {
      console.info(`❌ Trading account ${account.id} has insufficient balance`);
      process.exit(1);
    }

    console.info(`✅ Trading account ${account.id} has a balance of ${balance.balance}`);
  } catch (e) {
    console.error('❌ Something went wrong', e);
    process.exit(1);
  }

  // Listen for market prices
  console.info('ℹ️ Listening to live prices');
  tradrApi.socket.subscribeTicks(SYMBOLS, account?.spreadGroup?.name || '', onTick);

  // Increment counter
  setInterval(() => mainCounter++, 100);

  // Print the CLI
  setInterval(printCli, 300);
}

/** Define a callback for market prices */
function onTick(data: DecoratedTickItem) {
  const { symbol, ask } = data.tick;

  // Update the symbol counter
  const c = subCounters.get(symbol) || 0;
  subCounters.set(symbol, c + 1);

  // Update the tick rate
  let r = tickRates.get(symbol) || [0, 0];
  r = [(r[1] + 1) / (mainCounter / 10), r[1] + 1];
  tickRates.set(symbol, r);

  // Update the dataset
  const set = marketDataPoints.get(symbol) || [];
  if (!set.length) marketDataPoints.set(symbol, set);
  set.push([c, data.tick.ask]);

  // Calculate the linear regression
  const reg = regression.linear(set, { precision: 3 });
  const gradient = reg.equation[0];

  // Predict the future price
  const result = reg.predict(c + Math.floor(PREDICT_FORWARD_SEC * r[0]));
  const movement = ((result[1] - ask) / result[1]) * 100;

  // Keep a record of the market status
  marketStatuses.set(symbol, { price: ask, gradient, movement });

  if (c >= MIN_PREDICTION_FREQ) {
    // Check if the result is within the threshold
    const threshold = Math.abs(MIN_REGRESSION_VARIANCE);

    // If the variance is within the threshold and the
    // predicted profit potential is high enough, make a prediction
    if (
        Math.abs(gradient) >= threshold &&
        Math.abs(movement) * account.leverage >= MIN_PREDICTED_PROFIT_PERCENTAGE
    ) {
      // Create a prediction object
      const prediction: Prediction = {
        id: randomUUID(),
        symbol,
        price: ask,
        prediction: result[1],
        movement,
        direction: result[1] > ask ? 1 : -1,
        variance: reg.equation[0],
        at: mainCounter + PREDICT_FORWARD_SEC * 10,
      };

      // Store the prediction
      const set = predictions.get(symbol) || [];
      if (!set.length) predictions.set(symbol, set);
      set.push(prediction);

      // Reset the counter & dataset
      subCounters.set(symbol, 0);
      marketDataPoints.set(symbol, []);
    }
  }

  // If no prediction was made for a while
  // reset the counter & dataset
  if (c > MIN_PREDICTION_FREQ * 2) {
    subCounters.set(symbol, 0);
    marketDataPoints.set(symbol, []);
  }

  // Evaluate predictions
  evaluatePredictions();
}

/** Evaluate the predictions */
function evaluatePredictions() {
  // Go through each symbol's prediction set
  predictions.forEach((data: Prediction[], s: string) => {
    const remaining: Prediction[] = [];
    const ask = marketStatuses.get(s)?.price;

    // We should go through each prediction
    data.forEach((p: Prediction) => {
      // Ignore predictions which have already been evaluated
      if (outcomes.has(p.id)) return;

      // Ignore predictions which are too new
      if (mainCounter < p.at || !ask) {
        remaining.push(p);
        return;
      }

      const { price, direction, movement } = p;

      // Calculate the actual price movement percentage
      const actualMovement = ((ask - price) / ask) * 100;

      // Fail predictions which are too old
      if (mainCounter > p.at + PREDICTION_LIFETIME_SEC * 10) {
        outcomes.set(p.id, {
          prediction: p,
          price: ask,
          movement: actualMovement,
          wasCorrect: false,
        });
        return;
      }

      // Check how close the prediction was
      const correctness = (Math.abs(actualMovement) / Math.abs(movement)) * 100;

      // Check if the prediction direction was correct
      const isDirectionCorrect = (direction > 0 && ask >= price) || (direction < 0 && ask <= price);

      // If the prediction was correct and
      // the movement was within the threshold
      if (isDirectionCorrect && correctness >= 50) {
        outcomes.set(p.id, {
          prediction: p,
          price: ask,
          movement: actualMovement,
          wasCorrect: true,
        });
        return;
      }

      remaining.push(p);
    });

    predictions.set(s, remaining);
  });
}

/** Draw the current state of the bot */
function printCli() {
  console.clear();
  console.log();

  // Draw the market status for each symbol
  marketStatuses.forEach((m: MarketStatus, s: string) => {
    const { price, gradient, movement } = m;

    let icon = '⚪';
    if (gradient > MIN_REGRESSION_VARIANCE) icon = '🟢';
    if (gradient < -MIN_REGRESSION_VARIANCE) icon = '🔴';

    const rate = tickRates.get(s) || [0, 0];

    console.log(
        `${icon}  ${s}@${price} ${movement.toFixed(2)}% (var ${gradient}) ${rate[0].toFixed(1)}t/s`,
    );
  });

  console.log('\n-------------------------------------------------');
  console.log(`| Predictions`);
  console.log('-------------------------------------------------\n');

  // Draw the predictions
  predictions.forEach((data: Prediction[], s: string) => {
    data.forEach((p: Prediction) => {
      const { price, prediction, movement, at } = p;

      const info = p.direction > 0 ? ['📈', 'up'] : ['📉', 'down'];
      const time = (at + PREDICTION_LIFETIME_SEC * 10 - mainCounter) / 10;

      console.log(
          `${info[0]}  ${s} will go ${info[1]} from ${price} to ${prediction} by ${movement.toFixed(
              2,
          )}% in ${Math.max(0, time).toFixed(0)} seconds`,
      );
    });
  });

  // Calculate the total profit
  const totalProfitPercent = Array.from(outcomes.values())
      .reduce(
          (acc: number, o: Outcome) =>
              acc + (o.wasCorrect ? Math.abs(o.movement) : -Math.abs(o.movement)),
          0,
      )
      .toFixed(2);

  // Calculate the total correct predictions
  const totalCorrect =
      Array.from(outcomes.values()).filter((o: Outcome) => o.wasCorrect).length || 0;

  // Calculate the accuracy
  const accuracy = ((totalCorrect / outcomes.size) * 100 || 0).toFixed(0);

  console.log('\n-------------------------------------------------');
  console.log(`| Profit ${totalProfitPercent}% | Accuracy ${accuracy}% of #${outcomes.size}`);
  console.log('-------------------------------------------------\n');

  // Draw the latest results
  Array.from(outcomes.values())
      .slice(Math.max(outcomes.size - DISPLAY_OUTCOMES, 0))
      .forEach((o: Outcome) => {
        const { prediction, price, movement, wasCorrect } = o;
        const info = prediction.direction > 0 ? ['📈', 'up'] : ['📉', 'down'];

        console.log(
            `${wasCorrect ? '✅' : '❌'} ${info[0]} ${prediction.symbol} ${
                info[1]
            } ${prediction.movement.toFixed(3)}% [${prediction.price} -> ${
                prediction.prediction
            }] - Outcome ${movement.toFixed(3)}% [${price}] (var ${prediction.variance})`,
        );
      });
}

// Run the main function
main();
