import { ethers } from "ethers";

// Ganti dengan alamat kontrakmu sendiri
export const DASHBOARD_CONTRACT_ADDRESS = "0x341029eA2F41f22DADfFf0f3Ef903b54a5805C59";
export const WRC_TOKEN_ADDRESS = "0x020dC518227Dfa84237eB3c2C32cc9c8D70d92BE";

// ABI untuk kontrak Dashboard
export const DASHBOARD_ABI = [
  "function claimWorldReward() external",
  "function stake(uint256 amount) external",
  "function unstakeAll() external",
  "function compound() external",
  "function claimStakingReward() external",
  "function pendingWorldReward(address user) view returns (uint256)",
  "function pendingStakingReward(address user) view returns (uint256)",
  "function stakingUsers(address user) view returns (uint256 staked, uint256 lastUpdate, uint256 rewardDebt)",
  "function worldUsers(address user) view returns (uint256 lastClaim, uint256 claimedTotal)",
];

// ABI minimal untuk token ERC20
export const WRC_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

// Fungsi untuk inisialisasi kontrak Dashboard
export const getDashboardContract = (providerOrSigner: ethers.Provider | ethers.Signer) => {
  return new ethers.Contract(DASHBOARD_CONTRACT_ADDRESS, DASHBOARD_ABI, providerOrSigner);
};

// Fungsi untuk inisialisasi kontrak Token
export const getWRCContract = (providerOrSigner: ethers.Provider | ethers.Signer) => {
  return new ethers.Contract(WRC_TOKEN_ADDRESS, WRC_ABI, providerOrSigner);
};
