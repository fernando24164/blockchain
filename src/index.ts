const CryptoJS = require('crypto-js');

class Block {

    public index: number;
    public hash: string;
    public previousHash: string | null;
    public timestamp: number;
    public data: string;

    constructor(index: number, hash: string, previousHash: string | null,
        timestamp: number, data: string) {
        this.index = index;
        this.previousHash = previousHash;
        this.hash = hash;
        this.timestamp = timestamp;
        this.data = data;
    }

}

const genesisBlock: Block = new Block(0, CryptoJS.MD5("Genesis Block", "secret-string").toString(),
    null, new Date().getTime() / 1000, "Big Bang");

const blockChain: Block[] = [genesisBlock];

const calculateHash = (index: number, previousHash: string, timestamp: number, data: string): string => {
    return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
};

const getLatestBlock = () => {
    return blockChain[blockChain.length-1];
};

const generateNextBlock = (blockData: string): Block => {
    const previousBlock: Block = getLatestBlock();
    const nextIndex: number = previousBlock.index + 1;
    const nextTimestamp: number = new Date().getTime() / 1000;
    const nextHash: string = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    const newBlock = new Block(nextIndex, nextHash, previousBlock.hash, nextTimestamp, blockData);
    return newBlock;
};

const isValidNewBlock = (newBlock: Block, previousBlock: Block): boolean => {
    if (previousBlock.index + 1 !== newBlock.index) {
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        return false;
    } else if (calculateHash(newBlock.index, newBlock.previousHash, newBlock.timestamp, newBlock.data) !== newBlock.hash) {
        return false;
    }
    return true;
};

const isValidBlockStrucuture = (block: Block): boolean => {
    return typeof block.index === 'number'
        && typeof block.hash === 'string'
        && typeof block.previousHash === 'string'
        && typeof block.timestamp === 'number'
        && typeof block.data === 'string';
};

const isValidChain = (blockChain: Block[]): boolean => {
    const isValidInit = (block: Block) => {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };

    for(let i = 1;i<blockChain.length;i++){
        return isValidNewBlock(blockChain[i], blockChain[i-1]);
    }

    return true && isValidInit(blockChain[0]);
}
