#!/usr/bin/env node

import commander, {program} from 'commander';
import * as fs from "fs";
import {networkPrompt} from "./propmt";
import {Web3WalletsPovider} from "./index";
import {CHAIN_NAME, CHAIN_NAME_ID} from "./constants/chain";
import {privateKeyToAddress} from "./connectors/walletsPovider";

const path = require('path');
const dirPath = process.cwd()

program
    .version(`${require('../package.json').version}`, '-v --version')
    .option('-c, --config <path>', 'set config path', '../config.json')
    .usage('<command> [options]');

program
    .command('start',{isDefault: true})
    .description('Orders operation => web3-provider   ')
    .option('-n,--network <network>', 'network name', "main")
    .action(async (options: any) => {
        console.log(options)
        const confPath = `${dirPath}/` + program.opts().config
        // if (fs.existsSync(confPath)) {
        //     const config = require(confPath)
        //     const privateKey = config.accounts[config.defaultAccount]
        //
        //     networkPrompt(network, config.defaultAccount).then(async (answers) => {
        //         const port = 8545
        //         const proxy = new Web3WalletsPovider({
        //             port,
        //             chainId: CHAIN_NAME_ID[network],
        //             address: privateKeyToAddress(privateKey),
        //             privateKeys: [privateKey]
        //         })
        //
        //         await proxy.enable()
        //     })
        // }
    });

program.parse(process.argv);

