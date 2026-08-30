const crypto = require('crypto');
const qs = require('querystring');

function sortObject(obj) {
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = obj[key];
    });
  return sorted;
}

function buildPaymentUrl({ orderCode, amount, ipAddr, orderInfo }) {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secret = process.env.VNPAY_HASH_SECRET;
  const vnpUrl = process.env.VNPAY_URL;
  const returnUrl = process.env.VNPAY_RETURN_URL;

  const date = new Date();
  const createDate = date
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14);

  let params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderCode,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'fashion',
    vnp_Amount: Math.round(amount) * 100,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr || '127.0.0.1',
    vnp_CreateDate: createDate
  };

  params = sortObject(params);
  const signData = qs.stringify(params, undefined, undefined, { encodeURIComponent: (s) => s });
  const hmac = crypto.createHmac('sha512', secret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  params.vnp_SecureHash = signed;

  return `${vnpUrl}?${qs.stringify(params)}`;
}

function verifyReturn(query) {
  const secret = process.env.VNPAY_HASH_SECRET;
  const received = { ...query };
  const secureHash = received.vnp_SecureHash;
  delete received.vnp_SecureHash;
  delete received.vnp_SecureHashType;

  const sorted = sortObject(received);
  const signData = qs.stringify(sorted, undefined, undefined, { encodeURIComponent: (s) => s });
  const hmac = crypto.createHmac('sha512', secret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return signed === secureHash && query.vnp_ResponseCode === '00';
}

module.exports = { buildPaymentUrl, verifyReturn };
