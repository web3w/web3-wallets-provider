import inquirer from 'inquirer'

// inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'))

export function networkPrompt(choices: Array<any>, account: string) {
    let prompt = [{
        type: "list",
        name: "networkName",
        message: "钱包地址:" + account,
        choices
    }
    ]
    return inquirer.prompt(prompt)
}

export function secretPrompt(list: any) {
    let prompt = [{
        type: "list",
        name: "secretType",
        message: "钱包根类型(HD Wallet root type)",
        choices: [
            {name: "生成助记词(mnemonic)", value: "randomMnemo", checked: true},
            {name: "生成种子(seed)", value: "randomSeed"},
            {name: "生成Base58", value: "randomBase58"},
            {name: "输入助记词(mnemonic)", value: "mnemo"},
            {name: "输入种子(seed)", value: "seed"},
            {name: "输入Base58", value: "base58"},
        ]
    }
    ]
    return inquirer.prompt(prompt)
}
