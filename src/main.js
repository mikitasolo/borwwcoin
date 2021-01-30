const SHA256 = require('crypto-js/sha256')
const prettyMs = require('pretty-ms');

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
  }

  mineBlock(difficulty) {
    const before = Date.now();
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log(`Block mined in ${prettyMs(Date.now() - before)}: ` + this.hash);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 5;
  }

  createGenesisBlock() {
    return new Block(0, '20/01/2021', "Genesis block", '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      const expectedCurrentHash = currentBlock.calculateHash();
      if (currentBlock.hash !== expectedCurrentHash) {
        console.error(`The chain is not valid due to incorrect hash of block ${currentBlock.index}.\nCurrent: ${currentBlock.hash}.\nExpected: ${expectedCurrentHash}`)
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        console.error(`The chain is not valid due to hashes inconsistency of blocks ${currentBlock.index} and ${previousBlock.index}.\nCurrent: ${currentBlock.previousHash}.\nExpected: ${previousBlock.hash}`)
        return false;
      }
    }

    return true;
  }
}

let borwwcoin = new Blockchain();

console.log('Mining block 1...');
borwwcoin.addBlock(new Block(1, '21/01/2021', { amount: 4 }));
console.log('Mining block 2...');
borwwcoin.addBlock(new Block(2, '22/01/2021', { amount: 10 }));

console.log(borwwcoin)
