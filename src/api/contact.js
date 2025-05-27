const sendgrid = require("@sendgrid/mail");

function sanitize(text, maxLength) {
  return (text || "").toString().trim().substring(0, maxLength);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = async function (context, req) {
  const raw = req.body || {};
  const name = sanitize(raw.name, 50);
  const email = sanitize(raw.email, 100);
  const message = sanitize(raw.message, 1000);

  if (!name || !email || !message) {
    context.res = {
      status: 400,
      body: "すべての項目を入力してください。",
    };
    return;
  }
  if (!isValidEmail(email)) {
    context.res = {
      status: 400,
      body: { error: "メールアドレスの形式が正しくありません。" },
    };
    return;
  }
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const TO_EMAIL = "your@email.com"; // 受信先メールアドレス
  const FROM_EMAIL = "noreply@example.com"; // SendGridで認証された送信元アドレス

  sendgrid.setApiKey(SENDGRID_API_KEY);

  const mail = {
    to: TO_EMAIL,
    from: FROM_EMAIL,
    subject: "新しいお問い合わせが届きました",
    text: `
【お名前】${name}
【メールアドレス】${email}
【お問い合わせ内容】
${message}
    `,
  };

  try {
    await sendgrid.send(mail);
    context.res = {
      status: 200,
      body: { result: "メール送信に成功しました" },
    };
  } catch (error) {
    context.log.error("SendGrid エラー:", error);
    context.res = {
      status: 500,
      body: "メール送信に失敗しました。",
    };
  }
};
