"use strict";
const CryptoJS = require('crypto-js');
class Block {
    constructor(index, hash, previousHash, timestamp, data) {
        this.index = index;
        this.previousHash = previousHash;
        this.hash = hash;
        this.timestamp = timestamp;
        this.data = data;
    }
}
const genesisBlock = new Block(0, CryptoJS.MD5("Genesis Block", "secret-string").toString(), null, new Date().getTime() / 1000, "Big Bang");
const blockChain = [genesisBlock];
const calculateHash = (index, previousHash, timestamp, data) => {
    return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
};
const getLatestBlock = () => {
    return blockChain[blockChain.length - 1];
};
const generateNextBlock = (blockData) => {
    const previousBlock = getLatestBlock();
    const nextIndex = previousBlock.index + 1;
    const nextTimestamp = new Date().getTime() / 1000;
    const nextHash = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    const newBlock = new Block(nextIndex, nextHash, previousBlock.hash, nextTimestamp, blockData);
    return newBlock;
};
const isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.index + 1 !== newBlock.index) {
        return false;
    }
    else if (previousBlock.hash !== newBlock.previousHash) {
        return false;
    }
    else if (calculateHash(newBlock.index, newBlock.previousHash, newBlock.timestamp, newBlock.data) !== newBlock.hash) {
        return false;
    }
    return true;
};
const isValidBlockStrucuture = (block) => {
    return typeof block.index === 'number'
        && typeof block.hash === 'string'
        && typeof block.previousHash === 'string'
        && typeof block.timestamp === 'number'
        && typeof block.data === 'string';
};
const isValidChain = (blockChain) => {
    const isValidInit = (block) => {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };
    for (let i = 1; i < blockChain.length; i++) {
        return isValidNewBlock(blockChain[i], blockChain[i - 1]);
    }
    return true && isValidInit(blockChain[0]);
};
