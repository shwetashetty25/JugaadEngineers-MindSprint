// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AcademicCredentialRegistry
 * @dev VeriDegree X Immutable Academic Credential Ledger.
 * Anchors cryptographic proofs (SHA-256 document and metadata hashes) of degrees on Ethereum Sepolia.
 * ZERO Personally Identifiable Information (PII) is stored on-chain.
 */
contract AcademicCredentialRegistry is AccessControl, Pausable {
    bytes32 public constant UNIVERSITY_ROLE = keccak256("UNIVERSITY_ROLE");

    struct CredentialRecord {
        bytes32 credentialId;     // Unique cryptographic ID (e.g., keccak256("VDX-2024-IITD-0891"))
        bytes32 documentHash;     // SHA-256 binary hash of the academic degree PDF
        bytes32 metadataHash;     // SHA-256 hash of canonical degree metadata
        address issuer;           // Institutional wallet that signed the issuance
        uint256 issuedAt;         // Block timestamp of issuance
        uint256 revokedAt;        // Block timestamp of revocation (0 if active)
        bytes32 revocationReason; // Hash of official senate revocation decree
        bool exists;              // Existence flag
        bool revoked;             // Revocation flag
    }

    struct UniversityRecord {
        bytes32 institutionIdHash; // keccak256 hash of institutional code (e.g. "IITD")
        bool isRegistered;
        bool isActive;
        uint256 registeredAt;
    }

    // Registry Storage
    mapping(bytes32 => CredentialRecord) private _credentials;
    mapping(address => UniversityRecord) private _universities;

    // Custom Errors
    error ZeroAddress();
    error ZeroHash();
    error UniversityAlreadyRegistered(address wallet);
    error UniversityNotRegistered(address wallet);
    error UniversityNotActive(address wallet);
    error CredentialAlreadyExists(bytes32 credentialId);
    error CredentialDoesNotExist(bytes32 credentialId);
    error CredentialAlreadyRevoked(bytes32 credentialId);
    error UnauthorizedIssuer(address caller, address authorizedIssuer);

    // Events (Contain only non-sensitive cryptographic indexes)
    event UniversityRegistered(
        address indexed wallet,
        bytes32 indexed institutionIdHash,
        uint256 timestamp
    );
    event UniversityDeactivated(address indexed wallet, uint256 timestamp);
    event UniversityReactivated(address indexed wallet, uint256 timestamp);

    event CredentialIssued(
        bytes32 indexed credentialId,
        bytes32 indexed documentHash,
        bytes32 metadataHash,
        address indexed issuer,
        uint256 issuedAt
    );

    event CredentialRevoked(
        bytes32 indexed credentialId,
        bytes32 indexed reasonHash,
        address indexed revoker,
        uint256 revokedAt
    );

    constructor(address initialAdmin) {
        if (initialAdmin == address(0)) revert ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
    }

    // ==========================================
    // UNIVERSITY REGISTRY MANAGEMENT
    // ==========================================

    /**
     * @notice Authorizes an institutional wallet to issue credentials.
     * @param wallet The institutional signing wallet address.
     * @param institutionIdHash keccak256 of the institution identifier.
     */
    function registerUniversity(
        address wallet,
        bytes32 institutionIdHash
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (wallet == address(0)) revert ZeroAddress();
        if (institutionIdHash == bytes32(0)) revert ZeroHash();
        if (_universities[wallet].isRegistered) revert UniversityAlreadyRegistered(wallet);

        _universities[wallet] = UniversityRecord({
            institutionIdHash: institutionIdHash,
            isRegistered: true,
            isActive: true,
            registeredAt: block.timestamp
        });

        _grantRole(UNIVERSITY_ROLE, wallet);
        emit UniversityRegistered(wallet, institutionIdHash, block.timestamp);
    }

    /**
     * @notice Deactivates an institution from issuing new credentials without affecting past records.
     */
    function deactivateUniversity(address wallet) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (!_universities[wallet].isRegistered) revert UniversityNotRegistered(wallet);
        _universities[wallet].isActive = false;
        _revokeRole(UNIVERSITY_ROLE, wallet);
        emit UniversityDeactivated(wallet, block.timestamp);
    }

    /**
     * @notice Reactivates a previously registered institution.
     */
    function reactivateUniversity(address wallet) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (!_universities[wallet].isRegistered) revert UniversityNotRegistered(wallet);
        _universities[wallet].isActive = true;
        _grantRole(UNIVERSITY_ROLE, wallet);
        emit UniversityReactivated(wallet, block.timestamp);
    }

    /**
     * @notice Checks whether an address is an active registered university.
     */
    function isUniversityRegistered(address wallet) external view returns (bool) {
        return _universities[wallet].isRegistered && _universities[wallet].isActive;
    }

    // ==========================================
    // CREDENTIAL LIFECYCLE
    // ==========================================

    /**
     * @notice Registers a credential fingerprint on-chain.
     * @dev Only active registered universities can call.
     * @param credentialId Unique bytes32 identifier.
     * @param documentHash SHA-256 fingerprint of the academic degree PDF.
     * @param metadataHash SHA-256 fingerprint of the degree metadata.
     */
    function issueCredential(
        bytes32 credentialId,
        bytes32 documentHash,
        bytes32 metadataHash
    ) external whenNotPaused {
        if (!_universities[msg.sender].isRegistered || !_universities[msg.sender].isActive) {
            revert UniversityNotActive(msg.sender);
        }
        if (credentialId == bytes32(0) || documentHash == bytes32(0) || metadataHash == bytes32(0)) {
            revert ZeroHash();
        }
        if (_credentials[credentialId].exists) {
            revert CredentialAlreadyExists(credentialId);
        }

        _credentials[credentialId] = CredentialRecord({
            credentialId: credentialId,
            documentHash: documentHash,
            metadataHash: metadataHash,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            revokedAt: 0,
            revocationReason: bytes32(0),
            exists: true,
            revoked: false
        });

        emit CredentialIssued(credentialId, documentHash, metadataHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Revokes a previously issued credential with an on-chain decree reason hash.
     * @dev Only the issuing university or default admin can revoke.
     */
    function revokeCredential(
        bytes32 credentialId,
        bytes32 reasonHash
    ) external whenNotPaused {
        CredentialRecord storage record = _credentials[credentialId];
        if (!record.exists) revert CredentialDoesNotExist(credentialId);
        if (record.revoked) revert CredentialAlreadyRevoked(credentialId);

        if (msg.sender != record.issuer && !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert UnauthorizedIssuer(msg.sender, record.issuer);
        }

        record.revoked = true;
        record.revokedAt = block.timestamp;
        record.revocationReason = reasonHash;

        emit CredentialRevoked(credentialId, reasonHash, msg.sender, block.timestamp);
    }

    // ==========================================
    // VERIFICATION & READ OPERATIONS
    // ==========================================

    /**
     * @notice Verifies whether a credential exists and is active.
     */
    function verifyCredential(bytes32 credentialId)
        external
        view
        returns (
            bool exists,
            bool isAuthentic,
            bool isRevoked,
            address issuer,
            bytes32 documentHash,
            bytes32 metadataHash,
            uint256 issuedAt,
            uint256 revokedAt
        )
    {
        CredentialRecord memory record = _credentials[credentialId];
        if (!record.exists) {
            return (false, false, false, address(0), bytes32(0), bytes32(0), 0, 0);
        }

        bool issuerAuthorized = _universities[record.issuer].isRegistered;
        bool authentic = record.exists && !record.revoked && issuerAuthorized;

        return (
            record.exists,
            authentic,
            record.revoked,
            record.issuer,
            record.documentHash,
            record.metadataHash,
            record.issuedAt,
            record.revokedAt
        );
    }

    /**
     * @notice Retrieves full on-chain credential record struct.
     */
    function getCredential(bytes32 credentialId)
        external
        view
        returns (CredentialRecord memory)
    {
        if (!_credentials[credentialId].exists) revert CredentialDoesNotExist(credentialId);
        return _credentials[credentialId];
    }

    /**
     * @notice Pauses contract in emergency.
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpauses contract.
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}

