import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mammoth from 'mammoth';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Edit3, FileUp } from 'lucide-react';

export default function NovaMinuta() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [content, setContent] = useState('');
  const [fields, setFields] = useState([]);
  const [images, setImages] = useState([]);
  const [sourceType, setSourceType] = useState('editor');
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [minutaName, setMinutaName] = useState('');
  
  // Tooltip & Selection state
  const [selection, setSelection] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);
  const [savedRange, setSavedRange] = useState(null);
  const [fieldForm, setFieldForm] = useState({ name: '', type: 'TEXT', required: true });
  
  // Occurrences Modal state
  const [showOccurrencesModal, setShowOccurrencesModal] = useState(false);
  const [pendingField, setPendingField] = useState(null);
  const [occurrencesCount, setOccurrencesCount] = useState(0);

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync editor innerHTML to content state
  const handleEditorInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  // Fetch folders from Supabase on mount
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const { data, error } = await supabase.from('folders').select('*');
        if (data && !error) {
          setFolders(data);
        }
      } catch (err) {
        console.error('Erro ao buscar pastas:', err);
      }
    };
    fetchFolders();
  }, []);

  // CORRECÇÃO 5 — Evitar re-render que destrói a selecção
  useEffect(() => {
    if (editorRef.current && content && editorRef.current.innerHTML !== content) {
      // Só actualizar o DOM se o conteúdo vier de fora (upload, template)
      // Nunca actualizar durante edição activa
      if (!editorRef.current.contains(document.activeElement)) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [content]);

  // CORRECÇÃO 1 — Upload DOCX com imagens
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!minutaName) {
      setMinutaName(file.name.replace(/\.[^/.]+$/, ""));
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;
      try {
        const result = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            convertImage: mammoth.images.imgElement(image => {
              return image.read("base64").then(imageData => {
                const id = 'img-' + Math.random().toString(36).substr(2, 9);
                return {
                  src: `data:${image.contentType};base64,${imageData}`,
                  'data-image-id': id,
                  style: 'max-width: 100%; height: auto; cursor: pointer;',
                  'data-placement': 'inline'
                };
              });
            })
          }
        );
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(result.value, 'text/html');
        const imgElements = doc.querySelectorAll('img[data-image-id]');
        const extractedImages = Array.from(imgElements).map(img => ({
          id: img.getAttribute('data-image-id'),
          src: img.getAttribute('src'),
          widthPx: img.naturalWidth || 200,
          heightPx: img.naturalHeight || 100,
          placement: { type: 'inline' },
          isLogo: false,
          originalName: 'imagem'
        }));
        setImages(extractedImages);
        setContent(result.value);
        setStep(3);
      } catch (err) {
        alert('Erro ao extrair conteúdo do DOCX: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // CORRECÇÃO 4 — Tooltip com posicionamento relativo ao editor
  const handleSelection = () => {
    if (step !== 3) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
    const text = sel.toString().trim();
    if (!text) return;

    const range = sel.getRangeAt(0);
    setSavedRange(range.cloneRange());

    // Posição relativa ao contentor do editor (pai com position:relative)
    const containerEl = editorRef.current?.closest('[data-editor-container]');
    const containerRect = containerEl
      ? containerEl.getBoundingClientRect()
      : { top: 0, left: 0 };
    const selRect = range.getBoundingClientRect();

    setSelection(text);
    setTooltipPos({
      top: selRect.top - containerRect.top - 120,
      left: selRect.left - containerRect.left + selRect.width / 2 - 150
    });
    setFieldForm({ name: '', type: 'TEXT', required: true });
  };

  const cancelSelection = () => {
    setTooltipPos(null);
    setSelection(null);
    setSavedRange(null);
    window.getSelection()?.removeAllRanges();
  };

  const confirmField = () => {
    if (!fieldForm.name) return;
    
    // Check if the same text occurs elsewhere in the document
    if (editorRef.current) {
      const textContent = editorRef.current.innerText || editorRef.current.textContent;
      const regex = new RegExp(selection.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
      const matches = textContent.match(regex);
      const count = matches ? matches.length : 1;

      if (count > 1) {
        setPendingField({ ...fieldForm, originalText: selection });
        setOccurrencesCount(count);
        setShowOccurrencesModal(true);
        setTooltipPos(null);
      } else {
        addFieldWithOccurrences({ ...fieldForm, originalText: selection }, false);
      }
    } else {
      addFieldWithOccurrences({ ...fieldForm, originalText: selection }, false);
    }
  };

  const addFieldWithOccurrences = (field, all = false) => {
    const fieldId = 'field-' + Math.random().toString(36).substr(2, 9);
    const newField = { ...field, id: fieldId, occurrences: all ? occurrencesCount : 1 };

    if (!all && savedRange) {
      savedRange.deleteContents();
      
      const span = document.createElement('span');
      span.setAttribute('data-field-id', fieldId);
      span.setAttribute('contenteditable', 'false');
      span.setAttribute('class', 'mm-field-mark');
      span.setAttribute('style', 'background: #EEF2F8; border-bottom: 2px solid #34649A; padding: 2px 6px; border-radius: 2px; font-weight: bold; color: #34649A; cursor: pointer; user-select: all;');
      span.innerText = `[${field.name}]`;
      
      savedRange.insertNode(span);
    } else if (all && editorRef.current) {
      let html = editorRef.current.innerHTML;
      const term = field.originalText;
      const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(escapedTerm, 'g');
      const replacement = `<span data-field-id="${fieldId}" contenteditable="false" class="mm-field-mark" style="background: #EEF2F8; border-bottom: 2px solid #34649A; padding: 2px 6px; border-radius: 2px; font-weight: bold; color: #34649A; cursor: pointer; user-select: all;">[${field.name}]</span>`;
      
      editorRef.current.innerHTML = html.replace(regex, replacement);
    }

    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }

    setFields(prev => [...prev, newField]);
    cancelSelection();
  };

  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id));
    
    // Remove formatting from the DOM
    if (editorRef.current) {
      const span = editorRef.current.querySelector(`span[data-field-id="${id}"]`);
      if (span) {
        const textNode = document.createTextNode(span.innerText.replace(/[\[\]]/g, ''));
        span.parentNode.replaceChild(textNode, span);
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  // Google Docs style rich-text formatting
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  // CORRECÇÃO 6 — Gestão de Imagens
  const handleInsertImage = (file) => {
    if (!file || !editorRef.current) return;
    const id = 'img-' + Math.random().toString(36).substr(2, 9);
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      const imgHtml = `<img data-image-id="${id}" src="${src}" style="max-width:100%;height:auto;cursor:pointer;" data-placement="inline" />`;
      editorRef.current.focus();
      document.execCommand('insertHTML', false, imgHtml);
      setImages(prev => [...prev, {
        id, src, widthPx: 200, heightPx: 100,
        placement: { type: 'inline' }, isLogo: false, originalName: file.name
      }]);
      handleEditorInput();
    };
    reader.readAsDataURL(file);
  };

  const handleReplaceImage = (imageId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const newSrc = e.target.result;
      // Actualizar no DOM
      if (editorRef.current) {
        const imgEl = editorRef.current.querySelector(`img[data-image-id="${imageId}"]`);
        if (imgEl) imgEl.src = newSrc;
        handleEditorInput();
      }
      // Actualizar no estado
      setImages(prev => prev.map(img =>
        img.id === imageId ? { ...img, src: newSrc } : img
      ));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (imageId) => {
    if (editorRef.current) {
      const imgEl = editorRef.current.querySelector(`img[data-image-id="${imageId}"]`);
      if (imgEl) imgEl.remove();
      handleEditorInput();
    }
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  // CORRECÇÃO 2 — Guardar minuta no Supabase
  const handleSaveMinuta = async () => {
    if (fields.length === 0) {
      alert('Defina pelo menos 1 campo antes de guardar.');
      return;
    }
    if (!minutaName) {
      alert('Dê um nome à minuta.');
      return;
    }

    try {
      const contentNormalized = editorRef.current
        ? (editorRef.current.innerText || editorRef.current.textContent || '').trim()
        : content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

      const { data: minutaData, error: minutaError } = await supabase
        .from('minutas')
        .insert({
          user_id: user?.id,
          name: minutaName,
          content_html: editorRef.current ? editorRef.current.innerHTML : content,
          content_normalized: contentNormalized,
          source_type: sourceType, // 'upload' | 'editor'
          folder_id: selectedFolder || null
        })
        .select()
        .single();

      if (minutaError) {
        console.error('Supabase error:', minutaError);
        throw new Error(minutaError.message);
      }

      const fieldsToInsert = fields.map((f, index) => ({
        minuta_id: minutaData.id,
        name: f.name,
        field_type: f.type,
        is_required: f.required,
        order_index: index,
        placeholder: null
      }));

      const { error: fieldsError } = await supabase
        .from('minuta_fields')
        .insert(fieldsToInsert);

      if (fieldsError) throw fieldsError;

      alert('Minuta criada e guardada com sucesso no Supabase!');
      navigate('/app');
    } catch (err) {
      console.error('Erro ao guardar minuta:', err);
      alert('Erro ao guardar minuta na base de dados: ' + err.message);
    }
  };

  const renderStep1 = () => (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '48px' }}>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".docx" 
        onChange={handleFileUpload} 
      />
      <div style={{ width: '100%', maxWidth: '560px' }}>
        <h2 className="text-title" style={{ textAlign: 'center', marginBottom: '32px' }}>Como quer começar?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div 
            className="panel" 
            style={{ textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', padding: '32px 24px', borderRadius: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={() => { setSourceType('editor'); setStep(2); }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <Edit3 size={32} style={{ color: 'var(--color-primary)', marginBottom: '12px' }} />
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>Escrever do zero</div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>Crie o seu documento diretamente no nosso editor integrado.</p>
          </div>
          <div 
            className="panel" 
            style={{ textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', padding: '32px 24px', borderRadius: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={() => { setSourceType('upload'); fileInputRef.current.click(); }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <FileUp size={32} style={{ color: 'var(--color-primary)', marginBottom: '12px' }} />
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>Carregar arquivo DOCX</div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>Importe um ficheiro .docx existente. A formatação original e imagens serão mantidas.</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <span className="text-support">Ou escolher um template da biblioteca</span>
        </div>
      </div>
    </div>
  );

  // CORRECÇÃO 3 — Editor Step 2 deve usar contentEditable
  const renderStep2 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
      <div className="panel" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: 0, borderRadius: '2px' }}>
        <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-global)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn btn-ghost" style={{ height: '32px', padding: '0 10px' }} onClick={() => execCommand('bold')}><b>B</b></button>
          <button className="btn btn-ghost" style={{ height: '32px', padding: '0 10px' }} onClick={() => execCommand('italic')}><i>I</i></button>
          <button className="btn btn-ghost" style={{ height: '32px', padding: '0 10px' }} onClick={() => execCommand('underline')}><u>U</u></button>
          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)' }} />
          <button className="btn btn-ghost" style={{ height: '32px', padding: '0 10px' }} onClick={() => execCommand('justifyLeft')}>Esq</button>
          <button className="btn btn-ghost" style={{ height: '32px', padding: '0 10px' }} onClick={() => execCommand('justifyCenter')}>Cen</button>
          <button className="btn btn-ghost" style={{ height: '32px', padding: '0 10px' }} onClick={() => execCommand('justifyRight')}>Dir</button>
          <button className="btn btn-ghost" style={{ height: '32px', padding: '0 10px' }} onClick={() => execCommand('insertUnorderedList')}>Lista</button>
        </div>
        <div
          ref={editorRef}
          contentEditable={true}
          onInput={handleEditorInput}
          style={{
            flexGrow: 1,
            padding: '24px',
            outline: 'none',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.6',
            overflowY: 'auto',
            minHeight: '300px'
          }}
          data-placeholder="Comece a escrever a sua minuta aqui..."
          suppressContentEditableWarning={true}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button className="btn btn-primary" onClick={() => setStep(3)}>Definir Campos</button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step3-grid">
      
      {/* Editor & A4 Sheet Workspace */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Google Docs style Editor Toolbar */}
        <div style={{ 
          padding: '8px 16px', 
          border: '1px solid var(--color-border)', 
          borderRadius: '0', 
          backgroundColor: 'white', 
          display: 'flex', 
          gap: '8px', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
          <button className="btn btn-ghost" style={{ padding: '4px 8px', height: '32px' }} title="Negrito" onClick={() => execCommand('bold')}><b>B</b></button>
          <button className="btn btn-ghost" style={{ padding: '4px 8px', height: '32px' }} title="Itálico" onClick={() => execCommand('italic')}><i>I</i></button>
          <button className="btn btn-ghost" style={{ padding: '4px 8px', height: '32px' }} title="Sublinhado" onClick={() => execCommand('underline')}><u>U</u></button>
          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)' }}></div>
          <button className="btn btn-ghost" style={{ padding: '4px 8px', height: '32px' }} title="Alinhar à Esquerda" onClick={() => execCommand('justifyLeft')}>⬅</button>
          <button className="btn btn-ghost" style={{ padding: '4px 8px', height: '32px' }} title="Alinhar ao Centro" onClick={() => execCommand('justifyCenter')}>居</button>
          <button className="btn btn-ghost" style={{ padding: '4px 8px', height: '32px' }} title="Alinhar à Direita" onClick={() => execCommand('justifyRight')}>➡</button>
          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)' }}></div>
          <button className="btn btn-ghost" style={{ padding: '4px 8px', height: '32px' }} title="Lista com Marcadores" onClick={() => execCommand('insertUnorderedList')}>• Lista</button>
          <button className="btn btn-ghost" style={{ padding: '4px 8px', height: '32px' }} title="Limpar Formatação" onClick={() => execCommand('removeFormat')}>🧹 Limpar</button>
        </div>

        {/* Paper Sheet Area */}
        {/* CORRECÇÃO 4 — data-editor-container e position:relative */}
        <div style={{ 
          flexGrow: 1, 
          backgroundColor: '#F3F4F6', 
          border: '1px solid var(--color-border)', 
          borderTop: 'none', 
          borderRadius: '0', 
          padding: '32px', 
          overflowY: 'auto', 
          display: 'flex', 
          justifyContent: 'center',
          position: 'relative'
        }} 
          data-editor-container
          onMouseUp={handleSelection}
        >
          
          {/* CORRECÇÃO 5 — SEM dangerouslySetInnerHTML */}
          <div 
            ref={editorRef}
            contentEditable={true}
            onInput={handleEditorInput}
            suppressContentEditableWarning={true}
            className="editor-content"
            style={{ 
              width: '100%', 
              maxWidth: '800px', 
              backgroundColor: 'white', 
              padding: '60px 50px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', 
              minHeight: '1000px',
              outline: 'none',
              fontFamily: 'Arial, sans-serif',
              lineHeight: '1.6',
              fontSize: '14px',
              borderRadius: '2px'
            }}
          />

          {/* Tooltip Overlay */}
          {tooltipPos && (
            <div style={{
              position: 'absolute',
              top: tooltipPos.top,
              left: Math.max(0, tooltipPos.left),
              backgroundColor: 'white',
              border: '1px solid var(--color-border)',
              borderRadius: '2px', 
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
              padding: '16px',
              width: '300px',
              zIndex: 100
            }}>
              <div style={{ fontSize: '12px', color: '#6E6E6E', marginBottom: '8px', fontWeight: 500 }}>
                Definir "{selection.length > 30 ? selection.substring(0, 30) + '...' : selection}" como campo editável
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Nome do campo (ex: Nome do Cliente)" 
                  value={fieldForm.name}
                  onChange={e => setFieldForm({...fieldForm, name: e.target.value})}
                  autoFocus
                  style={{ borderRadius: '2px' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <select 
                  className="form-input"
                  value={fieldForm.type}
                  onChange={e => setFieldForm({...fieldForm, type: e.target.value})}
                  style={{ borderRadius: '2px' }}
                >
                  <option value="TEXT">Texto livre</option>
                  <option value="NAME">Nome próprio</option>
                  <option value="DATE">Data</option>
                  <option value="BI">Bilhete de Identidade</option>
                  <option value="NIF">NIF</option>
                  <option value="AMOUNT">Valor monetário</option>
                  <option value="NUMBER_WORDS">Número por extenso</option>
                  <option value="GENDER">Género</option>
                  <option value="EMAIL">Email</option>
                  <option value="PHONE">Telefone</option>
                  <option value="ADDRESS">Morada</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
                <input 
                  type="checkbox" 
                  id="required" 
                  checked={fieldForm.required} 
                  onChange={e => setFieldForm({...fieldForm, required: e.target.checked})}
                />
                <label htmlFor="required" style={{ fontSize: '13px', cursor: 'pointer' }}>Campo obrigatório</label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button className="btn btn-ghost" onClick={cancelSelection} style={{ padding: '4px 12px', height: '32px', borderRadius: '2px' }}>Cancelar</button>
                <button className="btn btn-primary" onClick={confirmField} style={{ padding: '4px 12px', height: '32px', borderRadius: '2px' }}>Confirmar</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Panel */}
      <div className="panel" style={{ padding: '0', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-global)', height: '100%', overflowY: 'auto', borderRadius: '2px' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 className="text-subtitle" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Campos Definidos ({fields.length})
          </h3>
        </div>
        
        <div style={{ padding: '16px', flexGrow: 1, overflowY: 'auto' }}>
          {fields.length === 0 ? (
            <div className="text-support" style={{ textAlign: 'center', marginTop: '24px' }}>Nenhum campo definido.<br/><small>Seleccione texto no editor para começar.</small></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {fields.map((f, i) => (
                <div key={f.id} style={{ padding: '12px', border: '1px solid var(--color-border)', backgroundColor: 'white', display: 'flex', alignItems: 'center', borderRadius: '2px', gap: '12px' }}>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{f.name}</div>
                    <div style={{ fontSize: '12px', color: '#6E6E6E', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ backgroundColor: '#EEF2F8', padding: '2px 6px', borderRadius: '2px', color: '#34649A', fontSize: '11px', fontWeight: 600 }}>{f.type}</span>
                      <span>{f.occurrences} ocorrência(s)</span>
                    </div>
                  </div>
                  <button className="btn btn-ghost" style={{ padding: '4px', height: 'auto', minWidth: 'auto', color: 'var(--color-error)', fontSize: '18px', borderRadius: '2px' }} onClick={() => removeField(f.id)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CORRECÇÃO 6 — Painel de Imagens */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
          <h3 className="text-subtitle" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Imagens ({images.length})
          </h3>

          {images.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.4', marginBottom: '12px' }}>
              Nenhuma imagem no documento.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {images.map(img => (
                <div key={img.id} style={{ border: '1px solid var(--color-border)', padding: '8px', backgroundColor: 'white', borderRadius: '2px' }}>
                  <img
                    src={img.src}
                    alt=""
                    style={{ width: '100%', maxHeight: '60px', objectFit: 'contain', display: 'block', marginBottom: '6px' }}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                    {img.widthPx}×{img.heightPx}px · {img.placement.type === 'header' ? 'Cabeçalho' : 'Inline'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}>
                      Substituir
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        style={{ display: 'none' }}
                        onChange={(e) => handleReplaceImage(img.id, e.target.files[0])}
                      />
                    </label>
                    <button
                      style={{ fontSize: '12px', color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}
                      onClick={() => handleRemoveImage(img.id)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <label className="btn btn-secondary" style={{ width: '100%', fontSize: '13px', cursor: 'pointer', justifyContent: 'center', borderRadius: '2px' }}>
            + Inserir imagem
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={(e) => handleInsertImage(e.target.files[0])}
            />
          </label>
        </div>
      </div>
      
      {/* Footer Bar */}
      <div className="nova-minuta-footer">
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Nome da minuta (ex: Contrato de Trabalho)..." 
            value={minutaName}
            onChange={(e) => setMinutaName(e.target.value)}
            style={{ width: '100%', maxWidth: '300px', borderRadius: '2px' }}
          />
          <select 
            className="form-input" 
            style={{ width: '100%', maxWidth: '200px', borderRadius: '2px' }}
            value={selectedFolder || ''}
            onChange={(e) => setSelectedFolder(e.target.value)}
          >
            <option value="">A Minha Pasta (Geral)</option>
            {folders.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleSaveMinuta}
          style={{ borderRadius: '2px' }}
        >
          Guardar minuta
        </button>
      </div>

      {/* Occurrences Modal Overlay */}
      {showOccurrencesModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="panel" style={{ width: '400px', backgroundColor: 'white', padding: '24px', borderRadius: '2px' }}>
            <h3 className="text-subtitle" style={{ marginBottom: '16px' }}>Ocorrências repetidas</h3>
            <p className="text-support" style={{ marginBottom: '24px', lineHeight: '1.5' }}>
              Encontrámos {occurrencesCount} ocorrências exatas do texto "{pendingField?.originalText}" no documento. Marcar todas automaticamente?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  addFieldWithOccurrences({ ...pendingField }, false);
                  setShowOccurrencesModal(false);
                }}
                style={{ borderRadius: '2px' }}
              >
                Marcar apenas esta
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  addFieldWithOccurrences({ ...pendingField }, true);
                  setShowOccurrencesModal(false);
                }}
                style={{ borderRadius: '2px' }}
              >
                Marcar todas ({occurrencesCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`main-content ${step === 3 ? 'step-3-layout' : ''}`}>
      <div className={`page-header nova-minuta-header ${step === 3 ? 'step3' : ''}`}>
        <div>
          <h1 className="text-display">Criar Minuta</h1>
        </div>
        {step > 1 && <button className="btn btn-secondary" onClick={() => setStep(step - 1)} style={{ borderRadius: '2px' }}>Voltar</button>}
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
}
