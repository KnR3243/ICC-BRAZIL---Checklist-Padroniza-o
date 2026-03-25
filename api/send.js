import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // 1. Bloqueia se não for POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Pega os dados que o seu React está enviando
  const { tecnico, patrimonio, pdfBase64 } = req.body;

  // 3. CONFIGURAÇÃO DO CARTEIRO (GMAIL)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'kauan.santos@iccbrazil.com.br', 
      pass: 'japn baeg uufv orf' // Sua senha de app
    }
  });

  try {
    // --- O PULO DO GATO ---
    // O jsPDF envia algo como "data:application/pdf;base64,JVBERi..."
    // Precisamos remover o texto inicial para o email entender apenas o código do arquivo
    const base64Data = pdfBase64.split(',')[1]; 

    // 4. MONTANDO O EMAIL
    const mailOptions = {
      from: '"Checklist TI ICC" <kauan.santos@iccbrazil.com.br>',
      to: 'kauan.santos@iccbrazil.com.br, odair.junior@iccbrazil.com.br',
      subject: `✅ Checklist Concluído - ${patrimonio}`,
      text: `Olá, segue em anexo o checklist da máquina ${patrimonio} realizado pelo técnico ${tecnico}.`,
      attachments: [
        {
          filename: `Checklist_${patrimonio}.pdf`,
          content: base64Data, // Mudamos de 'path' para 'content'
          encoding: 'base64'   // Avisamos que o formato é base64
        }
      ]
    };

    // 5. ENVIA O EMAIL
    await transporter.sendMail(mailOptions);
    
    // Retorno de sucesso para o seu React
    return res.status(200).json({ sent: true });

  } catch (error) {
    console.error('Erro no servidor de email:', error);
    return res.status(500).json({ error: error.message });
  }
}