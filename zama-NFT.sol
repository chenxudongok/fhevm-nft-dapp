// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v5.0/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v5.0/contracts/access/Ownable.sol";

contract FHE_NFT is ERC721Burnable, Ownable {
    uint256 private _nextTokenId;
    uint256 public constant MAX_SUPPLY = 10000;  // 最大 mint 数量
    mapping(uint256 => bytes) private _encryptedMetadata;
    mapping(uint256 => bool) private _existsEncrypted;

    event Minted(address indexed to, uint256 indexed tokenId, bytes encryptedMetadata);
    event Burned(address indexed owner, uint256 indexed tokenId);

    constructor() 
        ERC721("ZAMA-NFT", "ZAMA") 
        Ownable(msg.sender)
    {
        _nextTokenId = 1;
    }

    /**
     * @notice 铸造 NFT（单地址无限 mint，总量不超过 MAX_SUPPLY）
     */
    function mintWithEncryptedMetadata(address to, bytes calldata encryptedMetadata)
        external
        returns (uint256)
    {
        require(_nextTokenId <= MAX_SUPPLY, "Max supply reached");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        _encryptedMetadata[tokenId] = encryptedMetadata;
        _existsEncrypted[tokenId] = true;

        emit Minted(to, tokenId, encryptedMetadata);
        return tokenId;
    }

    function getEncryptedMetadata(uint256 tokenId) external view returns (bytes memory) {
        require(_existsEncrypted[tokenId], "Encrypted metadata not initialized");
        return _encryptedMetadata[tokenId];
    }

    function burn(uint256 tokenId) public override {
        address owner = ownerOf(tokenId);
        super.burn(tokenId);

        if (_existsEncrypted[tokenId]) {
            delete _encryptedMetadata[tokenId];
            delete _existsEncrypted[tokenId];
        }

        emit Burned(owner, tokenId);
    }

    function adminSetEncryptedMetadata(uint256 tokenId, bytes calldata encryptedMetadata)
        external
        onlyOwner
    {
        require(_existsEncrypted[tokenId], "Not initialized");
        _encryptedMetadata[tokenId] = encryptedMetadata;
    }

    /** 
     * @notice 查询当前已 mint 的总量，用于前端进度条
     */
    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /** @notice 查询最大总量 */
    function maxSupply() external pure returns (uint256) {
        return MAX_SUPPLY;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }
}
