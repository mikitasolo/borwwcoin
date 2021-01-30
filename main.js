const SHA256 = require('crypto-js/sha256')

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, '20/01/2021', "Genesis block", '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
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
borwwcoin.addBlock(new Block(1, '21/01/2021', { amount: 4 }));
borwwcoin.addBlock(new Block(2, '22/01/2021', { amount: 10 }));

console.log(borwwcoin.isChainValid());

borwwcoin.chain[1].data = { amount: 50 };
console.log(borwwcoin.isChainValid());

borwwcoin.chain[1].hash = borwwcoin.chain[1].calculateHash();
console.log(borwwcoin.isChainValid());

borwwcoin.chain[2].previousHash = borwwcoin.chain[1].hash
console.log(borwwcoin.isChainValid());

borwwcoin.chain[2].hash = borwwcoin.chain[2].calculateHash()
console.log(borwwcoin.isChainValid());

console.log(JSON.stringify(borwwcoin, null, 4))

