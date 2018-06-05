import { H160, H512, SignedParcel, H256, Parcel, U256, Invoice, Asset, AssetScheme, Block } from "./primitives/index";

const jayson = require("jayson");

interface RpcRequest {
    name: string;
    toRpcParameter: (...params: any[]) => any[];
    fromRpcResult: (result: any) => any;
}

export class SDK {
    private client: any;

    constructor(httpUrl: string) {
        this.client = jayson.client.http(httpUrl);
    }

    private createRpcRequest = (request: RpcRequest) => {
        return (...params: any[]) => {
            const { name, toRpcParameter, fromRpcResult } = request;
            return new Promise<any>((resolve, reject) => {
                this.client.request(name, toRpcParameter(...params), (err: any, res: any) => {
                    if (err) {
                        return reject(err);
                    } else if (res.error) {
                        return reject(res.error);
                    }
                    resolve(fromRpcResult(res.result));
                });
            });
        };
    }

    /**
     * Sends ping to check whether CodeChain's RPC server is responding or not.
     * @returns       return string "pong"
     */
    ping: () => Promise<string> = this.createRpcRequest({
        name: "ping",
        toRpcParameter: () => [],
        fromRpcResult: result => result
    });

    sendSignedParcel: (t: SignedParcel) => Promise<H256> = this.createRpcRequest({
        name: "chain_sendSignedParcel",
        toRpcParameter: (t: SignedParcel) => {
            const bytes = Array.from(t.rlpBytes()).map(byte => byte < 0x10 ? `0${byte.toString(16)}` : byte.toString(16)).join("");
            return [`0x${bytes}`];
        },
        fromRpcResult: result => new H256(result)
    });

    // FIXME: use createRpcRequest
    getParcel(hash: H256): Promise<SignedParcel | null> {
        return new Promise((resolve, reject) => {
            this.client.request("chain_getParcel", [`0x${hash.value}`], (err: any, res: any) => {
                if (err) {
                    return reject(err);
                } else if (res.error) {
                    return reject(res.error);
                }
                resolve(res.result === null ? null : SignedParcel.fromJSON(res.result));
            });
        });
    }

    // FIXME: will be replaced with getParcelInvoices
    // FIXME: timeout not implemented
    // FIXME: use createRpcRequest
    getParcelInvoices(txhash: H256, _timeout?: number): Promise<Invoice[]> {
        return new Promise((resolve, reject) => {
            this.client.request("chain_getParcelInvoices", [`0x${txhash.value}`], (err: any, res: any) => {
                if (err) {
                    return reject(err);
                } else if (res.error) {
                    return reject(res.error);
                }
                if (!res.result) {
                    return resolve([]);
                }
                resolve(res.result.map((invoice: any) => Invoice.fromJSON(invoice)));
            });
        });
    }

    getRegularKey(address: H160, blockNumber?: number): Promise<H512 | null> {
        return new Promise((resolve, reject) => {
            this.client.request("chain_getRegularKey", [`0x${address.value}`, blockNumber || null], (err: any, res: any) => {
                if (err) {
                    reject(err);
                } else if (res.error) {
                    return reject(res.error);
                }
                if (res.result) {
                    resolve(new H512(res.result));
                } else {
                    resolve(null);
                }
            });
        });
    }

    // FIXME: Implement timeout
    getTransactionInvoice(txhash: H256): Promise<Invoice | null> {
        return new Promise((resolve, reject) => {
            this.client.request("chain_getTransactionInvoice", [`0x${txhash.value}`], (err: any, res: any) => {
                if (err) {
                    return reject(err);
                }

                if (res.error) {
                    return reject(res.error);
                }

                if (!res.result) {
                    return resolve(null);
                }

                resolve(Invoice.fromJSON(res.result));
            });
        });
    }

    getBalance: (address: H160, blockNumber?: number) => Promise<U256 | null> = this.createRpcRequest({
        name: "chain_getBalance",
        toRpcParameter: (address: H160, blockNumber?: number) => [`0x${address.value}`, blockNumber],
        fromRpcResult: result => result ? new U256(result) : null
    });

    getNonce: (address: H160, blockNumber?: number) => Promise<U256 | null> = this.createRpcRequest({
        name: "chain_getNonce",
        toRpcParameter: (address: H160, blockNumber?: number) => [`0x${address.value}`, blockNumber],
        fromRpcResult: result => result ? new U256(result) : null
    });

    getBlockNumber: () => Promise<number> = this.createRpcRequest({
        name: "chain_getBlockNumber",
        toRpcParameter: () => [],
        fromRpcResult: result => result
    });

    getBlockHash: (blockNumber: number) => Promise<H256 | null> = this.createRpcRequest({
        name: "chain_getBlockHash",
        toRpcParameter: (blockNumber: number) => [blockNumber],
        fromRpcResult: result => result ? new H256(result) : null
    });

    // FIXME: use createRpcRequest
    getBlock(hash: H256): Promise<Block | null> {
        return new Promise((resolve, reject) => {
            this.client.request("chain_getBlockByHash", [`0x${hash.value}`], (err: any, res: any) => {
                if (err) {
                    return reject(err);
                } else if (res.error) {
                    return reject(res.error);
                }
                if (!res.result) {
                    resolve(null);
                }
                resolve(Block.fromJSON(res.result));
            });
        });
    }

    // FIXME: receive asset type instead of txhash. Need to change codechain also.
    getAssetScheme: (txhash: H256) => Promise<AssetScheme | null> = this.createRpcRequest({
        name: "chain_getAssetScheme",
        toRpcParameter: (txhash: H256) => [`0x${txhash.value}`],
        fromRpcResult: result => {
            if (!result) {
                return null;
            }
            return AssetScheme.fromJSON(result);
        }
    });

    getAsset: (txhash: H256, index: number) => Promise<AssetScheme | null> = this.createRpcRequest({
        name: "chain_getAsset",
        toRpcParameter: (txhash: H256, index: number) => [`0x${txhash.value}`, index],
        fromRpcResult: result => {
            if (!result) {
                return null;
            }
            return Asset.fromJSON(result);
        }
    });

    getPendingParcels: () => Promise<SignedParcel[] | null> = this.createRpcRequest({
        name: "chain_getPendingParcels",
        toRpcParameter: () => [],
        fromRpcResult: result => {
            return result.map((p: any) => SignedParcel.fromJSON(p));
        }
    });
}

export * from "./primitives/";
export * from "./primitives/transaction";
export * from "./utils";
