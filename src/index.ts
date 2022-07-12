import EventEmitter from 'events'
import {
    IEthereumProvider,
    ProviderAccounts,
    RequestArguments, WalletInfo,
} from "./types";
import {ethers} from "ethers";
import {JsonRpcSigner} from "@ethersproject/providers";
import {WalletsBase} from "./connectors/walletsBase";
import {WalletsPovider} from "./connectors/walletsPovider";

declare global {
    interface Window {
        walletProvider: WalletsBase | undefined // wallet provider
        walletSigner: JsonRpcSigner | undefined // ethers  wallet provider
        ethereum: JsonRpcSigner | any // ethers web3  provider
    }
}
// https://eips.ethereum.org/EIPS/eip-1193#disconnect
//A JavaScript Ethereum Provider API for consistency across clients and applications.
export class Web3WalletsPovider extends EventEmitter implements IEthereumProvider {
    public walletProvider: WalletsBase | undefined
    public walletSigner: JsonRpcSigner | undefined

    constructor(wallet?: Partial<WalletInfo>) {
        super()
        const {address, chainId} = wallet || {}
        if (typeof window === 'undefined') {
            throw 'not support node evn'
        } else {
            const walletInfo = {address: address || "", chainId: chainId || 1}
            this.walletProvider = new WalletsPovider(walletInfo)
            if (this.walletProvider) {
                this.walletSigner = new ethers.providers.Web3Provider(this.walletProvider).getSigner()
                if (typeof window !== 'undefined') {
                    window.walletProvider = this.walletProvider
                    window.walletSigner = this.walletSigner
                }
            }
        }
    }

    async request(args: RequestArguments): Promise<unknown> {
        if (!this.walletProvider) {
            throw new Error('Web3-wallet request error')
        }
        return this.walletProvider?.request(args)
    };

    async enable(): Promise<ProviderAccounts> {
        if (!this.walletProvider) {
            throw new Error('Web3-wallet enable error')
        }
        return this.walletProvider.enable()
    };

    // async send(method: string, params: Array<any>): Promise<any> {
    //     return this.request({
    //         method,
    //         params
    //     })
    // }

    // async send(...args: unknown[]) {
    //     this.errorHandle()
    // };


    // sendAsync(request: Object, callback: Function): void {
    //     this.errorHandle()
    // };
    //

}

// const  Web3Provider = {
//     async send(payload: JSONRPCRequestPayload, callback: JSONRPCErrorCallback) {
//         if (payload.method === 'eth_sign') {
//             const [address, message] = payload.params
//             console.log(address, message)
//             const msgBuff = ethUtil.toBuffer(message)
//             const prefixedMsgBuff = ethUtil.hashPersonalMessage(msgBuff)
//             const signAddr = ethUtil.bufferToHex(ethUtil.privateToAddress(ethUtil.toBuffer(priKeyA)))
//             console.log(signAddr, address)
//
//             const signature = ethUtil.ecsign(prefixedMsgBuff, ethUtil.toBuffer(priKeyA))
//
//             const pubKey = ethUtil.ecrecover(
//                 prefixedMsgBuff,
//                 signature.v,
//                 signature.r,
//                 signature.s
//             )
//             const retrievedAddress = ethUtil.bufferToHex(ethUtil.pubToAddress(pubKey))
//
//             if (signAddr !== retrievedAddress) return
//
//             const signRsv: ECSignature = {
//                 v: signature.v,
//                 s: ethUtil.bufferToHex(signature.s),
//                 r: ethUtil.bufferToHex(signature.r)
//             }
//             // const isValid = isValidECSignature(hashMsg1, signRsv, address)
//
//             // 合约支持的签名类型
//             // const signType = signatureUtils.convertECSignatureToSignatureHex(signRsv)
//             // console.log(isValid, signType)
//
//             const signatureStr = joinSignature(signRsv)
//             callback(null, {
//                 id: 42,
//                 jsonrpc: '2.0',
//                 result: signatureStr
//             })
//         } else {
//             callback(null, { id: 42, jsonrpc: '2.0', result: [accountA] })
//         }
//     }
// }



