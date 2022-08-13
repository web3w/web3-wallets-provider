import {
    RequestArguments
} from './types'

import {ethers} from "ethers";
import pkg from "../package.json";
import {WalletInfo, Web3Wallets} from "web3-wallets";
import {createServer} from "./utils/provider";
import {SignerProvider} from "web3-signer-provider";

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

export class Web3WalletsProvider {
    address = ""
    rpcUrl = ""
    chainId: number
    port: number
    server: any
    provider: any
    version = ""

    constructor(wallet: WalletInfo) {
        this.version = pkg.version
        const {chainId, address, port} = wallet
        this.address = address
        this.chainId = chainId
        this.provider = new SignerProvider(wallet)
        this.port = port || 8545
        const ip = "127.0.0.1";
        this.rpcUrl = `http://${ip}:${port || 8545}/`
        this.server = createServer(this.provider)
        try {
            this.server.listen(this.port, ip)
        } catch (err) {
            this.server.log.error(err)
            process.exit(1)
        }
    }

    async request(args: RequestArguments) {
        return ethers.utils.fetchJson(this.rpcUrl, JSON.stringify(args))
    };
}

