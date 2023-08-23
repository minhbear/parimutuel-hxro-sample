import * as web3 from "@solana/web3.js";
import * as sdk from "@hxronetwork/parimutuelsdk";
import * as bs58 from "bs58";

// Paste your private key in here
const PRIVATE_KEY = [1, 1, 1]
const priKey = new Uint8Array(PRIVATE_KEY);
const keypair = web3.Keypair.fromSecretKey(priKey)
const config = sdk.DEVNET_CONFIG;
const rpc =
  "https://devnet.helius-rpc.com/?api-key=8a86e8e9-2860-45b1-b516-ba99a5579815";
/**
 * Or can use the default cluster
 * const rpc = web3.clusterApiUrl('devnet')
 */
const connection = new web3.Connection(rpc, "confirmed");

const parimutuelWeb3 = new sdk.ParimutuelWeb3(config, connection);

const market = sdk.MarketPairEnum.BTCUSD;
const marketPubkeys = sdk.getMarketPubkeys(config, market);

const duration = 60;
const selectedMarket = marketPubkeys.filter(
  (market) => market.duration === duration
);

const usdcDec = 100_000_000;

const getParisDate = async () => {
  const parimtuels = await parimutuelWeb3.getParimutuels(selectedMarket, 5);

  for (const pari of parimtuels) {
    const timeToStart = pari.info.parimutuel.timeWindowStart.toNumber();
    const shortPool =
      pari.info.parimutuel.activeShortPositions.toNumber() / usdcDec;
    const longPool =
      pari.info.parimutuel.activeLongPositions.toNumber() / usdcDec;
    const expired = pari.info.parimutuel.expired;

    console.log("timeToStart", timeToStart);
    console.log("shortPool", shortPool);
    console.log("longPool", longPool);
    console.log("expired", expired);
  }
};

const placePosition = async () => {
  const parimutuels = await parimutuelWeb3.getParimutuels(selectedMarket);

  const pariContest = parimutuels.filter(
    (pari) => 
      pari.info.parimutuel.timeWindowStart.toNumber() > Date.now() &&
      pari.info.parimutuel.timeWindowStart.toNumber() < 
        Date.now() + duration * 1000
  );

  const contestPubkey = pariContest[0].pubkey

  const txhash = await parimutuelWeb3.placePosition(
    keypair as web3.Keypair,
    contestPubkey,
    30000 * usdcDec,
    sdk.PositionSideEnum.LONG,
    Date.now()
  )

  console.log(`\nhttps://solscan.io/tx/${txhash}`)
}

// Get Data
getParisDate();

// Betting
placePosition()
