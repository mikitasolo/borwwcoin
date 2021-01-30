const SHA256 = require('crypto-js/sha256')
const prettyMs = require('pretty-ms');

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
}

class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
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
    this.difficulty = 3;
    this.pendingTransactions = [];
    this.miningReward = 100;
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    let block = new Block(Date.now(), [], '0');
    block.mineBlock(this.difficulty);
    return block;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    this.chain.push(block);
    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward),
    ];
  }

  createTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    return this.chain.reduce((amountInChain, block) => {
      return amountInChain + block.transactions.reduce((amountInBlock, txn) => {
        if (txn.fromAddress === address) {
          return amountInBlock - txn.amount;
        }

        if (txn.toAddress === address) {
          return amountInBlock + txn.amount;
        }

        return amountInBlock;
      }, 0)
    }, 0)
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      const expectedCurrentHash = currentBlock.calculateHash();
      if (currentBlock.hash !== expectedCurrentHash) {
        console.error(`The chain is not valid due to incorrect hash of block ${currentBlock.hash}.\nExpected hash: ${expectedCurrentHash}`)
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        console.error(`The chain is not valid due to hashes inconsistency of blocks.\nBlock ${currentBlock.hash} has ${currentBlock.previousHash} as previous while expected: ${previousBlock.hash}`)
        return false;
      }
    }

    return true;
  }
}

let borwwcoin = new Blockchain();

borwwcoin.createTransaction(new Transaction('address1', 'address2', 100));
borwwcoin.createTransaction(new Transaction('address2', 'address1', 50));

borwwcoin.minePendingTransactions('borww_address');
console.log('borww', borwwcoin.getBalanceOfAddress('borww_address'));
console.log('1', borwwcoin.getBalanceOfAddress('address1'));
console.log('2', borwwcoin.getBalanceOfAddress('address2'));
console.log(borwwcoin);
