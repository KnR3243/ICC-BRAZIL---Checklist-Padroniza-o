import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Recebemos os dados do frontend
  const { tecnico, patrimonio, pdfBase64 } = req.body;

  // CONFIGURAÇÃO DO CARTEIRO (GMAIL)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'kauan.santos@iccbrazil.com.br', 
      pass: 'japn baeg uufv orf' // Sua senha de app está correta
    }
  });

  // MONTANDO O EMAIL PARA OS DOIS AO MESMO TEMPO
  const mailOptions = {
    // O 'from' deve ser o seu e-mail para o Google não barrar
    from: 'Checklist TI ICC <kauan.santos@iccbrazil.com.br>',
    
    // Aqui os dois e-mails separados por vírgula para receberem juntos
    to: 'kauan.santos@iccbrazil.com.br, odair.junior@iccbrazil.com.br',
    
    subject: 'Checklist Concluído - ' + patrimonio,
    text: 'Olá, segue em anexo o checklist da máquina ' + patrimonio + ' realizado pelo técnico ' + tecnico + '.',
    attachments: [
      {
        filename: 'Checklist_' + patrimonio + '.pdf',
        path: pdfBase64 
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ sent: true });
  } catch (error) {
    // Se der erro, ele retorna o motivo exato aqui
    return res.status(500).json({ error: error.message });
  }
}