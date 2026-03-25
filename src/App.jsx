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

const STORAGE_KEY = 'checklist_icc_vFinal_Stable';
// Use a crase ` no início e no fim
const LOGO_DATA = `data:image/png;base64,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`;

// STRING BASE64 LIMPA E TESTADA

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

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);

  const updateState = (val) => setState(p => ({ ...p, ...val }));

  const handleTecnicoChange = (val) => {
    let mail = '';
    if (val === 'Kauan') mail = 'kauan.santos@iccbrazil.com.br';
    else if (val === 'Odair') mail = 'odair.junior@iccbrazil.com.br';
    updateState({ tecnico: val, email: mail });
  };

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startSign = (e) => {
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#000';
    ctx.beginPath(); ctx.moveTo(x, y);
    canvasRef.current.isDrawing = true;
    setHasSigned(true);
  };

  const drawSign = (e) => {
    if (!canvasRef.current.isDrawing) return;
    if (e.touches) e.preventDefault(); 
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y); ctx.stroke();
  };

  const gerarPDF = async () => {
    const total = Object.values(checkedItems).filter(Boolean).length;
    if (!patrimonio || !tecnico || !hasSigned || total < items.length) {
      setShowErrors(true);
      setModal({ show: true, title: 'Incompleto', msg: 'Assine e marque todos os 33 itens.', type: 'error' });
      return;
    }

    setEnviando(true);
    const doc = new jsPDF('p', 'mm', 'a4');

    try {
      // 1. TEXTOS DO PDF (Fazemos primeiro para garantir que apareçam)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('CHECKLIST PÓS FORMATAÇÃO - TI ICC', 105, 25, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Técnico: ${tecnico} | Patrimônio: ${patrimonio}`, 20, 32);
      doc.text(`Data: ${new Date().toLocaleString()}`, 20, 37);
      
      let y = 45;
      doc.setFontSize(8);
      items.forEach(i => {
        doc.text(`[X] ${i.cat.toUpperCase()}: ${i.task}`, 20, y);
        y += 5.5;
      });

      // 2. LOGO NO PDF
      try {
        doc.addImage(LOGO_DATA, 'PNG', 85, 5, 40, 15);
      } catch (err) { console.error("Logo falhou no PDF"); }

      // 3. ASSINATURA NO PDF
      const sigData = canvasRef.current.toDataURL('image/png');
      doc.addImage(sigData, 'PNG', 80, y + 2, 50, 15);
      doc.line(75, y + 18, 135, y + 18); 
      doc.setFontSize(9);
      doc.text('Assinatura do Técnico', 105, y + 23, { align: 'center' });

      const pdfBase64 = doc.output('datauristring');

      // 4. TENTAR ENVIO (FETCH)
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tecnico, patrimonio, pdfBase64 })
      });

      if (res.ok) {
        setModal({ show: true, title: 'Sucesso!', msg: 'E-mail enviado e PDF salvo!', type: 'success' });
      } else {
        throw new Error();
      }

    } catch (e) {
      // AMBIENTE LOCAL OU ERRO SMTP: BAIXA O PDF E RESETAR
      setModal({ show: true, title: 'Checklist Salvo', msg: 'PDF baixado. O e-mail automático requer servidor online.', type: 'success' });
    } finally {
      // SEMPRE BAIXA O PDF E FAZ O RESET
      doc.save(`Checklist_${patrimonio}.pdf`);
      updateState({ patrimonio: '', checkedItems: {}, tecnico: '', email: '' });
      setHasSigned(false);
      setShowErrors(false);
      if(canvasRef.current) canvasRef.current.getContext('2d').clearRect(0,0,600,180);
      setEnviando(false);
    }
  };

  const theme = { bg: darkMode ? '#0f172a' : '#f1f5f9', card: darkMode ? '#1e293b' : '#ffffff', text: darkMode ? '#f8fafc' : '#1e293b', border: darkMode ? '#334155' : '#cbd5e1', accent: '#0ea5e9' };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '15px', paddingBottom: '140px', display: 'flex', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'background-color 0.3s ease' }}>
      
      {modal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="modal-pop" style={{ background: theme.card, padding: '40px', borderRadius: '30px', textAlign: 'center', maxWidth: '450px' }}>
            {modal.type === 'error' ? <XCircle size={70} color="#ef4444" /> : <CheckCircle size={70} color="#22c55e" />}
            <h2 style={{ fontWeight: '800', marginTop: '20px', color: theme.text }}>{modal.title}</h2>
            <p style={{ color: '#94a3b8' }}>{modal.msg}</p>
            <button onClick={() => setModal({ ...modal, show: false })} style={{ background: theme.accent, color: '#fff', border: 'none', padding: '15px 40px', borderRadius: '15px', fontWeight: '800', cursor: 'pointer', marginTop: '20px' }}>OK</button>
          </div>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: '750px' }}>
        
        {/* LOGO NO TOPO - CORREÇÃO DE VARIAVEL */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src={LOGO_DATA} alt="ICC Logo" style={{ maxWidth: '140px', height: 'auto' }} />
        </div>

        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', background: theme.card, padding: '10px 20px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: theme.text }}>TI Checklist</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => updateState({ darkMode: !darkMode })} style={{ background: theme.border, border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: '0.3s' }}>{darkMode ? <Sun size={18} color="white" /> : <Moon size={18} />}</button>
            <button onClick={() => window.confirm("Limpar?") && (localStorage.clear() || window.location.reload())} style={{ background: '#ef444420', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}><Trash2 size={18} color="#ef4444" /></button>
          </div>
        </header>

        <div style={{ background: theme.card, padding: '20px', borderRadius: '25px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: '0.3s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '12px' }}>
            <select value={tecnico} onChange={(e) => handleTecnicoChange(e.target.value)} 
                    style={{ padding: '15px', borderRadius: '15px', border: '2px solid ' + (showErrors && !tecnico ? '#ef4444' : theme.border), background: theme.card, color: theme.text, fontWeight: '800', fontSize: '16px' }}>
              <option value="">TÉCNICO</option><option value="Odair">ODAIR</option><option value="Kauan">KAUAN</option>
            </select>
            <input value={email} readOnly placeholder="E-MAIL" style={{ padding: '15px', borderRadius: '15px', border: '2px solid ' + theme.border, background: darkMode ? '#0f172a' : '#f8fafc', color: '#94a3b8', fontSize: '15px', fontWeight: '800' }} />
          </div>
          <input placeholder="PATRIMÔNIO (EX: ICC-001)" value={patrimonio} onChange={(e) => updateState({ patrimonio: e.target.value.toUpperCase() })} 
                 style={{ padding: '15px', borderRadius: '15px', border: '2px solid ' + (showErrors && !patrimonio ? '#ef4444' : theme.border), background: theme.card, color: theme.text, fontSize: '18px', fontWeight: '800', width: '100%', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((item) => {
            const isChecked = checkedItems[item.id];
            const isError = showErrors && !isChecked;
            return (
              <div key={item.id} className={`checklist-box ${isError ? 'error-shake' : ''}`}
                style={{ display: 'flex', alignItems: 'center', borderRadius: '20px', border: `2px solid ${isChecked ? '#22c55e' : (isError ? '#ef4444' : theme.border)}`, background: isChecked ? (darkMode ? '#064e3b' : '#f0fff4') : theme.card, transition: '0.2s' }}>
                <div onClick={() => updateState({ checkedItems: { ...checkedItems, [item.id]: !isChecked } })} style={{ display: 'flex', alignItems: 'center', flex: 1, cursor: 'pointer', padding: '20px' }}>
                  <div style={{ paddingRight: '20px' }}>{isChecked ? <CheckCircle color="#22c55e" size={34} /> : <Circle color={isError ? "#ef4444" : "#94a3b8"} size={34} />}</div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: isChecked ? (darkMode ? '#fff' : '#166534') : theme.text }}>{item.task}</div>
                    <div style={{ fontSize: '10px', fontWeight: '900', opacity: 0.5, textTransform: 'uppercase', color: theme.text }}>{item.cat}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '40px', background: '#fff', padding: '25px', borderRadius: '30px', border: '2px solid ' + (showErrors && !hasSigned ? '#ef4444' : theme.border) }}>
          <p style={{ color: '#000', fontSize: '11px', fontWeight: '900', marginBottom: '10px' }}>ASSINATURA OBRIGATÓRIA</p>
          <canvas ref={canvasRef} width={600} height={180} onMouseDown={startSign} onMouseMove={drawSign} onMouseUp={() => canvasRef.current.isDrawing = false} onTouchStart={startSign} onTouchMove={drawSign} onTouchEnd={() => canvasRef.current.isDrawing = false}
            style={{ width: '100%', height: '170px', background: '#fff', borderRadius: '15px', border: '1px solid #ddd', touchAction: 'none' }} />
          <button onClick={() => { canvasRef.current.getContext('2d').clearRect(0,0,600,180); setHasSigned(false); }} style={{ color: '#ef4444', border: 'none', background: 'none', fontWeight: '800', fontSize: '12px', cursor: 'pointer', marginTop: '10px' }}>LIMPAR QUADRO</button>
        </div>
      </div>

      <button onClick={gerarPDF} disabled={enviando} className="btn-save" style={{ position: 'fixed', bottom: '30px', right: '30px', background: '#0ea5e9', color: '#fff', border: 'none', padding: '20px 45px', borderRadius: '60px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 30px rgba(14,165,233,0.4)', transition: 'all 0.2s ease', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '17px' }}>
        {enviando ? 'ENVIANDO...' : <><Send size={24} /> FINALIZAR</>}
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
        body { margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
        .modal-pop { animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .btn-save:hover { transform: scale(1.05); background-color: #0284c7; }
        .btn-save:active { transform: scale(0.95); }
        .error-shake { animation: shake 0.4s ease-in-out; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
      `}</style>
    </div>
  );
}