import hre from "hardhat";
const { ethers } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  const signers = await ethers.getSigners();
  if (!signers || signers.length === 0) {
    throw new Error(
      "No deployer account configured. Please define SEPOLIA_PRIVATE_KEY in contracts/.env"
    );
  }
  const deployer = signers[0];

  console.log("==========================================");
  console.log("Deploying AcademicCredentialRegistry...");
  console.log("Deployer Address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer Balance:", ethers.formatEther(balance), "ETH");
  console.log("==========================================");

  if (balance === 0n) {
    throw new Error(
      `Deployer account ${deployer.address} has 0 ETH. Please fund with Sepolia testnet ETH before deploying.`
    );
  }

  const Factory = await ethers.getContractFactory("AcademicCredentialRegistry");
  const registry = await Factory.deploy(deployer.address);
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  const deployTx = registry.deploymentTransaction();
  const receipt = await deployTx?.wait(1);

  console.log("AcademicCredentialRegistry deployed to:", contractAddress);
  console.log("Deployment Tx Hash:", deployTx?.hash);
  console.log("Mined in Block #:", receipt?.blockNumber);

  // Authorize institutional wallet if specified
  const iitdWallet = process.env.IITD_UNIVERSITY_WALLET || deployer.address;
  const iitdCodeHash = ethers.keccak256(ethers.toUtf8Bytes("IITD"));
  console.log(`Registering university ${iitdWallet} with code hash ${iitdCodeHash}...`);
  const tx = await registry.registerUniversity(iitdWallet, iitdCodeHash);
  const regReceipt = await tx.wait();
  console.log("University registered successfully! Tx:", tx.hash, "Block #:", regReceipt?.blockNumber);

  // Save deployment artifact for frontend and backend usage
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    address: contractAddress,
    transactionHash: deployTx?.hash || "",
    blockNumber: receipt?.blockNumber,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  const outputDir = path.join(__dirname, "../../src/config");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, "contractDeployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment details saved to src/config/contractDeployment.json");

  // Also save the compiled ABI and address artifact
  const artifactPath = path.join(__dirname, "../artifacts/contracts/AcademicCredentialRegistry.sol/AcademicCredentialRegistry.json");
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
    fs.writeFileSync(
      path.join(outputDir, "AcademicCredentialRegistry.json"),
      JSON.stringify({ abi: artifact.abi, address: contractAddress }, null, 2)
    );
    console.log("Contract ABI saved to src/config/AcademicCredentialRegistry.json");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
