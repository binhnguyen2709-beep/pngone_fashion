const crypto = require('crypto');

async function createPayment({ orderCode, amount, orderInfo }) {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const endpoint = process.env.MOMO_ENDPOINT;
  const redirectUrl = process.env.MOMO_RETURN_URL;
  const ipnUrl = process.env.MOMO_NOTIFY_URL;
  const requestId = `${orderCode}-${Date.now()}`;
  const requestType = 'captureWallet';
  const extraData = '';

  const rawSignature =
    `accessKey=${accessKey}&amount=${Math.round(amount)}&extraData=${extraData}` +
    `&ipnUrl=${ipnUrl}&orderId=${orderCode}&orderInfo=${orderInfo}` +
    `&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

  const body = {
    partnerCode,
    accessKey,
    requestId,
    amount: String(Math.round(amount)),
    orderId: orderCode,
    orderInfo,
    redirectUrl,
    ipnUrl,
    extraData,
    requestType,
    signature,
    lang: 'vi'
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

function verifyNotify(payload) {
  const secretKey = process.env.MOMO_SECRET_KEY;
  const {
    accessKey,
    amount,
    extraData,
    message,
    orderId,
    orderInfo,
    orderType,
    partnerCode,
    payType,
    requestId,
    responseTime,
    resultCode,
    transId,
    signature
  } = payload;

  const rawSignature =
    `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData || ''}` +
    `&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}` +
    `&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}` +
    `&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

  const expected = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
  return expected === signature && String(resultCode) === '0';
}

module.exports = { createPayment, verifyNotify };
