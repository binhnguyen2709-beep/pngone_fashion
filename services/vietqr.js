function buildQrUrl({ amount, addInfo }) {
  const bin = process.env.BANK_BIN;
  const accountNo = process.env.BANK_ACCOUNT_NO;
  const accountName = encodeURIComponent(process.env.BANK_ACCOUNT_NAME || '');
  const info = encodeURIComponent(addInfo || '');
  return `https://img.vietqr.io/image/${bin}-${accountNo}-compact2.png?amount=${Math.round(amount)}&addInfo=${info}&accountName=${accountName}`;
}

module.exports = { buildQrUrl };
