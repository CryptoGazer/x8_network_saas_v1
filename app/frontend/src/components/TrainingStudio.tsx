import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Download, Trash2 } from 'lucide-react';

interface TrainingStudioProps {
  language: string;
  onNavigate?: (window: string) => void;
}

interface Dialog {
  id: number;
  dialogText: string;
  dialogQuality: 'good' | 'bad';
  baseModel: string;
  sheetId: string;
  activated: boolean;
  activatedAt: string;
}

interface Instruction {
  id: number;
  instructionText: string;
  status: 'consider';
  activated: boolean;
  activatedAt: string;
}

interface Company {
  id: string;
  name: string;
  status: string;
  type: string;
}

const demoDialogs: Dialog[] = [];

const demoInstructions: Instruction[] = [];

export const TrainingStudio: React.FC<TrainingStudioProps> = ({ language, onNavigate }) => {
  const [activeSection, setActiveSection] = useState<'dialogs' | 'instructions'>('dialogs');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [dialogs, setDialogs] = useState<Dialog[]>(demoDialogs);
  const [instructions, setInstructions] = useState<Instruction[]>(demoInstructions);

  const demoCompanies: Company[] = [
    { id: 'PROD001', name: 'Product Hotel Canarian', status: 'Active', type: 'Product' },
    { id: 'SERV001', name: 'Service AI Agent', status: 'Active', type: 'Service' }
  ];

  useEffect(() => {
    const storedCompanies = localStorage.getItem('companies');
    if (storedCompanies) {
      const companiesData = JSON.parse(storedCompanies);
      const companyList = companiesData.map((c: any) => ({
        id: c.companyId || c.id,
        name: c.name,
        status: c.status || 'Active',
        type: c.productType || 'Service'
      }));
      setCompanies([...demoCompanies, ...companyList]);
    } else {
      setCompanies(demoCompanies);
    }
  }, []);

  const addDialog = () => {
    const newDialog: Dialog = {
      id: dialogs.length + 1,
      dialogText: '',
      dialogQuality: 'good',
      baseModel: 'gpt-4o-mini-2024-07-18',
      sheetId: '',
      activated: false,
      activatedAt: ''
    };
    setDialogs([...dialogs, newDialog]);
  };

  const updateDialog = (id: number, field: keyof Dialog, value: any) => {
    setDialogs(dialogs.map(d => {
      if (d.id === id) {
        const updated = { ...d, [field]: value };
        if (field === 'activated' && value === true && !d.activatedAt) {
          updated.activatedAt = new Date().toISOString();
        }
        return updated;
      }
      return d;
    }));
  };

  const deleteDialog = (id: number) => {
    setDialogs(dialogs.filter(d => d.id !== id));
  };

  const addInstruction = () => {
    const newInstruction: Instruction = {
      id: instructions.length + 1,
      instructionText: '',
      status: 'consider',
      activated: false,
      activatedAt: ''
    };
    setInstructions([...instructions, newInstruction]);
  };

  const updateInstruction = (id: number, field: keyof Instruction, value: any) => {
    setInstructions(instructions.map(i => {
      if (i.id === id) {
        const updated = { ...i, [field]: value };
        if (field === 'activated' && value === true && !i.activatedAt) {
          updated.activatedAt = new Date().toISOString();
        }
        return updated;
      }
      return i;
    }));
  };

  const deleteInstruction = (id: number) => {
    setInstructions(instructions.filter(i => i.id !== id));
  };

  const handleExportCSV = () => {
    const csv = [
      'Training Studio Export',
      `Company: ${selectedCompany || 'All'}`,
      '',
      'DIALOGS',
      'id,dialog_text,dialog_quality,base_model,sheet_id,activated,activated_at',
      ...dialogs.map(d => `${d.id},"${d.dialogText.replace(/"/g, '""')}",${d.dialogQuality},${d.baseModel},${d.sheetId},${d.activated},${d.activatedAt}`),
      '',
      'INSTRUCTIONS',
      'id,instruction_text,status,activated,activated_at',
      ...instructions.map(i => `${i.id},"${i.instructionText.replace(/"/g, '""')}",${i.status},${i.activated},${i.activatedAt}`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training_studio_${selectedCompany || 'all'}_${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1800px', margin: '0 auto' }}>
      <button
        onClick={() => onNavigate && onNavigate('WINDOW_0')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          marginBottom: '16px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--glass-border)',
          borderRadius: '8px',
          color: 'var(--text-secondary)',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all var(--transition-fast)'
        }}
      >
        <ArrowLeft size={16} />
        {language === 'EN' ? 'Back' : 'Atrás'}
      </button>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {language === 'EN' ? 'Training Studio' : 'Estudio de Entrenamiento'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {language === 'EN'
            ? 'Fine-tuning the language model using dialogs and instructions'
            : 'Ajuste fino del modelo de lenguaje usando diálogos e instrucciones'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveSection('dialogs')}
          style={{
            padding: '12px 24px',
            background: activeSection === 'dialogs' ? 'rgba(0, 212, 255, 0.15)' : 'var(--bg-secondary)',
            border: `1px solid ${activeSection === 'dialogs' ? 'var(--brand-cyan)' : 'var(--glass-border)'}`,
            borderRadius: '8px',
            color: activeSection === 'dialogs' ? 'var(--brand-cyan)' : 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {language === 'EN' ? 'Dialogs' : 'Diálogos'}
        </button>
        <button
          onClick={() => setActiveSection('instructions')}
          style={{
            padding: '12px 24px',
            background: activeSection === 'instructions' ? 'rgba(0, 212, 255, 0.15)' : 'var(--bg-secondary)',
            border: `1px solid ${activeSection === 'instructions' ? 'var(--brand-cyan)' : 'var(--glass-border)'}`,
            borderRadius: '8px',
            color: activeSection === 'instructions' ? 'var(--brand-cyan)' : 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {language === 'EN' ? 'Instructions' : 'Instrucciones'}
        </button>
      </div>

      <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
              {language === 'EN' ? 'SELECT COMPANY (REQUIRED)' : 'SELECCIONAR EMPRESA (REQUERIDO)'}
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <option value="">{language === 'EN' ? 'Select a company...' : 'Selecciona una empresa...'}</option>
              {companies.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name} — {c.id} ({c.type}, {c.status})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, var(--brand-cyan), var(--brand-teal))',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Download size={18} />
            {language === 'EN' ? 'Export CSV' : 'Exportar CSV'}
          </button>
        </div>

        {!selectedCompany && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(255, 209, 102, 0.1)',
            border: '1px solid rgba(255, 209, 102, 0.3)',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'var(--accent-yellow)'
          }}>
            {language === 'EN'
              ? 'Please select a company to link training data. Example rows shown below.'
              : 'Por favor selecciona una empresa para vincular datos de entrenamiento. Filas de ejemplo mostradas abajo.'}
          </div>
        )}
      </div>

      {activeSection === 'dialogs' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {language === 'EN' ? 'Training Dialogs' : 'Diálogos de Entrenamiento'}
            </h3>
            <button
              onClick={addDialog}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'transparent',
                border: '1px solid var(--brand-cyan)',
                borderRadius: '8px',
                color: 'var(--brand-cyan)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              {language === 'EN' ? 'Add Dialog' : 'Agregar Diálogo'}
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, width: '50px' }}>ID</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, minWidth: '300px' }}>
                    {language === 'EN' ? 'DIALOG TEXT' : 'TEXTO DEL DIÁLOGO'}
                  </th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, width: '120px' }}>
                    {language === 'EN' ? 'QUALITY' : 'CALIDAD'}
                  </th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, width: '200px' }}>
                    {language === 'EN' ? 'BASE MODEL' : 'MODELO BASE'}
                  </th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, width: '120px' }}>SHEET ID</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, width: '100px' }}>
                    {language === 'EN' ? 'ACTIVATED' : 'ACTIVADO'}
                  </th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, width: '180px' }}>
                    {language === 'EN' ? 'ACTIVATED AT' : 'ACTIVADO EN'}
                  </th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {dialogs.map((dialog) => (
                  <tr key={dialog.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '13px' }}>{dialog.id}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <textarea
                        value={dialog.dialogText}
                        onChange={(e) => updateDialog(dialog.id, 'dialogText', e.target.value)}
                        placeholder={language === 'EN' ? 'Paste dialog text from Chat Logs (quick copy)' : 'Pegar texto del diálogo desde Registros de Chat'}
                        style={{
                          width: '100%',
                          minHeight: '80px',
                          padding: '8px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          fontFamily: 'inherit',
                          resize: 'vertical'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <select
                        value={dialog.dialogQuality}
                        onChange={(e) => updateDialog(dialog.id, 'dialogQuality', e.target.value as 'good' | 'bad')}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="good">{language === 'EN' ? 'good' : 'bueno'}</option>
                        <option value="bad">{language === 'EN' ? 'bad' : 'malo'}</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <select
                        value={dialog.baseModel}
                        onChange={(e) => updateDialog(dialog.id, 'baseModel', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="gpt-4o-mini-2024-07-18">gpt-4o-mini-2024-07-18</option>
                        <option value="gpt-4o-mini-2024">gpt-4o-mini-2024</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <input
                        type="text"
                        value={dialog.sheetId}
                        onChange={(e) => updateDialog(dialog.id, 'sheetId', e.target.value)}
                        placeholder="Sheet ID"
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '13px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={dialog.activated}
                        onChange={(e) => updateDialog(dialog.id, 'activated', e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      {dialog.activatedAt ? new Date(dialog.activatedAt).toLocaleString() : '—'}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <button
                        onClick={() => deleteDialog(dialog.id)}
                        style={{
                          padding: '6px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--danger-red)',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'instructions' && (
        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {language === 'EN' ? 'Training Instructions' : 'Instrucciones de Entrenamiento'}
            </h3>
            <button
              onClick={addInstruction}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'transparent',
                border: '1px solid var(--brand-cyan)',
                borderRadius: '8px',
                color: 'var(--brand-cyan)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              {language === 'EN' ? 'Add Instruction' : 'Agregar Instrucción'}
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, width: '50px' }}>ID</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, minWidth: '400px' }}>
                    {language === 'EN' ? 'INSTRUCTION TEXT' : 'TEXTO DE INSTRUCCIÓN'}
                  </th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, width: '120px' }}>STATUS</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, width: '100px' }}>
                    {language === 'EN' ? 'ACTIVATED' : 'ACTIVADO'}
                  </th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, width: '180px' }}>
                    {language === 'EN' ? 'ACTIVATED AT' : 'ACTIVADO EN'}
                  </th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {instructions.map((instruction) => (
                  <tr key={instruction.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '13px' }}>{instruction.id}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <textarea
                        value={instruction.instructionText}
                        onChange={(e) => updateInstruction(instruction.id, 'instructionText', e.target.value)}
                        placeholder={language === 'EN' ? 'Insert instruction: greeting, closing, behavior, logic' : 'Insertar instrucción: saludo, cierre, comportamiento, lógica'}
                        style={{
                          width: '100%',
                          minHeight: '60px',
                          padding: '8px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          fontFamily: 'inherit',
                          resize: 'vertical'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: 'rgba(0, 212, 255, 0.15)',
                        color: 'var(--brand-cyan)'
                      }}>
                        consider
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={instruction.activated}
                        onChange={(e) => updateInstruction(instruction.id, 'activated', e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      {instruction.activatedAt ? new Date(instruction.activatedAt).toLocaleString() : '—'}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <button
                        onClick={() => deleteInstruction(instruction.id)}
                        style={{
                          padding: '6px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--danger-red)',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
