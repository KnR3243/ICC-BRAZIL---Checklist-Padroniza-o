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

const STORAGE_KEY = 'checklist_icc_vFinal_Stable_NoDrag';

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
      setModal({ show: true, title: 'Incompleto', msg: 'Verifique os itens em vermelho e a assinatura.', type: 'error' });
      return;
    }

    setEnviando(true);
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFont('helvetica', 'bold');
    doc.text('CHECKLIST PÓS FORMATAÇÃO - TI ICC', 105, 12, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Técnico: ${tecnico} | Patrimônio: ${patrimonio}`, 20, 20);
    doc.text(`Data: ${new Date().toLocaleString()}`, 20, 25);
    
    let y = 35;
    doc.setFontSize(8);
    items.forEach(i => {
      doc.text(`[X] ${i.cat.toUpperCase()}: ${i.task}`, 20, y);
      y += 5.5;
    });

    // POSICIONAMENTO DA ASSINATURA E DO TEXTO
    const sigData = canvasRef.current.toDataURL('image/png');
    // Adiciona a imagem da assinatura
    doc.addImage(sigData, 'PNG', 80, y + 2, 50, 15);
    // Adiciona a linha de assinatura
    doc.line(75, y + 18, 135, y + 18); 
    // Adiciona o rótulo centralizado embaixo
    doc.setFontSize(9);
    doc.text('Assinatura do Técnico', 105, y + 23, { align: 'center' });

    const pdfBase64 = doc.output('datauristring');

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tecnico, patrimonio, pdfBase64, email })
      });
      if (!res.ok) throw new Error();
      setModal({ show: true, title: 'Sucesso!', msg: 'E-mail enviado e PDF salvo!', type: 'success' });
      
      updateState({ patrimonio: '', checkedItems: {}, tecnico: '', email: '' });
      setHasSigned(false);
      setShowErrors(false);
      canvasRef.current.getContext('2d').clearRect(0,0,600,180);
      doc.save(`Checklist_${patrimonio}.pdf`);
    } catch (e) {
      setModal({ show: true, title: 'Aviso', msg: 'PDF baixado. Envio de e-mail falhou.', type: 'error' });
      doc.save(`Checklist_${patrimonio}.pdf`);
    }
    setEnviando(false);
  };

  const theme = { 
    bg: darkMode ? '#0f172a' : '#f1f5f9', 
    card: darkMode ? '#1e293b' : '#ffffff', 
    text: darkMode ? '#f8fafc' : '#1e293b', 
    border: darkMode ? '#334155' : '#cbd5e1', 
    accent: '#0ea5e9' 
  };

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
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', background: theme.card, padding: '10px 20px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: theme.text }}>Checklist: Pós-Formatação</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => updateState({ darkMode: !darkMode })} style={{ background: theme.border, border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: '0.3s' }}>{darkMode ? <Sun size={18} color="white" /> : <Moon size={18} />}</button>
            <button onClick={() => window.confirm("Limpar tudo?") && (localStorage.clear() || window.location.reload())} style={{ background: '#ef444420', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}><Trash2 size={18} color="#ef4444" /></button>
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
                style={{ 
                  display: 'flex', alignItems: 'center', borderRadius: '20px', 
                  border: `2px solid ${isChecked ? '#22c55e' : (isError ? '#ef4444' : theme.border)}`, 
                  background: isChecked ? (darkMode ? '#064e3b' : '#f0fff4') : theme.card, 
                  transition: '0.2s'
                }}>
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
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}