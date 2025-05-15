import nodemailer from 'nodemailer';

export async function sendResetEmail(to: string, resetLink: string) {
  // 실제 서비스에서는 환경변수로 관리!
  const transporter = nodemailer.createTransport({
    service: 'gmail', // 또는 smtp 등
    auth: {
      user: process.env.EMAIL_USER, // 예: your@gmail.com
      pass: process.env.EMAIL_PASS, // 앱 비밀번호 또는 실제 비밀번호
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: '[C2C] 비밀번호 재설정 안내',
    html: `
      <p>아래 링크를 클릭해 비밀번호를 재설정하세요.</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>이 링크는 1시간 동안만 유효합니다.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}