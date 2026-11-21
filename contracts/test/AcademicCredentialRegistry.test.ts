import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { AcademicCredentialRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("AcademicCredentialRegistry Smart Contract Tests", function () {
  let registry: AcademicCredentialRegistry;
  let admin: SignerWithAddress;
  let university: SignerWithAddress;
  let unauthorizedUniv: SignerWithAddress;
  let recruiter: SignerWithAddress;

  const testCredId = ethers.keccak256(ethers.toUtf8Bytes("VDX-2024-IITD-0891"));
  const testDocHash = ethers.sha256(ethers.toUtf8Bytes("DEGREE_PDF_CONTENT_SAMPLE_BYTES"));
  const testMetaHash = ethers.sha256(ethers.toUtf8Bytes('{"degree":"B.Tech","student":"Aarav Sharma"}'));
  const testInstHash = ethers.keccak256(ethers.toUtf8Bytes("IITD"));
  const testReasonHash = ethers.keccak256(ethers.toUtf8Bytes("Senate Decree #SR-2024-41"));

  beforeEach(async function () {
    [admin, university, unauthorizedUniv, recruiter] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("AcademicCredentialRegistry");
    registry = await Factory.deploy(admin.address);
    await registry.waitForDeployment();
  });

  describe("University Authorization", function () {
    it("Admin can register university", async function () {
      await expect(registry.connect(admin).registerUniversity(university.address, testInstHash))
        .to.emit(registry, "UniversityRegistered");

      expect(await registry.isUniversityRegistered(university.address)).to.be.true;
    });

    it("Unauthorised account cannot register university", async function () {
      await expect(
        registry.connect(unauthorizedUniv).registerUniversity(unauthorizedUniv.address, testInstHash)
      ).to.be.revertedWithCustomError(registry, "AccessControlUnauthorizedAccount");
    });

    it("Deactivated university cannot issue new credentials", async function () {
      await registry.connect(admin).registerUniversity(university.address, testInstHash);
      await registry.connect(admin).deactivateUniversity(university.address);

      expect(await registry.isUniversityRegistered(university.address)).to.be.false;

      await expect(
        registry.connect(university).issueCredential(testCredId, testDocHash, testMetaHash)
      ).to.be.revertedWithCustomError(registry, "UniversityNotActive");
    });
  });

  describe("Credential Issuance", function () {
    beforeEach(async function () {
      await registry.connect(admin).registerUniversity(university.address, testInstHash);
    });

    it("Registered university can issue credential", async function () {
      const tx = await registry.connect(university).issueCredential(testCredId, testDocHash, testMetaHash);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      await expect(tx)
        .to.emit(registry, "CredentialIssued")
        .withArgs(testCredId, testDocHash, testMetaHash, university.address, block!.timestamp);

      const cred = await registry.getCredential(testCredId);
      expect(cred.exists).to.be.true;
      expect(cred.revoked).to.be.false;
      expect(cred.documentHash).to.equal(testDocHash);
      expect(cred.issuer).to.equal(university.address);
    });

    it("Unregistered university cannot issue credential", async function () {
      await expect(
        registry.connect(unauthorizedUniv).issueCredential(testCredId, testDocHash, testMetaHash)
      ).to.be.revertedWithCustomError(registry, "UniversityNotActive");
    });

    it("Duplicate credential ID is rejected", async function () {
      await registry.connect(university).issueCredential(testCredId, testDocHash, testMetaHash);

      await expect(
        registry.connect(university).issueCredential(testCredId, testDocHash, testMetaHash)
      ).to.be.revertedWithCustomError(registry, "CredentialAlreadyExists");
    });

    it("Zero hashes are rejected", async function () {
      await expect(
        registry.connect(university).issueCredential(ethers.ZeroHash, testDocHash, testMetaHash)
      ).to.be.revertedWithCustomError(registry, "ZeroHash");

      await expect(
        registry.connect(university).issueCredential(testCredId, ethers.ZeroHash, testMetaHash)
      ).to.be.revertedWithCustomError(registry, "ZeroHash");
    });
  });

  describe("Verification & Revocation", function () {
    beforeEach(async function () {
      await registry.connect(admin).registerUniversity(university.address, testInstHash);
      await registry.connect(university).issueCredential(testCredId, testDocHash, testMetaHash);
    });

    it("Recruiter can read and verify active credential", async function () {
      const result = await registry.connect(recruiter).verifyCredential(testCredId);
      expect(result.exists).to.be.true;
      expect(result.isAuthentic).to.be.true;
      expect(result.isRevoked).to.be.false;
      expect(result.documentHash).to.equal(testDocHash);
      expect(result.issuer).to.equal(university.address);
    });

    it("Issuer can revoke credential with reason hash", async function () {
      const tx = await registry.connect(university).revokeCredential(testCredId, testReasonHash);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      await expect(tx)
        .to.emit(registry, "CredentialRevoked")
        .withArgs(testCredId, testReasonHash, university.address, block!.timestamp);

      const result = await registry.connect(recruiter).verifyCredential(testCredId);
      expect(result.exists).to.be.true;
      expect(result.isAuthentic).to.be.false;
      expect(result.isRevoked).to.be.true;
    });

    it("Unauthorised account cannot revoke credential", async function () {
      await expect(
        registry.connect(unauthorizedUniv).revokeCredential(testCredId, testReasonHash)
      ).to.be.revertedWithCustomError(registry, "UnauthorizedIssuer");
    });

    it("Repeated revocation is rejected", async function () {
      await registry.connect(university).revokeCredential(testCredId, testReasonHash);

      await expect(
        registry.connect(university).revokeCredential(testCredId, testReasonHash)
      ).to.be.revertedWithCustomError(registry, "CredentialAlreadyRevoked");
    });

    it("Existing historical credentials remain readable after university deactivation", async function () {
      await registry.connect(admin).deactivateUniversity(university.address);

      const cred = await registry.getCredential(testCredId);
      expect(cred.exists).to.be.true;
      expect(cred.documentHash).to.equal(testDocHash);
    });

    it("Admin can reactivate a deactivated university", async function () {
      await registry.connect(admin).deactivateUniversity(university.address);
      expect(await registry.isUniversityRegistered(university.address)).to.be.false;

      await registry.connect(admin).reactivateUniversity(university.address);
      expect(await registry.isUniversityRegistered(university.address)).to.be.true;
    });

    it("Non-existent credential returns exists: false and isAuthentic: false", async function () {
      const nonExistentId = ethers.keccak256(ethers.toUtf8Bytes("NON_EXISTENT_ID"));
      const result = await registry.connect(recruiter).verifyCredential(nonExistentId);
      expect(result.exists).to.be.false;
      expect(result.isAuthentic).to.be.false;
      expect(result.isRevoked).to.be.false;
    });

    it("Admin can revoke a credential on regulatory grounds", async function () {
      const regulatoryReason = ethers.keccak256(ethers.toUtf8Bytes("REGULATORY_DECREE"));
      await expect(
        registry.connect(admin).revokeCredential(testCredId, regulatoryReason)
      ).to.emit(registry, "CredentialRevoked");

      const result = await registry.connect(recruiter).verifyCredential(testCredId);
      expect(result.exists).to.be.true;
      expect(result.isAuthentic).to.be.false;
      expect(result.isRevoked).to.be.true;
    });
  });
});
