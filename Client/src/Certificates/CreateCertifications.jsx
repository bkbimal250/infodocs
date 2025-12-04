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
  const [showSpaDropdown, setShowSpaDropdown] = useState(false);
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

  const handleSpaSelect = (spaId) => {
    if (!spaId) {
      setSelectedSpaId(null);
      clearSpaData();
      setSpaSearch('');
      setShowSpaDropdown(false);
      return;
    }
    setSelectedSpaId(parseInt(spaId, 10));
    setSpaSearch('');
    setShowSpaDropdown(false);
  };

  const handleSpaSearchChange = (e) => {
    const value = e.target.value;
    setSpaSearch(value);
    setShowSpaDropdown(true);
    // Clear selection if current selected SPA is not in filtered results
    if (selectedSpaId) {
      const selectedSpa = filteredSpas.find((s) => s.id === selectedSpaId);
      if (!selectedSpa && value) {
        setSelectedSpaId(null);
        clearSpaData();
      }
    }
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
      setShowSpaDropdown(false);
    }
  }, [shouldRequireSpa, clearSpaData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSpaDropdown && !event.target.closest('.spa-dropdown-container')) {
        setShowSpaDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSpaDropdown]);

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
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              SPA Location <span className="text-red-500">*</span>
            </h3>

            <div className="space-y-4">
              {/* Search and Select */}
              <div className="relative spa-dropdown-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search and Select SPA Location
                </label>
                
                {/* Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={spaSearch}
                    onChange={handleSpaSearchChange}
                    onFocus={() => setShowSpaDropdown(true)}
                    placeholder="Search by name, code, area, or city..."
                    className={`w-full pl-10 pr-10 py-3 text-sm border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      !selectedSpaId && !spaSearch
                        ? 'border-red-300 bg-red-50'
                        : selectedSpaId
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 bg-white hover:border-blue-300'
                    }`}
                  />
                  {selectedSpaId && (
                    <button
                      onClick={() => handleSpaSelect(null)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Clear selection"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  {spaSearch && (
                    <span className="absolute right-12 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                      {filteredSpas.length} {filteredSpas.length === 1 ? 'result' : 'results'}
                    </span>
                  )}
                </div>

                {/* Dropdown Results */}
                {showSpaDropdown && (spaSearch || !selectedSpaId) && (
                  <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                    {spaLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm">Loading SPA locations...</p>
                      </div>
                    ) : filteredSpas.length > 0 ? (
                      <ul className="py-2">
                        {filteredSpas.map((spa) => (
                          <li
                            key={spa.id}
                            onClick={() => handleSpaSelect(spa.id)}
                            className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                              selectedSpaId === spa.id ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">{spa.name}</span>
                                  {selectedSpaId === spa.id && (
                                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                                      Selected
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                  {spa.code && (
                                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                                      Code: {spa.code}
                                    </span>
                                  )}
                                  {spa.area && <span>{spa.area}</span>}
                                  {spa.city && <span>{spa.city}</span>}
                                  {spa.state && <span>{spa.state}</span>}
                                </div>
                                {spa.address && (
                                  <p className="text-xs text-gray-500 mt-1 truncate">{spa.address}</p>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : spaSearch ? (
                      <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">No SPAs found matching "{spaSearch}"</p>
                        <p className="text-xs mt-1 text-gray-400">Try a different search term</p>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">No SPA locations available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected SPA Display */}
              {selectedSpa && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="text-lg font-bold text-gray-900">{selectedSpa.name}</h4>
                        {selectedSpa.code && (
                          <span className="px-2 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full">
                            Code: {selectedSpa.code}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{formatSpaAddress(selectedSpa) || '—'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-blue-200">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Contact</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedSpa.phone_number || '—'}</p>
                      {selectedSpa.alternate_number && (
                        <p className="text-xs text-gray-600 mt-1">{selectedSpa.alternate_number}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedSpa.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Website</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedSpa.website || '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Messages */}
              {spaError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {spaError}
                </div>
              )}
              {!spaError && !spaLoading && !spas.length && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg">
                  No SPA locations available. Please contact administrator.
                </div>
              )}
            </div>
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
