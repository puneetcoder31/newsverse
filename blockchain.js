// blockchain.js
const crypto = require("crypto");

let blockchainLedger = [];

function logToBlockchain(newsText, result) {
  const timestamp = new Date().toISOString();
  const articleHash = crypto.createHash("sha256").update(newsText).digest("hex");

  const record = {
    transactionId: `TX-${Math.floor(Math.random() * 1000000)}`,
    hash: articleHash,
    label: result.label,
    confidence: result.confidence,
    timestamp
  };

  blockchainLedger.push(record);
  return record;
}

function getBlockchainRecords() {
  return blockchainLedger;
}

module.exports = { logToBlockchain, getBlockchainRecords };
