export const networkConfig = {
  localhost: {}, // the one that sets up 20 accounts
  hardhat: {},
  rinkeby: {
    chainId: 4,
    ethPriceFeedAddress: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    blockConfirmations: 6
  },
  kovan: {
    chainId: 69,
    ethPriceFeedAddress: "0x9326BFA02ADD2366b30bacB125260Af641031331",
    blockConfirmations: 6
  },
  polygon: {
    chainId: 137,
    ethPriceFeedAddress: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    blockConfirmations: 6
  }
};
export const DECIMALS = "18";
export const INITIAL_PRICE = "2000000000000000000000"; // 2000
