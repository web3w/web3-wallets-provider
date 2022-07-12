import {
    JsonRpcRequest,
    ProviderAccounts, RequestArguments
} from '../types'
import {WalletsBase} from "./walletsBase";

import {ethers} from "ethers";
import {getChainInfo, getChainRpcUrl} from "../utils/rpc";
import {CHAIN_CONFIG, RPC_API_TIMEOUT} from "../constants/index";
import Fastify, {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

import pkg from "../../package.json";
// import {privateKeysToAddress} from "web3-wallets";

export function privateKeyToAddress(privateKey: string) {
    return new ethers.Wallet(privateKey).address
}

export interface RequestPayload {
    params: any[];
    method: string;
    id: number;
    jsonrpc: string;
}
export interface ResponseError {
    message: string;
    code: number;
}
export interface ResponsePayload {
    result: any;
    id: number;
    jsonrpc: string;
    error?: ResponseError;
}


let block: any
let netVersion: any
let netListening: any
let accounts: { [address: string]: { address: string, balance: string, cacheTimestamp: number, cacheExpiration: number } } = {}

export async function postRouter(req: FastifyRequest, res: FastifyReply, walletInfo: WalletInfo) {

    if (!req.body || typeof req.body !== 'object') {
        res.status(400).send({
            message: 'Error: missing or invalid request body'
        })
    }
    // @ts-ignore
    const {id, params, method} = <JsonRpcRequest>req.body

    console.log(req.body)

    const {chainId, address, privateKeys} = walletInfo
    const cacheExpiration = walletInfo.cacheExpiration || 60000
    const rpc = walletInfo.rpcUrl?.url || getChainInfo(chainId).rpcs[0]
    const url = {url: rpc, timeout: walletInfo.rpcUrl?.timeout || RPC_API_TIMEOUT}

    if (!privateKeys || privateKeys.length == 0) throw new Error("Private keys undefind")
    for (const val of privateKeys) {
        const address = privateKeyToAddress(val).toLowerCase();
        const account = {
            address,
            privateKey: val,
            balance: "0",
            cacheExpiration,
            cacheTimestamp: 0
        }
        if (!accounts[address]) {
            accounts[address] = account
        }
    }

    if (!method || typeof method !== 'string') {
        res.status(400).send({
            message: 'Error: missing or invalid topic field'
        })
    }
    if (!params || typeof params !== "object") {
        res.status(400).send({
            message: 'Error: missing or invalid webhook field'
        })
    }

    if (method === "eth_sendTransaction") {
        console.log(req.url + ", rpc:" + JSON.stringify(req.body))
        let txCode: any = params[0]
        if (!walletInfo.privateKeys || walletInfo.privateKeys.length == 0) throw new Error("Private keys undefind")
        const wallet = new ethers.Wallet(walletInfo.privateKeys[0])
        const receipt = await wallet.signTransaction(txCode)
        const data = {jsonrpc: '2.0', id, result: receipt}
        return res.status(200).send(data)
    } else if (method === "eth_sendRawTransaction") {
        console.log("eth_sendRawTransaction", params)
        // params[0].from = walletInfo.address
    } else if (method == "eth_accounts") {
        const data = {
            "jsonrpc": "2.0",
            id,
            "result": Object.keys(accounts)
        }
        console.log("eth_accounts",data)
        return res.status(200).send(data)
    } else if (method === "eth_getBalance") {
        const account = accounts[params[0].toLowerCase()]

        const data = {
            "jsonrpc": "2.0",
            id,
            "result": account?.balance || "0"
        }

        if (account && new Date().getTime() < account.cacheTimestamp) {
            // console.log("eth_getBalance -----------cache")
            return res.status(200).send(data)
        }

    } else if (method === "net_version" && netVersion) {
        // res.status(200).send({jsonrpc: '2.0', id, result: '4'})
        netVersion.id = id
        return res.status(200).send(netVersion)
    } else if (method === "net_listening" && netListening) {
        return res.status(200).send(netListening)
    } else if (method === "eth_getBlockByNumber" && block) {
        block.id = id
        if (block && new Date().getTime() < Number(block.result.timestamp) + cacheExpiration) {
            return res.status(200).send(block)
        }
    }

    console.log("FetchJson start", method)
    const data = await ethers.utils.fetchJson(url, JSON.stringify(req.body))

    if (method === "net_version") {
        netVersion = data
    } else if (method === "net_listening") {
        netListening = data
    } else if (method === "eth_getBalance") {
        console.log("eth_getBalance-------rpc")
        const account = accounts[params[0].toLowerCase()]
        console.log(new Date(account.cacheTimestamp))
        if (account) {
            account.balance = data.result
            account.cacheTimestamp = new Date().getTime() + account.cacheExpiration
        }
        // console.log(account)
    } else if (
        method === "eth_blockNumber"
        || method === "eth_chainId"
        || method === "eth_accounts"
        || method === "eth_gasPrice"
        || method === "eth_getTransactionCount") {
        console.log(method, data.id, parseInt(data.result), data.result)
    } else if (method === "eth_getBlockByNumber") {
        // const {number, gasUsed, baseFeePerGas} = data.result
        block = data
        // console.log(method, parseInt(number), parseInt(gasUsed), parseInt(baseFeePerGas))
    } else if (method === "eth_call") {

    } else if (method === "eth_getCode") {
        //
    } else {
        console.log("-----------", id, method, data)
    }
    if (data.error) {
        console.log("-----------error------")
        console.log(req.body)
        console.log(method, data.error)
    }
    return res.status(200).send(data)
}

export function createProvider(walletInfo: WalletInfo) {
    const {chainId, address, privateKeys} = walletInfo
    const accounts = privateKeys && privateKeysToAddress(privateKeys)
    if (accounts) {
        if (!accounts[address.toLowerCase()]) throw 'PriKey error'
    }

    const fastify: FastifyInstance = Fastify({
        logger: false
    })

    fastify.register(
        helmet,
        // Example disables the `contentSecurityPolicy` middleware but keeps the rest.
        {contentSecurityPolicy: false}
    )
    fastify.register(
        cors,
        {
            optionsSuccessStatus: 200
        }
    )

    // app.register(addProduct)
    // app.register(Helmet)
    fastify.get('/health', (req: FastifyRequest, res: FastifyReply) => {
        res.status(204).send()
    })

    fastify.get('/info', (req: FastifyRequest, res: FastifyReply) => {
        res.status(200).send({
            name: pkg.name,
            description: pkg.description,
            version: pkg.version
        })
    })

    fastify.all('/', async (req: FastifyRequest, res: FastifyReply) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "*");
        if (req.method == "POST") {
            await postRouter(req, res, walletInfo)
        }
    })
    fastify.ready(() => {
        // 将 ws 服务绑定到 app 中
        console.log("ready")
    })
    return fastify
}


const getIPAdress = () => {
    let interfaces = require('os').networkInterfaces()
    for (let devName in interfaces) {
        let iface = interfaces[devName]
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i]
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address
            }
        }
    }
}




export class WalletsPovider extends WalletsBase {
    address = ""
    walletName = ""
    chainId: number
    port: number
    provider: any

    constructor(wallet: WalletInfo) {
        super()
        const {privateKeys, chainId, address, port} = wallet
        this.address = address
        this.chainId = chainId
        this.port = port || 8545
        // if (privateKeys) {
        //     const isIncludes = privateKeys.some(val => privateKeyToAddress(val).toLowerCase() == address.toLowerCase())
        //     if (!isIncludes) throw new Error("PriKey must have")
        // }
        this.provider = createProvider(wallet)
    }

    async request(args: RequestArguments) {
        // debugger
        const ip = "127.0.0.1";
        const url = `http://${ip}:${this.port}/`
        return ethers.utils.fetchJson(url, JSON.stringify(args))
    };

    //ProviderAccounts
    async enable(): Promise<ProviderAccounts> {
        try {
            const ip = "127.0.0.1";
            console.log(`${ip}:${this.port}`)
            await this.provider.listen(this.port, ip)
        } catch (err) {
            this.provider.log.error(err)
            process.exit(1)
        }
        return Promise.resolve([this.address])
    }
}

