import { expect } from 'chai'
import blockChain from '../src/index'

describe("Blockchain suite test", () => {
    it("should test block hash creation", () => {
        const hash = blockChain.calculateHash(0, "test", 1, "test");
        expect(hash).to.equal("1f1be4b6aa312b1638bef47e6f4b264241a4e785955c7973015cb6bfb0b9cc24");
    });
});