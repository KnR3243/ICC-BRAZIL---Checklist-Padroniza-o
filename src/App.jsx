import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, Circle, Moon, Sun, Trash2, XCircle, Send } from 'lucide-react';
import { jsPDF } from 'jspdf';

const initialData = [
  { id: 1, task: "Limpeza física e organização", cat: "Hardware" },
  { id: 2, task: "Verificar atualizações (Windows Update)", cat: "Sistema" },
  { id: 3, task: "Nome da máquina (Patrimônio)", cat: "Sistema" },
  { id: 4, task: "Usuário local User", cat: "Acessos" },
  { id: 5, task: "Máquina no domínio (iccnew.local)", cat: "Acessos" },
  { id: 6, task: "Usuário do AD com admin", cat: "Acessos" },
  { id: 7, task: "Plano de energia (Inic. Rápida OFF)", cat: "Otimização" },
  { id: 8, task: "Desempenho (Perfil Desempenho)", cat: "Otimização" },
  { id: 9, task: "Ajustar Resolução e Escala de tela", cat: "Sistema" },
  { id: 10, task: "Privacidade e Segurança (Permissões)", cat: "Otimização" },
  { id: 11, task: "Personalizar (Efeitos Visuais OFF)", cat: "Otimização" },
  { id: 12, task: "Apps inicializados com sistema", cat: "Otimização" },
  { id: 13, task: "Serviços não Microsoft (msconfig)", cat: "Otimização" },
  { id: 14, task: "Verificar Drivers (Gerenciador de Disp.)", cat: "Sistema" },
  { id: 15, task: "Office (Licença vinculada)", cat: "Apps" },
  { id: 16, task: "Google Drive (Instalação)", cat: "Apps" },
  { id: 17, task: "Google Chat", cat: "Apps" },
  { id: 18, task: "Google Meet (Configurações)", cat: "Apps" },
  { id: 19, task: "Teams (Configurações)", cat: "Apps" },
  { id: 20, task: "Google Chrome (Sincronizar)", cat: "Apps" },
  { id: 21, task: "Adblock (Ativar no Navegador)", cat: "Apps" },
  { id: 22, task: "TeamViewer (ID e Senha)", cat: "Suporte" },
  { id: 23, task: "OpenVPN (Configurar)", cat: "Rede" },
  { id: 24, task: "Antivírus (BitDefender)", cat: "Segurança" },
  { id: 25, task: "Adobe Acrobat (PDF)", cat: "Apps" },
  { id: 26, task: "Zebra3 (Configurar)", cat: "Apps" },
  { id: 27, task: "Remover Bloatwares (Apps inúteis)", cat: "Sistema" },
  { id: 28, task: "Ativação conta Google", cat: "Acessos" },
  { id: 29, task: "Hardware (Câmera/Áudio/Imp)", cat: "Hardware" },
  { id: 30, task: "Acesso a vm06", cat: "Rede" },
  { id: 31, task: "Ping - 192.168.10.8 (AD)", cat: "Rede" },
  { id: 32, task: "Ping - 192.168.10.20 (Srv)", cat: "Rede" },
  { id: 33, task: "Ping - 192.168.10.10 (File)", cat: "Rede" },
];

const STORAGE_KEY = 'checklist_icc_vFinal_Pro';

export default function App() {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { items: initialData, patrimonio: '', tecnico: '', email: '', checkedItems: {}, darkMode: false };
  });

  const { items, patrimonio, tecnico, email, checkedItems, darkMode } = state;
  const [enviando, setEnviando] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [modal, setModal] = useState({ show: false, title: '', msg: '', type: 'error' });
  const canvasRef = useRef(null);

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = (completedCount / items.length) * 100;

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);

  const updateState = (val) => setState(p => ({ ...p, ...val }));

  const handleTecnicoChange = (val) => {
    let mail = val === 'Kauan' ? 'kauan.santos@iccbrazil.com.br' : val === 'Odair' ? 'odair.junior@iccbrazil.com.br' : '';
    updateState({ tecnico: val, email: mail });
  };

  const handleResetChecklist = () => {
    if (window.confirm("Deseja limpar todos os dados?")) {
      updateState({ patrimonio: '', tecnico: '', email: '', checkedItems: {} });
      setHasSigned(false);
      setShowErrors(false);
      if (canvasRef.current) canvasRef.current.getContext('2d').clearRect(0, 0, 600, 180);
    }
  };

  const gerarPDF = async () => {
    let motivos = [];
    if (!tecnico) motivos.push("selecionar o técnico");
    if (!patrimonio) motivos.push("informar o patrimônio");
    if (completedCount < items.length) motivos.push(`marcar os itens restantes`);
    if (!hasSigned) motivos.push("assinar o documento");

    if (motivos.length > 0) {
      setShowErrors(true);
      setModal({ show: true, title: 'Incompleto', msg: "Para finalizar, você precisa: " + motivos.join(", ") + ".", type: 'error' });
      return;
    }

    setEnviando(true);
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: false });

    try {
      const img = new Image();
      img.src = '/logo.png';
      await new Promise((resolve) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width; canvas.height = img.height;
          ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          doc.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 15, 10, 45, 18); 
          resolve();
        };
        img.onerror = () => resolve();
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('CHECKLIST PÓS FORMATAÇÃO - TI ICC', 105, 40, { align: 'center' });
      doc.setFontSize(11);
      doc.text(`Técnico: ${tecnico} | Patrimônio: ${patrimonio}`, 105, 48, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gerado em: ${new Date().toLocaleString()}`, 105, 54, { align: 'center' });
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 58, 190, 58);

      let y = 65;
      doc.setFontSize(8.5);
      items.forEach(i => {
        doc.setFont('helvetica', 'bold');
        doc.text(`[X] ${i.cat.toUpperCase()}:`, 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${i.task}`, 55, y);
        y += 5.5;
      });

      const sigCanvas = canvasRef.current;
      const finalSigCanvas = document.createElement('canvas');
      finalSigCanvas.width = sigCanvas.width; finalSigCanvas.height = sigCanvas.height;
      const sigCtx = finalSigCanvas.getContext('2d');
      sigCtx.fillStyle = '#FFFFFF'; sigCtx.fillRect(0, 0, finalSigCanvas.width, finalSigCanvas.height);
      sigCtx.drawImage(sigCanvas, 0, 0);
      doc.addImage(finalSigCanvas.toDataURL('image/jpeg', 1.0), 'JPEG', 80, y + 8, 50, 15);
      doc.line(75, y + 24, 135, y + 24); 
      doc.text('Assinatura do Técnico', 105, y + 29, { align: 'center' });

      const pdfBase64 = doc.output('datauristring');
      await fetch('/api/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tecnico, patrimonio, pdfBase64, email }) });
      
      setModal({ show: true, title: 'Sucesso!', msg: 'Enviado com sucesso!', type: 'success' });

      // Limpeza automática (exceto tema)
      updateState({ patrimonio: '', tecnico: '', email: '', checkedItems: {} });
      setHasSigned(false);
      setShowErrors(false);
      if (canvasRef.current) canvasRef.current.getContext('2d').clearRect(0, 0, 600, 180);

    } catch (e) {
      setModal({ show: true, title: 'Finalizado', msg: 'PDF baixado.', type: 'success' });
    } finally {
      doc.save(`Checklist_${patrimonio}.pdf`);
      setEnviando(false);
    }
  };

  const theme = { 
    bg: darkMode ? '#0f172a' : '#f1f5f9', 
    card: darkMode ? '#1e293b' : '#ffffff', 
    text: darkMode ? '#f8fafc' : '#1e293b', 
    border: darkMode ? '#334155' : '#cbd5e1', 
    accent: '#0ea5e9' 
  };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '15px', paddingBottom: '140px', display: 'flex', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {modal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="modal-pop" style={{ background: theme.card, padding: '40px', borderRadius: '30px', textAlign: 'center', maxWidth: '450px', border: `1px solid ${theme.border}` }}>
            {modal.type === 'error' ? <XCircle size={70} color="#ef4444" /> : <CheckCircle size={70} color="#22c55e" />}
            <h2 style={{ fontWeight: '800', marginTop: '20px', color: theme.text }}>{modal.title}</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '10px' }}>{modal.msg}</p>
            <button onClick={() => setModal({ ...modal, show: false })} className="btn-invert-accent" style={{ background: theme.accent, color: '#fff', border: `2px solid ${theme.accent}`, padding: '15px 40px', borderRadius: '15px', fontWeight: '800', marginTop: '25px', cursor: 'pointer' }}>OK</button>
          </div>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: '750px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src="/logo.png" alt="Logo" style={{ maxWidth: '140px' }} />
        </div>

        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', background: theme.card, padding: '10px 20px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
          <h1 style={{ fontSize: '16px', fontWeight: '800', color: theme.text, margin: 0 }}>Checklist: Pós-Formatação</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => updateState({ darkMode: !darkMode })} className="btn-theme-toggle" style={{ background: theme.bg, border: `1px solid ${theme.border}`, padding: '10px', borderRadius: '12px', cursor: 'pointer', color: theme.text }}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={handleResetChecklist} className="btn-invert-red" style={{ background: '#ef444420', color: '#ef4444', border: '1px solid transparent', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}>
              <Trash2 size={18} />
            </button>
          </div>
        </header>

        {/* INPUTS */}
        <div className={showErrors && (!patrimonio || !tecnico) ? 'error-shake' : ''} style={{ background: theme.card, padding: '20px', borderRadius: '25px', marginBottom: '15px', border: `1px solid ${showErrors && (!patrimonio || !tecnico) ? '#ef4444' : theme.border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '12px', marginBottom: '12px' }}>
            <select value={tecnico} onChange={(e) => handleTecnicoChange(e.target.value)} style={{ padding: '15px', borderRadius: '15px', border: '1px solid ' + theme.border, background: theme.bg, color: theme.text, fontWeight: '800' }}>
              <option value="">TÉCNICO</option><option value="Odair">ODAIR</option><option value="Kauan">KAUAN</option>
            </select>
            <input value={email} readOnly placeholder="E-MAIL" style={{ padding: '15px', borderRadius: '15px', border: '1px solid ' + theme.border, background: theme.bg, color: '#94a3b8', fontWeight: '800' }} />
          </div>
          <input placeholder="PATRIMÔNIO (EX: MA001234)" value={patrimonio} onChange={(e) => updateState({ patrimonio: e.target.value.toUpperCase() })} style={{ padding: '15px', borderRadius: '15px', border: '1px solid ' + theme.border, background: theme.bg, color: theme.text, fontWeight: '800', width: '100%', boxSizing: 'border-box' }} />
        </div>

        {/* PROGRESSO */}
        <div style={{ background: theme.card, padding: '15px 20px', borderRadius: '20px', marginBottom: '15px', border: `1px solid ${theme.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: '900', color: completedCount === items.length ? '#22c55e' : theme.accent }}>{completedCount} / {items.length}</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: theme.bg, borderRadius: '3px' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: completedCount === items.length ? '#22c55e' : theme.accent, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* LISTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((item) => {
            const isChecked = checkedItems[item.id];
            const isError = showErrors && !isChecked;
            return (
              <div key={item.id} className={`checklist-card ${isError ? 'error-shake' : ''}`} onClick={() => updateState({ checkedItems: { ...checkedItems, [item.id]: !isChecked } })}
                style={{ display: 'flex', alignItems: 'center', padding: '20px', borderRadius: '20px', border: `2px solid ${isChecked ? '#22c55e' : (isError ? '#ef4444' : theme.border)}`, background: theme.card, cursor: 'pointer' }}>
                <div style={{ marginRight: '20px' }}>{isChecked ? <CheckCircle color="#22c55e" size={32} /> : <Circle color={isError ? "#ef4444" : "#94a3b8"} size={32} />}</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: theme.text }}>{item.task}</div>
                  <div style={{ fontSize: '10px', fontWeight: '900', opacity: 0.4, color: theme.text }}>{item.cat}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ASSINATURA */}
        <div className={showErrors && !hasSigned ? 'error-shake' : ''} style={{ marginTop: '20px', background: '#fff', padding: '25px', borderRadius: '30px', border: `2px solid ${showErrors && !hasSigned ? '#ef4444' : '#eee'}` }}>
          <p style={{ color: '#000', fontSize: '11px', fontWeight: '900', marginBottom: '10px' }}>ASSINATURA OBRIGATÓRIA</p>
          <canvas ref={canvasRef} width={600} height={160} 
            onMouseDown={(e) => { const rect = canvasRef.current.getBoundingClientRect(); const ctx = canvasRef.current.getContext('2d'); ctx.lineWidth=2; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(e.clientX-rect.left, e.clientY-rect.top); canvasRef.current.isDrawing=true; setHasSigned(true); }} 
            onMouseMove={(e) => { if(!canvasRef.current.isDrawing) return; const rect = canvasRef.current.getBoundingClientRect(); canvasRef.current.getContext('2d').lineTo(e.clientX-rect.left, e.clientY-rect.top); canvasRef.current.getContext('2d').stroke(); }} 
            onMouseUp={() => canvasRef.current.isDrawing=false} 
            onTouchStart={(e) => { const rect = canvasRef.current.getBoundingClientRect(); const ctx = canvasRef.current.getContext('2d'); ctx.lineWidth=2; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(e.touches[0].clientX-rect.left, e.touches[0].clientY-rect.top); canvasRef.current.isDrawing=true; setHasSigned(true); }} 
            onTouchMove={(e) => { if(!canvasRef.current.isDrawing) return; e.preventDefault(); const rect = canvasRef.current.getBoundingClientRect(); canvasRef.current.getContext('2d').lineTo(e.touches[0].clientX-rect.left, e.touches[0].clientY-rect.top); canvasRef.current.getContext('2d').stroke(); }} 
            onTouchEnd={() => canvasRef.current.isDrawing=false}
            style={{ width: '100%', height: '160px', background: '#fff', borderRadius: '15px', border: '1px solid #ddd', touchAction: 'none' }} />
          <button onClick={() => { canvasRef.current.getContext('2d').clearRect(0,0,600,180); setHasSigned(false); }} className="btn-invert-red-text" style={{ color: '#ef4444', border: 'none', background: 'none', fontWeight: '800', fontSize: '12px', cursor: 'pointer', marginTop: '10px' }}>LIMPAR QUADRO</button>
        </div>
      </div>

      <button onClick={gerarPDF} disabled={enviando} className="btn-finalizar" style={{ position: 'fixed', bottom: '30px', right: '30px', background: '#0ea5e9', color: '#fff', border: `2px solid #0ea5e9`, padding: '20px 45px', borderRadius: '60px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '17px' }}>
        {enviando ? 'PROCESSANDO...' : <><Send size={24} /> FINALIZAR</>}
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800;900&display=swap');
        
        * { transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease; }
        
        body { margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }

        .checklist-card:hover { transform: translateY(-2px) scale(1.01); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }

        /* Botão Finalizar Invertido no Hover */
        .btn-finalizar:hover { background: #fff !important; color: #0ea5e9 !important; transform: scale(1.05); }

        /* Botão Lixeira Invertido no Hover */
        .btn-invert-red:hover { background: #ef4444 !important; color: #fff !important; }

        /* Botão Tema Invertido no Hover */
        .btn-theme-toggle:hover { background: ${theme.text} !important; color: ${theme.card} !important; }

        /* Botão OK no Modal */
        .btn-invert-accent:hover { background: #fff !important; color: #0ea5e9 !important; }

        .error-shake { animation: shake 0.4s ease-in-out; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
        
        .modal-pop { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}