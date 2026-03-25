import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Garante que só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { tecnico, patrimonio, pdfBase64, email } = req.body;

  // 1. Configuração do Gmail (Seu e-mail e senha de app)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'kauan.santos@iccbrazil.com.br',
      pass: 'japn baeg uufv orf' // Sua senha de app de 16 dígitos
    }
  });

  try {
    // 2. Tratamento do PDF: remove o cabeçalho e transforma em Buffer
    // O PDF vem do frontend como: "data:application/pdf;base64,JVBERi..."
    const base64Content = pdfBase64.split('base64,')[1];
    const pdfBuffer = Buffer.from(base64Content, 'base64');

    // 3. Montagem do E-mail
    const mailOptions = {
      from: '"Checklist TI ICC" <kauan.santos@iccbrazil.com.br>',
      to: 'kauan.santos@iccbrazil.com.br, odair.junior@iccbrazil.com.br',
      subject: `✅ Checklist Finalizado - ${patrimonio}`,
      text: `Olá, segue em anexo o checklist da máquina ${patrimonio} concluído pelo técnico ${tecnico}.`,
      attachments: [
        {
          filename: `Checklist_${patrimonio}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // 4. Envio real
    await transporter.sendMail(mailOptions);
    
    return res.status(200).json({ sent: true });

  } catch (error) {
    console.error('ERRO NO SERVIDOR:', error);
    return res.status(500).json({ error: error.message });
  }
}