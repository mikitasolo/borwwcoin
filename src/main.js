const { Blockchain, Transaction } = require('./blockchain')
const EC = require('elliptic').ec;

const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('5024edcf40959767fb094dd3d377b9f294a510cf978f8e1a89bfb1747edcf0e4');
const myWalletAddress = myKey.getPublic('hex');

let borwwcoin = new Blockchain();

borwwcoin.minePendingTransactions(myWalletAddress);

const txn1 = new Transaction(myWalletAddress, 'someone else address', 10);
txn1.sign(myKey);
borwwcoin.addTransaction(txn1);

borwwcoin.minePendingTransactions('someone else address');

// borwwcoin.addTransaction(txn1);
// const txn2 = new Transaction('someone else address', myWalletAddress, 100);
// txn2.sign(myKey);
// borwwcoin.addTransaction(txn2);

console.log(JSON.stringify(borwwcoin, null, 2));

console.log('me', borwwcoin.getBalanceOfAddress(myWalletAddress));
console.log('seomeone', borwwcoin.getBalanceOfAddress('someone else address'));

console.log(borwwcoin.isChainValid());

// borwwcoin.chain[1].transactions[0].amount = 1;
// console.log(borwwcoin.isChainValid());
