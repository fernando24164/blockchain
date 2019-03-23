import CryptoJS from 'crypto-js'
import { broadcastLatest } from './peerConnection'

export class Block {

    private _index: number;
    private _hash: string;
    private _previousHash: string | null;
    private _timestamp: number;
    private _data: string;

    constructor(index: number, hash: string, previousHash: string | null,
        timestamp: number, data: string) {
        this._index = index;
        this._previousHash = previousHash;
        this._hash = hash;
        this._timestamp = timestamp;
        this._data = data;
    }

    public get index(): number {
        return this._index
    }


    public get hash(): string {
        return this._hash
    }


    public get previousHash(): string | null {
        return this._previousHash
    }


    public get timestamp(): number {
        return this._timestamp
    }


    public get data(): string {
        return this._data
    }

}

const genesisBlock: Block = new Block(0, CryptoJS.MD5("Genesis Block", "secret-string").toString(),
    null, new Date().getTime() / 1000, "Big Bang");

let blockChain: Block[] = [genesisBlock];

export const calculateHash = (index: number, previousHash: string, timestamp: number, data: string): string => {
    return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
};

export const getLatestBlock = () => {
    return blockChain[blockChain.length - 1];
};

export const generateNextBlock = (blockData: string): Block => {
    const previousBlock: Block = getLatestBlock();
    const nextIndex: number = previousBlock.index + 1;
    const nextTimestamp: number = new Date().getTime() / 1000;
    const nextHash: string = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    const newBlock = new Block(nextIndex, nextHash, previousBlock.hash, nextTimestamp, blockData);
    return newBlock;
};

export const isValidNewBlock = (newBlock: Block, previousBlock: Block): boolean => {
    if (previousBlock.index + 1 !== newBlock.index) {
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        return false;
    } else if (calculateHash(newBlock.index, newBlock.previousHash, newBlock.timestamp, newBlock.data) !== newBlock.hash) {
        return false;
    }
    return true;
};

export const isValidBlockStructure = (block: Block): boolean => {
    return typeof block.index === 'number'
        && typeof block.hash === 'string'
        && typeof block.previousHash === 'string'
        && typeof block.timestamp === 'number'
        && typeof block.data === 'string';
};

export const isValidChain = (blockChain: Block[]): boolean => {
    const isValidInit = (block: Block) => {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };

    for (let i = 1; i < blockChain.length; i++) {
        return isValidNewBlock(blockChain[i], blockChain[i - 1]);
    }

    return true && isValidInit(blockChain[0]);
}

export const getBlockchain = (): Block[] => blockChain;

export const addBlockToChain = (newBlock: Block) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockChain.push(newBlock);
        return true;
    }
    return false;
};

export const replaceChain = (newBlocks: Block[]) => {
    if (isValidChain(newBlocks) && getBlockchain().length < newBlocks.length) {
        blockChain = newBlocks;
        broadcastLatest();
    }
}

export default {
    isValidChain: isValidChain,
    isValidBlockStructure: isValidBlockStructure,
    isValidNewBlock: isValidNewBlock,
    generateNextBlock: generateNextBlock,
    calculateHash: calculateHash
}
