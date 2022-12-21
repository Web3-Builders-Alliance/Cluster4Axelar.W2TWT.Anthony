import {
  AxelarAssetTransfer,
  AxelarQueryAPI,
  Environment,
  CHAINS,
  AxelarGMPRecoveryAPI,
  GMPStatusResponse,
} from "@axelar-network/axelarjs-sdk";
import { Secp256k1HdWallet } from "@cosmjs/amino/build/secp256k1hdwallet";

import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet, OfflineSigner } from "@cosmjs/proto-signing";

require("dotenv").config();

const osmoRpc = "https://rpc-test.osmosis.zone";

const axelarAssetTransfer = new AxelarAssetTransfer({
  environment: Environment.TESTNET,
  auth: "metamask",
});
const axelarQuery = new AxelarQueryAPI({
  environment: Environment.TESTNET,
});

const recoveryApi = new AxelarGMPRecoveryAPI({
  environment: Environment.TESTNET,
});

export async function getWalletAddr(prefix: string): Promise<OfflineSigner> {
  const mnemonic =
    "notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius";
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
    mnemonic as string,
    {
      prefix,
    }
  );

  return wallet;
}

export async function getClient(wallet: OfflineSigner) {
  const client = await SigningCosmWasmClient.connectWithSigner(osmoRpc, wallet);

  return client;
}

// Generate Wallet
// const otherMethod = await Secp256k1HdWallet.generate(12);
//     console.log(otherMethod);

(async () => {
  try {
    const wallet = await getWalletAddr("osmo");

    const [firstAccount] = await wallet.getAccounts();
    console.log("firstAccount", firstAccount.address);

    // Generate a deposit address on src chain -> all tokens send to this address will be redirected to provided destination addresS
    let res = await axelarAssetTransfer.getDepositAddress(
      CHAINS.TESTNET.POLYGON,
      CHAINS.TESTNET.OSMOSIS,
      firstAccount.address,
      "uausdc"
    );

    console.log(`destination addr is ${res}`);

    // estimate fee when sending 1 uausdc
    const fee = await axelarQuery.getTransferFee(
      CHAINS.TESTNET.OSMOSIS,
      CHAINS.TESTNET.AVALANCHE,
      "uausdc",
      1000000
    );

    console.log({ fee });

    // What does the api offer cf docs for endpoints https://docs.axelar.network/axelar-core/axelar-core-api.html
    // axelarAssetTransfer.api.execRest("GET", "/deposit/validate", {});
  } catch (e) {
    console.log(e);
  } finally {
    return;
  }
})();
