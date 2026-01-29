// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PetDonation
 * @notice A simple donation contract for BasedPaws pet photo platform
 * @dev Accepts ETH and ERC20 token donations for specific photos
 */
contract PetDonation is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Photo donation tracking
    struct PhotoDonations {
        address owner;
        uint256 ethBalance;
        mapping(address => uint256) tokenBalances;
    }

    // Events
    event PhotoRegistered(uint256 indexed photoId, address indexed owner);
    event ETHDonated(uint256 indexed photoId, address indexed donor, uint256 amount);
    event TokenDonated(uint256 indexed photoId, address indexed donor, address indexed token, uint256 amount);
    event ETHWithdrawn(uint256 indexed photoId, address indexed owner, uint256 amount);
    event TokenWithdrawn(uint256 indexed photoId, address indexed owner, address indexed token, uint256 amount);

    // Storage
    mapping(uint256 => PhotoDonations) public photos;
    mapping(uint256 => bool) public photoExists;
    
    // Total donations tracking
    mapping(uint256 => uint256) public totalETHDonations;
    mapping(uint256 => mapping(address => uint256)) public totalTokenDonations;

    /**
     * @notice Register a new photo for receiving donations
     * @param photoId Unique identifier for the photo
     */
    function registerPhoto(uint256 photoId) external {
        require(!photoExists[photoId], "Photo already registered");
        
        photos[photoId].owner = msg.sender;
        photoExists[photoId] = true;
        
        emit PhotoRegistered(photoId, msg.sender);
    }

    /**
     * @notice Donate ETH to a photo
     * @param photoId The photo to donate to
     */
    function donateETH(uint256 photoId) external payable nonReentrant {
        require(photoExists[photoId], "Photo not registered");
        require(msg.value > 0, "Must send ETH");
        
        photos[photoId].ethBalance += msg.value;
        totalETHDonations[photoId] += msg.value;
        
        emit ETHDonated(photoId, msg.sender, msg.value);
    }

    /**
     * @notice Donate ERC20 tokens to a photo
     * @param photoId The photo to donate to
     * @param token The token address
     * @param amount The amount to donate
     */
    function donateToken(uint256 photoId, address token, uint256 amount) external nonReentrant {
        require(photoExists[photoId], "Photo not registered");
        require(amount > 0, "Must send tokens");
        require(token != address(0), "Invalid token");
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        photos[photoId].tokenBalances[token] += amount;
        totalTokenDonations[photoId][token] += amount;
        
        emit TokenDonated(photoId, msg.sender, token, amount);
    }

    /**
     * @notice Withdraw ETH donations for your photo
     * @param photoId The photo to withdraw from
     */
    function withdrawETH(uint256 photoId) external nonReentrant {
        require(photos[photoId].owner == msg.sender, "Not photo owner");
        
        uint256 balance = photos[photoId].ethBalance;
        require(balance > 0, "No ETH to withdraw");
        
        photos[photoId].ethBalance = 0;
        
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "ETH transfer failed");
        
        emit ETHWithdrawn(photoId, msg.sender, balance);
    }

    /**
     * @notice Withdraw token donations for your photo
     * @param photoId The photo to withdraw from
     * @param token The token to withdraw
     */
    function withdrawToken(uint256 photoId, address token) external nonReentrant {
        require(photos[photoId].owner == msg.sender, "Not photo owner");
        
        uint256 balance = photos[photoId].tokenBalances[token];
        require(balance > 0, "No tokens to withdraw");
        
        photos[photoId].tokenBalances[token] = 0;
        
        IERC20(token).safeTransfer(msg.sender, balance);
        
        emit TokenWithdrawn(photoId, msg.sender, token, balance);
    }

    /**
     * @notice Get photo info
     * @param photoId The photo ID
     * @return owner The photo owner
     * @return ethBalance Current ETH balance
     */
    function getPhotoInfo(uint256 photoId) external view returns (address owner, uint256 ethBalance) {
        return (photos[photoId].owner, photos[photoId].ethBalance);
    }

    /**
     * @notice Get token balance for a photo
     * @param photoId The photo ID
     * @param token The token address
     * @return balance Current token balance
     */
    function getTokenBalance(uint256 photoId, address token) external view returns (uint256 balance) {
        return photos[photoId].tokenBalances[token];
    }
}
