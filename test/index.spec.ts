import { expect } from 'chai';
import {
  Block,
  calculateHash,
  addBlockToChain,
  generateNextBlock,
  reprChain,
  getBlockchain,
} from '../src/index';
import CryptoJS from 'crypto-js';

function createTestBlockchain() {
  for (let data of [...Array(10).keys()]) {
    addBlockToChain(generateNextBlock('block' + data));
  }
}

describe('Blockchain suite test', () => {
  createTestBlockchain();

  it('should test block hash creation', () => {
    const hash = calculateHash(0, 'test', 1, 'test');
    expect(hash).to.equal('1f1be4b6aa312b1638bef47e6f4b264241a4e785955c7973015cb6bfb0b9cc24');
  });

  it('should test block creation', () => {
    const genesisBlock: Block = new Block(
      0,
      CryptoJS.MD5('Big Bang').toString(),
      null,
      new Date().getTime() / 1000,
      'Important data'
    );
    expect(genesisBlock.hash).to.equal(CryptoJS.MD5('Big Bang').toString());
  });

  it('should display blockchain', () => {
    reprChain(getBlockchain())
  });
});
