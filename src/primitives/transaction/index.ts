import { PaymentTransaction } from "./PaymentTransaction";
import { SetRegularKeyTransaction } from "./SetRegularKeyTransaction";
import { AssetMintTransaction } from "./AssetMintTransaction";
import { AssetTransferTransaction, AssetTransferInput, AssetTransferOutput, AssetOutPoint } from "./AssetTransferTransaction";

export type Transaction =
    PaymentTransaction
    | SetRegularKeyTransaction
    | AssetMintTransaction
    | AssetTransferTransaction;

export { PaymentTransaction, SetRegularKeyTransaction, AssetMintTransaction, AssetTransferTransaction, AssetTransferInput, AssetTransferOutput, AssetOutPoint };

export const getTransactionFromJSON = (obj: string | any) => {
    const keys = Object.keys(obj);
    if (keys.length !== 1) {
        throw new Error(`Unexpected transaction keys: ${keys}`);
    }
    const type = keys[0];
    switch (type) {
    case "payment":
        return PaymentTransaction.fromJSON(obj);
    case "setRegularKey":
        return SetRegularKeyTransaction.fromJSON(obj);
    case "assetMint":
        return AssetMintTransaction.fromJSON(obj);
    case "assetTransfer":
        return AssetTransferTransaction.fromJSON(obj);
    default:
        throw new Error(`Unexpected transaction type: ${type}`);
    }
};
