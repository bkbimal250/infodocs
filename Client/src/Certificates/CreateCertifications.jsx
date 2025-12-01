import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { certificateApi } from '../api/Certificates/certificateApi';
import {
  CERTIFICATE_CATEGORIES,
  CERTIFICATE_CATEGORY_METADATA,
  CERTIFICATE_FIELDS,
  INVOICE_ITEM_TEMPLATE,
  FORM_STATES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  SPA_REQUIRED_CATEGORIES,
} from '../utils/certificateConstants';

import { prepareCertificateData, calculateInvoiceTotal, generateCertificateFilename, downloadFile, getCategoryDisplayName } from '../utils/certificateUtils';
import { getCertificateFormComponent } from './components';

const CreateCertifications = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTemplateId = location.state?.templateId || null;

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [invoiceItems, setInvoiceItems] = useState([{ ...INVOICE_ITEM_TEMPLATE }]);
  const [spas, setSpas] = useState([]);
  const [selectedSpaId, setSelectedSpaId] = useState(null);
  const [spaSearch, setSpaSearch] = useState('');
  const [spaLoading, setSpaLoading] = useState(false);
  const [spaError, setSpaError] = useState(null);
  const [state, setState] = useState(FORM_STATES.IDLE);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadTemplates();
    loadSpas();
  }, []);

  useEffect(() => {
    if (!templates.length) return;
    const selected = templates.find(t => t.id === selectedTemplateId) || templates[0];
    setSelectedTemplate(selected || null);
    setSelectedTemplateId(selected ? selected.id : null);
  }, [templates, selectedTemplateId]);

  const categoryKey = useMemo(() => selectedTemplate?.category || null, [selectedTemplate]);

  const categoryFields = useMemo(() => {
    if (!categoryKey) return null;
    return CERTIFICATE_FIELDS[categoryKey] || null;
  }, [categoryKey]);

  const isInvoiceCategory = useMemo(() => categoryKey === CERTIFICATE_CATEGORIES.INVOICE_SPA_BILL, [categoryKey]);
  const shouldRequireSpa = useMemo(
    () => (categoryKey ? SPA_REQUIRED_CATEGORIES.includes(categoryKey) : false),
    [categoryKey]
  );
  const FormComponent = useMemo(() => {
    if (!categoryKey) return null;
    return getCertificateFormComponent(categoryKey);
  }, [categoryKey]);

  const filteredSpas = useMemo(() => {
    const term = spaSearch.trim().toLowerCase();
    if (!term) {
      return spas;
    }
    return spas.filter((spa) => {
      const name = spa.name?.toLowerCase() || '';
      const city = spa.city?.toLowerCase() || '';
      const code = spa.code ? String(spa.code).toLowerCase() : '';
      return name.includes(term) || city.includes(term) || code.includes(term);
    });
  }, [spas, spaSearch]);

  const selectedSpa = useMemo(() => {
    if (!selectedSpaId) return null;
    return spas.find((spa) => spa.id === selectedSpaId) || null;
  }, [spas, selectedSpaId]);

  const loadTemplates = async () => {
    try {
      setState(FORM_STATES.LOADING);
      const response = await certificateApi.getPublicTemplates();
      setTemplates(response.data || []);
      setError(null);
    } catch (err) {
      setError(ERROR_MESSAGES.LOAD_TEMPLATES_FAILED);
    } finally {
      setState(FORM_STATES.IDLE);
    }
  };

  const loadSpas = async () => {
    try {
      setSpaLoading(true);
      const response = await certificateApi.getSpas();
      setSpas(response.data || []);
      setSpaError(null);
    } catch (err) {
      setSpaError('Failed to load SPA locations');
    } finally {
      setSpaLoading(false);
    }
  };

  const formatSpaAddress = useCallback((spa) => {
    if (!spa) return '';
    const parts = [spa.address, spa.area, spa.city, spa.state, spa.pincode].filter(Boolean);
    return parts.join(', ');
  }, []);

  const clearSpaData = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      spa_id: '',
      spa_name: '',
      spa_address: '',
      spa_area: '',
      spa_city: '',
      spa_state: '',
      spa_country: '',
      spa_pincode: '',
      spa_phone: '',
      spa_phone1: '',
      spa_email: '',
      spa_website: '',
      spa_name_appointment: '',
      spa_address_appointment: '',
      spa_phone_appointment: '',
      spa_phone1_appointment: '',
    }));
  }, []);

  const applySpaDataToForm = useCallback(
    (spa) => {
      if (!spa) return;
      const formattedAddress = formatSpaAddress(spa);
      setFormData((prev) => ({
        ...prev,
        spa_id: spa.id,
        spa_name: spa.name || '',
        spa_address: formattedAddress || '',
        spa_area: spa.area || '',
        spa_city: spa.city || '',
        spa_state: spa.state || '',
        spa_country: spa.country || '',
        spa_pincode: spa.pincode || '',
        spa_phone: spa.phone_number || '',
        spa_phone1: spa.alternate_number || '',
        spa_email: spa.email || '',
        spa_website: spa.website || '',
        location: spa.city || spa.state || '',
        spa_name_appointment: spa.name || '',
        spa_address_appointment: formattedAddress || '',
        spa_phone_appointment: spa.phone_number || '',
        spa_phone1_appointment: spa.alternate_number || '',
      }));
    },
    [formatSpaAddress]
  );

  const handleSpaSelect = (e) => {
    const value = e.target.value;
    if (!value) {
      setSelectedSpaId(null);
      clearSpaData();
      return;
    }
    setSelectedSpaId(parseInt(value, 10));
  };

  useEffect(() => {
    if (selectedSpa) {
      applySpaDataToForm(selectedSpa);
    }
  }, [selectedSpa, applySpaDataToForm]);

  useEffect(() => {
    if (!shouldRequireSpa) {
      setSelectedSpaId(null);
      clearSpaData();
    }
  }, [shouldRequireSpa, clearSpaData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTemplateChange = (e) => {
    const id = parseInt(e.target.value, 10);
    setSelectedTemplateId(id);
    setPreviewHtml('');
    setSuccess(null);
    setError(null);
  };

  const addInvoiceItem = () => {
    setInvoiceItems(prev => [...prev, { ...INVOICE_ITEM_TEMPLATE }]);
  };

  const updateInvoiceItem = (index, field, value) => {
    setInvoiceItems(prev =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = {
          ...item,
          [field]: field === 'quantity' ? value.replace(/[^0-9]/g, '') : value,
        };
        const qty = Number(updated.quantity || 1);
        const rate = Number(updated.rate || 0);
        updated.amount = (qty * rate).toFixed(2);
        return updated;
      })
    );
  };

  const removeInvoiceItem = (index) => {
    setInvoiceItems(prev => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [{ ...INVOICE_ITEM_TEMPLATE }];
    });
  };

  const onPreview = async () => {
    if (!selectedTemplate) {
      setError(ERROR_MESSAGES.TEMPLATE_NOT_SELECTED);
      return;
    }
    if (shouldRequireSpa && !selectedSpaId) {
      setError(ERROR_MESSAGES.SPA_REQUIRED);
      return;
    }
    const requestName = formData.manager_name || formData.candidate_name || formData.recipient_name || formData.employee_name || formData.customer_name || formData.name || '';
    if (!requestName) {
      setError(ERROR_MESSAGES.NAME_REQUIRED);
      return;
    }
    setState(FORM_STATES.PREVIEW);
    setError(null);
    const data = prepareCertificateData(categoryKey, formData, invoiceItems);
    try {
      const response = await certificateApi.previewCertificate({
        template_id: selectedTemplate.id,
        name: requestName,
        email: formData.email,
        spa_id: selectedSpaId || formData.spa_id || null,
        certificate_data: data,
      });
      const html = response.data?.html || '';
      
      // Store HTML and generation data in sessionStorage for the new window
      const previewId = `preview_${Date.now()}`;
      sessionStorage.setItem(previewId, html);
      
      // Store generation data for PDF generation
      const generationData = {
        template_id: selectedTemplate.id,
        name: requestName,
        email: formData.email,
        spa_id: selectedSpaId || formData.spa_id || null,
        certificate_data: data,
      };
      sessionStorage.setItem(`${previewId}_data`, JSON.stringify(generationData));
      
      // Open preview in new window
      const previewWindow = window.open(
        `/certificate-preview?id=${previewId}`,
        'CertificatePreview',
        'width=1200,height=800,scrollbars=yes,resizable=yes'
      );
      
      if (previewWindow) {
        setSuccess(SUCCESS_MESSAGES.PREVIEW_SUCCESS);
      } else {
        setError('Please allow popups to view the preview in a new window');
      }
    } catch (err) {
      setError(ERROR_MESSAGES.PREVIEW_FAILED);
    } finally {
      setState(FORM_STATES.IDLE);
    }
  };

  const onGenerate = async () => {

    if (!selectedTemplate) {
      setError(ERROR_MESSAGES.TEMPLATE_NOT_SELECTED);
      return;
    }
    if (shouldRequireSpa && !selectedSpaId) {
      setError(ERROR_MESSAGES.SPA_REQUIRED);
      return;
    }
    const requestName = formData.manager_name || formData.candidate_name || formData.recipient_name || formData.employee_name || formData.customer_name || formData.name || '';
    if (!requestName) {
      setError(ERROR_MESSAGES.NAME_REQUIRED);
      return;
    }
    try {
      setState(FORM_STATES.GENERATING);
      setError(null);
      const data = prepareCertificateData(categoryKey, formData, invoiceItems);
      
      const response = await certificateApi.generateCertificate({
        template_id: selectedTemplate.id,
        name: requestName,
        email: formData.email,
        spa_id: selectedSpaId || formData.spa_id || null,
        certificate_data: data,
      });

      const filename = generateCertificateFilename(selectedTemplate.name || 'certificate', requestName || 'recipient');
      downloadFile(response.data, filename);
      
      setSuccess(SUCCESS_MESSAGES.GENERATE_SUCCESS);
    } catch (err) {
      setError(ERROR_MESSAGES.GENERATE_FAILED);
    } finally {
      setState(FORM_STATES.IDLE);
    }
  };

  const totals = useMemo(() => calculateInvoiceTotal(invoiceItems), [invoiceItems]);

  useEffect(() => {
    if (isInvoiceCategory) {
      setFormData(prev => ({ ...prev, subtotal: totals.subtotal, amount_in_words: totals.totalInWords }));
    }
  }, [totals, isInvoiceCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button and Header */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/certificates')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Templates</span>
          </button>
        </div>

        {/* Selected Template Display */}
        {selectedTemplate && (
          <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTemplate.name}</h2>
                {selectedTemplate.category && (
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full mb-2">
                    {getCategoryDisplayName(selectedTemplate.category)}
                  </span>
                )}
                {selectedTemplate.description && (
                  <p className="text-gray-600 mt-2">{selectedTemplate.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
              <select value={selectedTemplateId || ''} onChange={handleTemplateChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 justify-end md:col-span-2">
              <button onClick={onPreview} disabled={state === FORM_STATES.PREVIEW || state === FORM_STATES.GENERATING} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">Preview</button>
              <button onClick={onGenerate} disabled={state === FORM_STATES.PREVIEW || state === FORM_STATES.GENERATING} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Generate PDF</button>
            </div>
          </div>
          {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}
          {success && <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">{success}</div>}
        </div>

        {shouldRequireSpa && (
          <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100 mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search SPA</label>
                <input
                  type="text"
                  value={spaSearch}
                  onChange={(e) => setSpaSearch(e.target.value)}
                  placeholder="Search by name, city, or code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {spaLoading && <p className="text-xs text-gray-500 mt-1">Loading SPA locations...</p>}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select SPA Location</label>
                <select
                  value={selectedSpaId || ''}
                  onChange={handleSpaSelect}
                  disabled={spaLoading || !spas.length}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                >
                  <option value="">Select SPA</option>
                  {filteredSpas.map((spa) => (
                    <option key={spa.id} value={spa.id}>
                      {spa.name} {spa.city ? `(${spa.city})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {spaError && <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{spaError}</div>}
            {!spaError && !spaLoading && !spas.length && (
              <div className="mt-3 text-sm text-gray-500">No SPA locations available.</div>
            )}
            {selectedSpa && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">{formatSpaAddress(selectedSpa) || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Contact</p>
                  <p className="font-medium text-gray-900">{selectedSpa.phone_number || '—'}</p>
                  {selectedSpa.alternate_number && <p className="text-gray-700">{selectedSpa.alternate_number}</p>}
                </div>
                <div>
                  <p className="text-gray-500">Email / Code</p>
                  <p className="font-medium text-gray-900">{selectedSpa.email || '—'}</p>
                  {selectedSpa.code && <p className="text-gray-700">Code: {selectedSpa.code}</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {FormComponent ? (
          <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {categoryFields?.title ||
                CERTIFICATE_CATEGORY_METADATA[categoryKey]?.title ||
                'Certificate Details'}
            </h3>
            {isInvoiceCategory ? (
              <FormComponent
                formData={{ ...formData, invoiceItems }}
                handleInputChange={handleInputChange}
                handleInvoiceItemChange={(index, field, value) => updateInvoiceItem(index, field, value)}
                handleAddInvoiceItem={addInvoiceItem}
                handleRemoveInvoiceItem={removeInvoiceItem}
              />
            ) : (
              <FormComponent formData={formData} handleInputChange={handleInputChange} />
            )}
          </div>
        ) : (
          categoryFields && (
            <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{categoryFields.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryFields.fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    ) : field.type === 'select' ? (
                      <select name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        {(field.options || []).map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                      </select>
                    ) : (
                      <input type={field.type} name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {isInvoiceCategory && !FormComponent && (
          <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Invoice Items</h3>
              <button onClick={addInvoiceItem} className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">Add Item</button>
            </div>
            <div className="space-y-3">
              {invoiceItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                  <input type="text" placeholder="Description" value={item.description} onChange={(e) => updateInvoiceItem(idx, 'description', e.target.value)} className="px-3 py-2 border rounded" />
                  <input type="text" placeholder="HSN" value={item.hsn_code} onChange={(e) => updateInvoiceItem(idx, 'hsn_code', e.target.value)} className="px-3 py-2 border rounded" />
                  <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateInvoiceItem(idx, 'quantity', e.target.value)} className="px-3 py-2 border rounded" />
                  <input type="number" placeholder="Rate" value={item.rate} onChange={(e) => updateInvoiceItem(idx, 'rate', e.target.value)} className="px-3 py-2 border rounded" />
                  <input type="text" placeholder="Amount" value={item.amount} readOnly className="px-3 py-2 border rounded bg-gray-50" />
                  <button onClick={() => removeInvoiceItem(idx)} className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">Remove</button>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                <input type="text" name="subtotal" value={formData.subtotal || ''} readOnly className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount in Words</label>
                <input type="text" name="amount_in_words" value={formData.amount_in_words || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCertifications;
