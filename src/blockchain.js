const SHA256 = require('crypto-js/sha256')
const prettyMs = require('pretty-ms');
const { hasDuplicates } = require('./utils');
const EC = require('elliptic').ec;
const uuidv4 = require('uuid').v4;

const ec = new EC('secp256k1');

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
    this.id = uuidv4();
  }

  calculateHash() {
    return SHA256(this.fromAddress + this.toAddress + this.amount + this.timestamp + this.id).toString();
  }

  sign(signingKey) {
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('Not authorized');
    }

    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex');
  }

  isValid() {
    if (this.fromAddress === null) {
      return true;
    }

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature')
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

class Block {
  constructor(transactions, previousHash = '') {
    this.timestamp = Date.now();
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

  hasValidTransactions() {
    if (hasDuplicates(this.transactions.map(txn => txn.id))) {
      return false;
    }

    return !Boolean(this.transactions.find(txn => !txn.isValid()));
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
    let block = new Block( [], '0');
    block.mineBlock(this.difficulty);
    return block;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(rewardTx);

    let block = new Block(this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    this.chain.push(block);
    this.pendingTransactions = [];
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to addresses')
    }

    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain')
    }

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

      if (!currentBlock.hasValidTransactions()) {
        console.error(`The chain is not valid due to invalid transactions in block ${currentBlock.hash}.`)
        return false;
      }

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

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
