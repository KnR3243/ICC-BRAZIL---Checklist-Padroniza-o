import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, Circle, Moon, Sun, Trash2, XCircle, Send, GripVertical } from 'lucide-react';
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

const LOCAL_STORAGE_KEY = 'checklist_icc_v8_stable';

export default function App() {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      items: initialData,
      patrimonio: '',
      tecnico: '',
      email: '',
      checkedItems: {},
      darkMode: false
    };
  });

  const { items, patrimonio, tecnico, email, checkedItems, darkMode } = state;
  const [showErrors, setShowErrors] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [draggedItemIdx, setDraggedItemIdx] = useState(null);
  const [modal, setModal] = useState({ show: false, title: '', msg: '', type: 'error' });
  
  const canvasRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateState = (newData) => {
    setState(prev => ({ ...prev, ...newData }));
  };

  const handleDragStart = (e, index) => {
    setDraggedItemIdx(index);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => { e.target.style.opacity = "0.4"; }, 0);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItemIdx === null || draggedItemIdx === index) return;
    const newList = [...items];
    const draggedItem = newList[draggedItemIdx];
    newList.splice(draggedItemIdx, 1);
    newList.splice(index, 0, draggedItem);
    setDraggedItemIdx(index);
    updateState({ items: newList });
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    setDraggedItemIdx(null);
  };

  const handleTecnicoChange = (val) => {
    let newEmail = '';
    if (val === 'Kauan') newEmail = 'kauan.santos@iccbrazil.com.br';
    if (val === 'Odair') newEmail = 'odair.junior@iccbrazil.com.br';
    updateState({ tecnico: val, email: newEmail });
  };

  // FUNÇÃO PARA LIMPAR TUDO APÓS SALVAR
  const resetFormAfterSave = () => {
    updateState({
      patrimonio: '',
      tecnico: '',
      email: '',
      checkedItems: {},
      // Mantemos a ordem dos 'items' conforme o usuário organizou
    });
    setHasSigned(false);
    setShowErrors(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const gerarPDF = async () => {
    const totalChecked = Object.values(checkedItems).filter(Boolean).length;
    if (!patrimonio || !tecnico) {
      setModal({ show: true, title: 'Atenção', msg: 'Preencha Técnico e Patrimônio.', type: 'error' });
      return;
    }
    if (totalChecked < items.length) {
      setShowErrors(true);
      setModal({ show: true, title: 'Incompleto', msg: `Faltam ${items.length - totalChecked} itens.`, type: 'error' });
      return;
    }
    if (!hasSigned) {
      setModal({ show: true, title: 'Assinatura', msg: 'Assine o documento.', type: 'error' });
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
    items.forEach(item => {
      doc.text(`[X] ${item.cat.toUpperCase()}: ${item.task}`, 20, y);
      y += 5.5;
    });

    const sigData = canvasRef.current.toDataURL('image/jpeg', 0.8);
    doc.addImage(sigData, 'JPEG', 80, y + 5, 50, 15);
    const pdfBase64 = doc.output('datauristring');
    doc.save(`Checklist_${patrimonio}.pdf`);

    try {
      await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tecnico, patrimonio, pdfBase64, email })
      });
      setModal({ show: true, title: 'Sucesso!', msg: 'E-mail enviado e PDF salvo! Campos limpos para o próximo.', type: 'success' });
      resetFormAfterSave(); // Limpa tudo após o envio
    } catch (e) {
      setModal({ show: true, title: 'Concluído', msg: 'PDF baixado. Lembre-se de limpar os campos se for iniciar outra máquina.', type: 'success' });
      resetFormAfterSave(); // Limpa mesmo se a API de e-mail falhar (já que o PDF baixou)
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
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(5px)' }}>
          <div className="modal-pop" style={{ backgroundColor: theme.card, padding: '40px', borderRadius: '30px', maxWidth: '450px', width: '90%', textAlign: 'center' }}>
              {modal.type === 'error' ? <XCircle size={70} color="#ef4444" /> : <CheckCircle size={70} color="#22c55e" />}
              <h2 style={{ color: theme.text, fontSize: '24px', marginTop: '20px', fontWeight: '800' }}>{modal.title}</h2>
              <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '30px' }}>{modal.msg}</p>
              <button onClick={() => setModal({ ...modal, show: false })} style={{ padding: '15px 40px', borderRadius: '15px', border: 'none', backgroundColor: theme.accent, color: '#fff', fontWeight: '800', cursor: 'pointer' }}>OK</button>
          </div>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: '750px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', backgroundColor: theme.card, padding: '12px 20px', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', transition: 'background-color 0.3s ease' }}>
          <h1 style={{ color: theme.text, fontSize: '16px', fontWeight: '800', margin: 0 }}>TI Checklist</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => updateState({ darkMode: !darkMode })} style={{ border: 'none', background: theme.border, padding: '8px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease' }}>{darkMode ? <Sun size={18} color="white" /> : <Moon size={18} />}</button>
            <button onClick={() => window.confirm("Limpar tudo?") && (localStorage.removeItem(LOCAL_STORAGE_KEY) || window.location.reload())} style={{ border: 'none', background: '#ef444420', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><Trash2 size={18} color="#ef4444" /></button>
          </div>
        </header>

        <div style={{ backgroundColor: theme.card, padding: '20px', borderRadius: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'background-color 0.3s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px' }}>
            <select value={tecnico} onChange={(e) => handleTecnicoChange(e.target.value)} 
                    style={{ padding: '15px', borderRadius: '12px', border: '2px solid ' + theme.border, backgroundColor: theme.card, color: theme.text, fontSize: '16px', fontWeight: '800', cursor: 'pointer' }}>
              <option value="">TÉCNICO</option>
              <option value="Odair">ODAIR</option>
              <option value="Kauan">KAUAN</option>
            </select>
            <input value={email} readOnly placeholder="E-MAIL" style={{ padding: '15px', borderRadius: '12px', border: '2px solid ' + theme.border, backgroundColor: darkMode ? '#0f172a' : '#f8fafc', color: '#94a3b8', fontSize: '15px', fontWeight: '800' }} />
          </div>
          <input 
            placeholder="PATRIMÔNIO (EX: ICC-001)" 
            value={patrimonio} 
            onChange={(e) => updateState({ patrimonio: e.target.value.toUpperCase() })}
            style={{ padding: '15px', borderRadius: '12px', border: '2px solid ' + theme.border, backgroundColor: theme.card, color: theme.text, fontSize: '18px', fontWeight: '800', width: '100%', boxSizing: 'border-box' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((item, index) => {
            const isChecked = checkedItems[item.id];
            return (
              <div 
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className="checklist-box"
                style={{ 
                  display: 'flex', alignItems: 'center', borderRadius: '15px', overflow: 'hidden',
                  border: '2px solid ' + (isChecked ? '#22c55e' : (showErrors && !isChecked ? '#ef4444' : theme.border)), 
                  backgroundColor: isChecked ? (darkMode ? '#064e3b' : '#f0fff4') : theme.card,
                  transition: 'background-color 0.3s ease, transform 0.2s'
                }}
              >
                <div style={{ padding: '20px 10px 20px 15px', cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                    <GripVertical size={20} color="#94a3b8" />
                </div>
                
                <div onClick={() => updateState({ checkedItems: { ...checkedItems, [item.id]: !isChecked } })} style={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'pointer', padding: '15px 15px 15px 5px' }}>
                  <div style={{ padding: '10px', marginRight: '5px' }}>
                     {isChecked ? <CheckCircle color="#22c55e" size={32} /> : <Circle color={showErrors && !isChecked ? "#ef4444" : "#94a3b8"} size={32} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: isChecked ? (darkMode ? '#fff' : '#166534') : theme.text }}>{item.task}</div>
                    <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase' }}>{item.cat}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '30px', backgroundColor: theme.card, padding: '20px', borderRadius: '20px', border: '2px solid ' + (showErrors && !hasSigned ? '#ef4444' : theme.border), transition: 'background-color 0.3s ease' }}>
          <label style={{ color: theme.text, fontSize: '11px', fontWeight: '900', display: 'block', marginBottom: '10px' }}>ASSINATURA OBRIGATÓRIA</label>
          <canvas ref={canvasRef} width={600} height={180} 
                  onMouseDown={(e) => { setIsDrawing(true); setHasSigned(true); const ctx = canvasRef.current.getContext('2d'); ctx.beginPath(); ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); }}
                  onMouseMove={(e) => { if (!isDrawing) return; const ctx = canvasRef.current.getContext('2d'); ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); ctx.stroke(); }}
                  onMouseUp={() => setIsDrawing(false)}
                  style={{ width: '100%', height: '160px', background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', cursor: 'crosshair', touchAction: 'none' }} />
          <button onClick={() => { canvasRef.current.getContext('2d').clearRect(0,0,600,180); setHasSigned(false); }} style={{ marginTop: '10px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '11px' }}>LIMPAR QUADRO</button>
        </div>
      </div>

      <button onClick={gerarPDF} disabled={enviando} className="btn-save" 
        style={{ 
          position: 'fixed', bottom: '25px', right: '25px', 
          backgroundColor: '#0ea5e9', color: '#fff', border: 'none', 
          padding: '18px 35px', borderRadius: '50px', fontWeight: '900', 
          cursor: 'pointer', boxShadow: '0 10px 30px rgba(14,165,233,0.4)', 
          display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', zIndex: 1000,
          transition: 'all 0.2s ease' 
        }}>
        {enviando ? 'ENVIANDO...' : <><Send size={22} /> SALVAR E ENVIAR</>}
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
        body { margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
        .modal-pop { animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .checklist-box:active { cursor: grabbing; transform: scale(1.02); z-index: 10; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .btn-save:hover { transform: scale(1.05); background-color: #0284c7; }
        .btn-save:active { transform: scale(0.95); }
      `}</style>
    </div>
  );
}