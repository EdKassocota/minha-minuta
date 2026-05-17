import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { numberToWords, dateToExtensoPT, applyGenderConcordance, capitalizeName, validateBI, validateNIF } from '../lib/utils';

export default function GerarDocumento() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [errors, setErrors] = useState({});
  const [minutaTitle, setMinutaTitle] = useState('Gerar documento');

  const mapFieldType = (type) => {
    if (!type) return 'TEXT';
    const t = type.toLowerCase();
    if (t.includes('nome') || t === 'name') return 'NAME';
    if (t.includes('data') || t === 'date') return 'DATE';
    if (t.includes('valor') || t.includes('amount') || t.includes('extenso')) return 'AMOUNT';
    if (t.includes('bi') || t === 'bi') return 'BI';
    if (t.includes('nif') || t === 'nif') return 'NIF';
    if (t.includes('gênero') || t.includes('genero') || t === 'gender') return 'GENDER';
    if (t.includes('email')) return 'EMAIL';
    if (t.includes('phone') || t.includes('telefone')) return 'PHONE';
    return 'TEXT';
  };

  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [minutaContent, setMinutaContent] = useState('');

  const previewRef = useRef(null);

  const fallbackHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; background: white; min-height: 800px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="text-align: center;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h2>
      <p>
        Entre a Empresa XYZ Lda, adiante designada por CONTRATANTE, e 
        <span data-field-id="uuid-nome" class="mm-field-mark" style="background: #EEF2F8; border-bottom: 2px solid #34649A;">[Nome do Cliente]</span>, 
        portador(a) do BI nº <span data-field-id="uuid-bi" class="mm-field-mark" style="background: #EEF2F8; border-bottom: 2px solid #34649A;">[Número do BI]</span>, 
        adiante designado(a) por <span class="gender-target">o contratado</span>.
      </p>
      <p>
        Celebra-se o presente contrato na data de 
        <span data-field-id="uuid-data" class="mm-field-mark" style="background: #EEF2F8; border-bottom: 2px solid #34649A;">[Data do Contrato]</span>.
      </p>
      <p>
        O valor acordado é de <span data-field-id="uuid-valor" class="mm-field-mark" style="background: #EEF2F8; border-bottom: 2px solid #34649A;">[Valor do Contrato]</span>.
      </p>
    </div>
  `;

  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    const fetchMinutaData = async () => {
      try {
        setLoading(true);
        const { data: minuta, error: minutaError } = await supabase
          .from('minutas')
          .select('*')
          .eq('id', id)
          .single();

        if (minutaError || !minuta) {
          throw new Error('Minuta não encontrada no Supabase. Usando fallback.');
        }

        setMinutaTitle(`Gerar documento — ${minuta.name}`);
        const originalContent = minuta.content_html || minuta.content || fallbackHtml;

        const { data: fieldsData, error: fieldsError } = await supabase
          .from('minuta_fields')
          .select('*')
          .eq('minuta_id', id)
          .order('order_index', { ascending: true });

        if (fieldsError || !fieldsData || fieldsData.length === 0) {
          const defaultFields = [
            { id: 'uuid-nome', name: 'Nome do Cliente', type: 'NAME', required: true },
            { id: 'uuid-genero', name: 'Género', type: 'GENDER', required: true },
            { id: 'uuid-bi', name: 'Número do BI', type: 'BI', required: true },
            { id: 'uuid-data', name: 'Data do Contrato', type: 'DATE', required: true },
            { id: 'uuid-valor', name: 'Valor do Contrato', type: 'AMOUNT', currency: 'AOA', required: true }
          ];
          setFields(defaultFields);
          
          const initialForm = {};
          defaultFields.forEach(f => {
            initialForm[f.id] = f.type === 'GENDER' ? 'Masculino' : '';
          });
          setFormData(initialForm);

          const parser = new DOMParser();
          const doc = parser.parseFromString(originalContent, 'text/html');
          const spans = doc.querySelectorAll('span.mm-field-mark, span[data-field-id]');
          spans.forEach(span => {
            const innerText = span.innerText.trim();
            const fieldName = innerText.replace(/[\[\]]/g, '');
            const matchingField = defaultFields.find(f => f.name.toLowerCase() === fieldName.toLowerCase());
            if (matchingField) {
              span.setAttribute('data-field-id', matchingField.id);
            }
          });
          setMinutaContent(doc.body.innerHTML);
        } else {
          const mapped = fieldsData.map(f => ({
            id: f.id,
            name: f.name,
            type: mapFieldType(f.field_type),
            required: f.is_required
          }));
          setFields(mapped);

          const initialForm = {};
          mapped.forEach(f => {
            initialForm[f.id] = f.type === 'GENDER' ? 'Masculino' : '';
          });
          setFormData(initialForm);

          // Mapear os data-field-id do HTML original para os UUIDs reais do Supabase com base no nome do campo
          const parser = new DOMParser();
          const doc = parser.parseFromString(originalContent, 'text/html');
          const spans = doc.querySelectorAll('span.mm-field-mark, span[data-field-id]');
          spans.forEach(span => {
            const innerText = span.innerText.trim();
            const fieldName = innerText.replace(/[\[\]]/g, '');
            const matchingField = mapped.find(f => f.name.toLowerCase() === fieldName.toLowerCase());
            if (matchingField) {
              span.setAttribute('data-field-id', matchingField.id);
            }
          });
          setMinutaContent(doc.body.innerHTML);
        }

      } catch (err) {
        console.warn(err.message);
        const defaultFields = [
          { id: 'uuid-nome', name: 'Nome do Cliente', type: 'NAME', required: true },
          { id: 'uuid-genero', name: 'Género', type: 'GENDER', required: true },
          { id: 'uuid-bi', name: 'Número do BI', type: 'BI', required: true },
          { id: 'uuid-data', name: 'Data do Contrato', type: 'DATE', required: true },
          { id: 'uuid-valor', name: 'Valor do Contrato', type: 'AMOUNT', currency: 'AOA', required: true }
        ];
        setFields(defaultFields);
        const initialForm = {};
        defaultFields.forEach(f => {
          initialForm[f.id] = f.type === 'GENDER' ? 'Masculino' : '';
        });
        setFormData(initialForm);

        const parser = new DOMParser();
        const doc = parser.parseFromString(fallbackHtml, 'text/html');
        const spans = doc.querySelectorAll('span.mm-field-mark, span[data-field-id]');
        spans.forEach(span => {
          const innerText = span.innerText.trim();
          const fieldName = innerText.replace(/[\[\]]/g, '');
          const matchingField = defaultFields.find(f => f.name.toLowerCase() === fieldName.toLowerCase());
          if (matchingField) {
            span.setAttribute('data-field-id', matchingField.id);
          }
        });
        setMinutaContent(doc.body.innerHTML);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMinutaData();
    } else {
      const defaultFields = [
        { id: 'uuid-nome', name: 'Nome do Cliente', type: 'NAME', required: true },
        { id: 'uuid-genero', name: 'Género', type: 'GENDER', required: true },
        { id: 'uuid-bi', name: 'Número do BI', type: 'BI', required: true },
        { id: 'uuid-data', name: 'Data do Contrato', type: 'DATE', required: true },
        { id: 'uuid-valor', name: 'Valor do Contrato', type: 'AMOUNT', currency: 'AOA', required: true }
      ];
      setFields(defaultFields);
      const initialForm = {};
      defaultFields.forEach(f => {
        initialForm[f.id] = f.type === 'GENDER' ? 'Masculino' : '';
      });
      setFormData(initialForm);

      const parser = new DOMParser();
      const doc = parser.parseFromString(fallbackHtml, 'text/html');
      const spans = doc.querySelectorAll('span.mm-field-mark, span[data-field-id]');
      spans.forEach(span => {
        const innerText = span.innerText.trim();
        const fieldName = innerText.replace(/[\[\]]/g, '');
        const matchingField = defaultFields.find(f => f.name.toLowerCase() === fieldName.toLowerCase());
        if (matchingField) {
          span.setAttribute('data-field-id', matchingField.id);
        }
      });
      setMinutaContent(doc.body.innerHTML);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!minutaContent) return;
    
    let updatedHtml = minutaContent;

    const genderField = fields.find(f => f.type === 'GENDER');
    if (genderField && formData[genderField.id]) {
      updatedHtml = applyGenderConcordance(updatedHtml, formData[genderField.id] === 'Masculino' ? 'M' : 'F');
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = updatedHtml;

    fields.forEach(field => {
      const value = formData[field.id];
      let displayValue = value || `[${field.name}]`;

      if (value) {
        if (field.type === 'NAME') {
          displayValue = capitalizeName(value);
        } else if (field.type === 'DATE') {
          displayValue = dateToExtensoPT(value);
        } else if (field.type === 'AMOUNT') {
          const num = parseFloat(value);
          if (!isNaN(num)) {
            displayValue = `${num.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} AOA (${numberToWords(num, 'AOA')})`;
          }
        }
      }

      // Procura primeiro por data-field-id (mapeado para os UUIDs no load)
      const spans = tempDiv.querySelectorAll(`span[data-field-id="${field.id}"]`);
      if (spans.length > 0) {
        spans.forEach(span => {
          span.innerText = displayValue;
          if (value) {
            span.style.background = '#F0FDF4';
            span.style.borderBottom = '2px solid #1A6B3C';
            span.style.color = '#000';
          } else {
            span.style.background = '#EEF2F8';
            span.style.borderBottom = '2px solid #34649A';
            span.style.color = '#34649A';
          }
        });
      } else {
        // Fallback para correspondência por nome ou marcador de texto
        const allSpans = tempDiv.querySelectorAll('span');
        allSpans.forEach(span => {
          if (span.innerText.trim() === `[${field.name}]` || span.getAttribute('data-field-name') === field.name) {
            span.innerText = displayValue;
            if (value) {
              span.style.background = '#F0FDF4';
              span.style.borderBottom = '2px solid #1A6B3C';
              span.style.color = '#000';
            } else {
              span.style.background = '#EEF2F8';
              span.style.borderBottom = '2px solid #34649A';
              span.style.color = '#34649A';
            }
          }
        });
      }
    });

    setPreviewHtml(tempDiv.innerHTML);
  }, [formData, fields, minutaContent]);

  const handleChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleBlur = (id, type, value) => {
    let error = null;
    if (value) {
      if (type === 'BI' && !validateBI(value)) {
        error = 'Formato de BI inválido.';
      } else if (type === 'NIF' && !validateNIF(value)) {
        error = 'Formato de NIF inválido.';
      }
    }
    if (error) {
      setErrors(prev => ({ ...prev, [id]: error }));
    }
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    
    // Check required fields
    let hasError = false;
    let newErrors = {};
    fields.forEach(f => {
      if (f.required && !formData[f.id]) {
        newErrors[f.id] = 'Campo obrigatório.';
        hasError = true;
      }
      if (errors[f.id]) {
        hasError = true;
        newErrors[f.id] = errors[f.id];
      }
    });

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 2000);
  };

  const getCleanHtml = (html) => {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Strip styles from all span fields so they blend perfectly with surrounding text
    const spans = temp.querySelectorAll('span');
    spans.forEach(span => {
      span.style.background = 'transparent';
      span.style.border = 'none';
      span.style.color = 'inherit';
      span.style.padding = '0';
      span.className = '';
    });
    return temp.innerHTML;
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '', 'height=800,width=800');
    printWindow.document.write('<html><head><title>Documento Gerado - PDF</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        padding: 40px;
        margin: 0;
        color: #000;
        background: #fff;
      }
      p {
        margin-bottom: 14px;
        text-align: justify;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px 12px;
        text-align: left;
      }
      @media print {
        body {
          padding: 0;
          margin: 1.5cm;
        }
      }
    `);
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(getCleanHtml(previewHtml));
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadDOCX = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Documento</title><style>body { font-family: Arial, sans-serif; } p { text-align: justify; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; }</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + getCleanHtml(previewHtml) + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'documento_gerado.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  if (isGenerated) {
    return (
      <div className="main-content">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn btn-ghost" onClick={() => navigate('/app')}>← Voltar</button>
            <h1 className="text-display">Documento Gerado</h1>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '48px' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '560px', textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span style={{ color: 'var(--color-success)', fontSize: '24px' }}>✓</span>
            </div>
            
            <h2 className="text-title" style={{ marginBottom: '8px' }}>Documento gerado com sucesso.</h2>
            <p className="text-support" style={{ marginBottom: '32px' }}>O ficheiro está pronto para download e foi guardado no seu histórico.</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
              <button className="btn btn-primary" style={{ padding: '0 32px' }} onClick={handleDownloadPDF}>Descarregar PDF</button>
              <button className="btn btn-secondary" style={{ padding: '0 32px' }} onClick={handleDownloadDOCX}>Descarregar DOCX</button>
            </div>
            <p className="text-micro" style={{ color: 'var(--color-text-secondary)', marginTop: '-16px' }}>
              Este documento inclui marca d'água. Actualize o plano para remover.
            </p>
            
            <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '24px 0' }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn btn-ghost" onClick={() => setIsGenerated(false)}>Gerar outro com esta minuta</button>
              <Link to="/app" className="btn btn-ghost">Voltar ao dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="main-content" style={{ padding: '48px', textAlign: 'center' }}>A carregar minuta...</div>;
  }

  return (
    <div className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
      <div className="page-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Voltar</button>
          <h1 className="text-display">{minutaTitle}</h1>
        </div>
      </div>

      <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* FORMULÁRIO (380px) */}
        <div style={{ width: '380px', flexShrink: 0, borderRight: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', flexGrow: 1, overflowY: 'auto' }}>
            <h3 className="text-subtitle" style={{ marginBottom: '8px' }}>Preencha os campos abaixo</h3>
            
            <form id="generate-form" onSubmit={handleGenerate}>
              {fields.map(field => (
                <div className="form-group" key={field.id} style={{ marginBottom: '20px' }}>
                  <label className="form-label">{field.name} {field.required && '*'}</label>
                  
                  {field.type === 'GENDER' ? (
                    <select 
                      className="form-input"
                      value={formData[field.id]}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      style={{ borderColor: errors[field.id] ? 'var(--color-error)' : undefined }}
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                  ) : (
                    <input 
                      type={field.type === 'AMOUNT' ? 'number' : 'text'}
                      className="form-input" 
                      placeholder={field.type === 'DATE' ? 'dd/mm/aaaa' : ''}
                      value={formData[field.id]}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      onBlur={(e) => handleBlur(field.id, field.type, e.target.value)}
                      style={{ borderColor: errors[field.id] ? 'var(--color-error)' : undefined }}
                    />
                  )}

                  {errors[field.id] && (
                    <div className="text-micro" style={{ color: 'var(--color-error)', marginTop: '4px' }}>
                      {errors[field.id]}
                    </div>
                  )}

                  {!errors[field.id] && formData[field.id] && field.type === 'DATE' && (
                    <div className="text-support" style={{ marginTop: '4px', fontStyle: 'italic', color: '#6E6E6E', fontSize: '12px' }}>
                      {dateToExtensoPT(formData[field.id])}
                    </div>
                  )}

                  {!errors[field.id] && formData[field.id] && field.type === 'AMOUNT' && (
                    <div className="text-support" style={{ marginTop: '4px', fontStyle: 'italic', color: '#6E6E6E', fontSize: '12px' }}>
                      {numberToWords(parseFloat(formData[field.id]), field.currency)}
                    </div>
                  )}

                  {!errors[field.id] && formData[field.id] && field.type === 'GENDER' && (
                    <div className="text-support" style={{ marginTop: '4px', fontStyle: 'italic', color: '#6E6E6E', fontSize: '12px' }}>
                      Concordância automática aplicada
                    </div>
                  )}
                </div>
              ))}
            </form>
          </div>

          <div style={{ padding: '24px', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-global)' }}>
            <button form="generate-form" type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isGenerating}>
              {isGenerating ? 'A gerar...' : 'Gerar Documento'}
            </button>
          </div>
        </div>

        {/* PREVIEW DO DOCUMENTO */}
        <div style={{ flexGrow: 1, backgroundColor: '#F3F4F6', padding: '40px', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
          <div 
            ref={previewRef}
            style={{ width: '100%', maxWidth: '800px', backgroundColor: 'white', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minHeight: '800px' }}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>
    </div>
  );
}
