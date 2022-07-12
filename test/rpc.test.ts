import {getChainRpcUrl} from "../src/utils/rpc";
import {CHAIN_NAME,CHAIN_NAME_ID} from "../src/constants/chain";

const seller = '0x9F7A946d935c8Efc7A8329C0d894A69bA241345A';
(async () => {
    const chainId = 97

    console.log(CHAIN_NAME_ID)

    const url = "https://segmentfault.com/q/1010000013437141"
    const ff = await fetch(url, {method: 'HEAD'})
    const res = await getChainRpcUrl(chainId, true)
    console.log(res)

})()
