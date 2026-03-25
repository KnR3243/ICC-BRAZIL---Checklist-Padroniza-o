import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { tecnico, patrimonio, pdfBase64 } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'kauan.santos@iccbrazil.com.br',
      pass: 'ywlgbeuxxvvjhcrz' // Senha de app sem espaços
    }
  });

  try {
    const base64Content = pdfBase64.split('base64,')[1];
    const pdfBuffer = Buffer.from(base64Content, 'base64');

    const mailOptions = {
      from: '"Checklist TI ICC" <kauan.santos@iccbrazil.com.br>',
      // Envia para ambos os e-mails da TI
      to: 'kauan.santos@iccbrazil.com.br, odair.junior@iccbrazil.com.br',
      subject: `✅ Checklist Finalizado - ${patrimonio}`,
      text: `Olá, segue em anexo o checklist da máquina ${patrimonio} realizado pelo técnico ${tecnico}.`,
      attachments: [{
        filename: `Checklist_${patrimonio}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ sent: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}