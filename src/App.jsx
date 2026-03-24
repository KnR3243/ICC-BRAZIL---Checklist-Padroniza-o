import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, Circle, Save, Moon, Sun, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

const checklistData = [
  { id: 2, task: "Verificar atualizações", cat: "Sistema" },
  { id: 3, task: "Nome da máquina (Patrimônio)", cat: "Sistema" },
  { id: 4, task: "Usuário local User", cat: "Acessos" },
  { id: 5, task: "Máquina no domínio (iccnew.local)", cat: "Acessos" },
  { id: 6, task: "Usuário do AD com admin", cat: "Acessos" },
  { id: 7, task: "Plano de energia (Inic. Rápida OFF)", cat: "Otimização" },
  { id: 8, task: "Desempenho (Perfil Desempenho)", cat: "Otimização" },
  { id: 10, task: "Privacidade e Segurança", cat: "Otimização" },
  { id: 11, task: "Personalizar (Efeitos Visuais OFF)", cat: "Otimização" },
  { id: 12, task: "Apps inicializados com sistema", cat: "Otimização" },
  { id: 13, task: "Serviços não Microsoft", cat: "Otimização" },
  { id: 15, task: "Office (Licença vinculada)", cat: "Apps" },
  { id: 16, task: "Google Drive", cat: "Apps" },
  { id: 17, task: "Google Chat", cat: "Apps" },
  { id: 18, task: "Google Meet (Configurações)", cat: "Apps" },
  { id: 19, task: "Teams (Configurações)", cat: "Apps" },
  { id: 20, task: "Google Chrome", cat: "Apps" },
  { id: 21, task: "Adblock (Ativar)", cat: "Apps" },
  { id: 22, task: "TeamViewer (ID e Senha)", cat: "Suporte" },
  { id: 23, task: "OpenVPN", cat: "Rede" },
  { id: 24, task: "Antivírus (bitDefender)", cat: "Segurança" },
  { id: 25, task: "Adobe Acrobat (PDF)", cat: "Apps" },
  { id: 26, task: "Zebra3", cat: "Apps" },
  { id: 27, task: "Remover Bloatwares", cat: "Sistema" },
  { id: 28, task: "Ativação conta Google", cat: "Acessos" },
  { id: 29, task: "Hardware (Câmera/Áudio/Imp)", cat: "Hardware" },
  { id: 30, task: "Acesso a vm06", cat: "Rede" },
  { id: 31, task: "Ping - 192.168.10.8 (AD)", cat: "Rede" },
  { id: 32, task: "Ping - 192.168.10.20 (Srv)", cat: "Rede" },
  { id: 33, task: "Ping - 192.168.10.10 (File)", cat: "Rede" },
];

export default function App() {
  const [patrimonio, setPatrimonio] = useState("");
  const [tecnico, setTecnico] = useState("");
  const [email, setEmail] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const theme = {
    bg: darkMode ? '#0f172a' : '#f1f5f9',
    card: darkMode ? '#1e293b' : '#ffffff',
    text: darkMode ? '#f8fafc' : '#1e293b',
    border: darkMode ? '#334155' : '#e2e8f0',
    itemBg: darkMode ? '#1e293b' : '#f8fafc'
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000000';
    }
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath(); 
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(pos.x, pos.y); 
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const gerarPDF = () => {
    if (!patrimonio || !tecnico) return alert("Preencha os campos!");
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("CHECKLIST PÓS FORMATAÇÃO - TI", 105, 12, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Técnico: ${tecnico} | Email: ${email}`, 20, 20);
    doc.text(`Patrimônio: ${patrimonio} | Data: ${new Date().toLocaleString()}`, 20, 25);
    doc.line(20, 28, 190, 28);

    let y = 35;
    doc.setFontSize(9.5); // Itens maiores no PDF
    checklistData.forEach((item) => {
      const check = checkedItems[item.id] ? "[X]" : "[ ]";
      doc.setFont("helvetica", "bold");
      doc.text(`${item.cat}:`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${check} ${item.task}`, 42, y);
      y += 6.2; // Espaçamento maior entre as linhas
    });

    const canvas = canvasRef.current;
    const whiteCanvas = document.createElement('canvas');
    whiteCanvas.width = canvas.width; whiteCanvas.height = canvas.height;
    const ctx = whiteCanvas.getContext('2d');
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, whiteCanvas.width, whiteCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    const sigData = whiteCanvas.toDataURL('image/jpeg', 0.8);
    doc.addImage(sigData, 'JPEG', 80, y + 2, 50, 15);
    doc.line(75, y + 18, 135, y + 18);
    doc.setFontSize(8);
    doc.text("Assinatura do Técnico", 105, y + 22, { align: "center" });

    doc.save(`Checklist_${patrimonio}.pdf`);
  };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', display: 'flex', justifyContent: 'center', transition: '0.3s', padding: '15px' }}>
      <div style={{ width: '100%', maxWidth: '750px', backgroundColor: theme.card, borderRadius: '25px', padding: '30px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', height: 'fit-content' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: theme.text, fontSize: '30px', fontWeight: '800', margin: 0 }}>TI Checklist</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setDarkMode(!darkMode)} style={{ border: 'none', background: theme.border, padding: '12px', borderRadius: '15px', cursor: 'pointer' }}>
              {darkMode ? <Sun size={22} color="white" /> : <Moon size={22} />}
            </button>
            <button onClick={() => window.location.reload()} style={{ border: 'none', background: theme.border, padding: '12px', borderRadius: '15px', cursor: 'pointer' }}>
              <Trash2 size={22} color="#ef4444" />
            </button>
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <select 
              value={tecnico} 
              onChange={(e) => { 
                setTecnico(e.target.value); 
                setEmail(e.target.value === "Kauan" ? "kauan.santos@iccbrazil.com.br" : "odair.junior@iccbrazil.com.br"); 
              }} 
              style={{ padding: '15px', borderRadius: '15px', border: `2px solid ${theme.border}`, backgroundColor: theme.card, color: theme.text, fontWeight: 'bold' }}
            >
              <option value="">Selecionar Técnico</option>
              <option value="Odair">Odair</option>
              <option value="Kauan">Kauan</option>
            </select>
            <input value={email} readOnly style={{ padding: '15px', borderRadius: '15px', border: `2px solid ${theme.border}`, backgroundColor: theme.border, color: '#94a3b8', fontWeight: 'bold' }} />
          </div>
          <input 
            placeholder="Patrimônio da Máquina" 
            value={patrimonio} 
            onChange={(e) => setPatrimonio(e.target.value)} 
            style={{ padding: '15px', borderRadius: '15px', border: `2px solid ${theme.border}`, backgroundColor: theme.card, color: theme.text, fontSize: '16px', fontWeight: 'bold', width: '100%', boxSizing: 'border-box' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {checklistData.map(item => {
            const isChecked = checkedItems[item.id];
            const borderStyle = `2px solid ${isChecked ? '#22c55e' : theme.border}`;
            const bgStyle = isChecked ? (darkMode ? '#064e3b' : '#f0fff4') : theme.itemBg;
            const textColor = isChecked ? (darkMode ? '#fff' : '#166534') : theme.text;

            return (
              <div 
                key={item.id} 
                onClick={() => setCheckedItems(p => ({...p, [item.id]: !p[item.id]}))} 
                style={{ display: 'flex', alignItems: 'center', padding: '20px', borderRadius: '18px', border: borderStyle, cursor: 'pointer', backgroundColor: bgStyle, transition: '0.2s' }}
              >
                {isChecked ? <CheckCircle color="#22c55e" size={28} /> : <Circle color="#94a3b8" size={28} />}
                <div style={{ marginLeft: '18px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: textColor }}>{item.task}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase' }}>{item.cat}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '40px', borderTop: `2px solid ${theme.border}`, paddingTop: '30px' }}>
          <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '900', display: 'block', marginBottom: '15px' }}>ASSINATURA DIGITAL</label>
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={180} 
            onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing}
            onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
            style={{ width: '100%', height: '180px', background: '#fff', borderRadius: '20px', border: '2px solid #cbd5e1', cursor: 'crosshair', touchAction: 'none' }} 
          />
          <button 
            onClick={() => { const ctx = canvasRef.current.getContext('2d'); ctx.clearRect(0,0,600,180); }} 
            style={{ marginTop: '15px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '900' }}
          >
            LIMPAR QUADRO
          </button>
        </div>
      </div>

      <button 
        onClick={gerarPDF} 
        style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#0ea5e9', color: '#fff', border: 'none', padding: '20px 40px', borderRadius: '100px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 20px 40px rgba(14,165,233,0.4)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', zIndex: 1000 }}
      >
        <Save size={26} /> SALVAR PDF
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
        body { margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>
    </div>
  );
}