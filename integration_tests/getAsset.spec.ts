import { SDK, H256, AssetMintTransaction, Asset } from "../";
import { mintAsset } from "./helper";

const SERVER_URL = process.env.CODECHAIN_RPC_HTTP || "http://localhost:8080";
const sdk = new SDK(SERVER_URL);

test("getAsset", async () => {
    const { assetMintTransaction } = await mintAsset({
        metadata: "",
        lockScriptHash: new H256("0000000000000000000000000000000000000000000000000000000000000000"),
        parameters: [],
        amount: 111,
        registrar: null
    });
    const asset = await sdk.getAsset(assetMintTransaction.hash(), 0);
    expect(asset).toEqual(new Asset({
        assetType: assetMintTransaction.getAssetSchemeAddress(),
        lockScriptHash: new H256("0000000000000000000000000000000000000000000000000000000000000000"),
        parameters: [],
        amount: 111,
    }));
});
