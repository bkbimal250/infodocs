import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiX, HiDocumentText, HiTemplate, HiCloudDownload, HiPlus } from 'react-icons/hi';
import { certificateApi } from '../api/Certificates/certificateApi';
import { apiCache } from '../utils/apiCache';
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

import {
  prepareCertificateData,
  calculateInvoiceTotal,
  generateCertificateFilename,
  downloadFile,
  getCategoryDisplayName,
  convertBlobUrlsInData,
} from '../utils/certificateUtils';
import {
  getCertificateFormComponent,
  CertificateHeader,
  SpaSelectionField,
  InvoiceItemsTable
} from './components';

const CreateCertifications = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTemplateId = location.state?.templateId || null;

  const [templates, setTemplates] = useState([]);
  const [templatesByCategory, setTemplatesByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
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

  // Load templates by category when category is selected
  useEffect(() => {
    if (selectedCategory) {
      loadTemplatesByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const loadTemplatesByCategory = useCallback(async (category) => {
    try {
      const response = await certificateApi.getTemplatesByCategory(category);
      const variants = response.data || {};
      setTemplatesByCategory(prev => ({ ...prev, [category]: variants }));
    } catch (err) {
      console.error('Error loading templates by category:', err);
    }
  }, []);

  // Get available templates based on category and variant
  const availableTemplates = useMemo(() => {
    if (!selectedCategory) return templates;

    const categoryVariants = templatesByCategory[selectedCategory];
    if (!categoryVariants) return templates.filter(t => t.category === selectedCategory);

    if (selectedVariant && categoryVariants[selectedVariant]) {
      return categoryVariants[selectedVariant];
    }

    // Return all templates for selected category
    return Object.values(categoryVariants).flat();
  }, [templates, selectedCategory, selectedVariant, templatesByCategory]);

  // Get available variants for selected category
  const availableVariants = useMemo(() => {
    if (!selectedCategory || !templatesByCategory[selectedCategory]) return [];
    return Object.keys(templatesByCategory[selectedCategory]);
  }, [selectedCategory, templatesByCategory]);

  useEffect(() => {
    if (!availableTemplates.length) return;
    const selected = availableTemplates.find((t) => t.id === selectedTemplateId) || availableTemplates[0];
    setSelectedTemplate(selected || null);
    setSelectedTemplateId(selected ? selected.id : null);
  }, [availableTemplates, selectedTemplateId]);

  const categoryKey = useMemo(() => selectedTemplate?.category || null, [selectedTemplate]);

  const categoryFields = useMemo(() => {
    if (!categoryKey) return null;
    return CERTIFICATE_FIELDS[categoryKey] || null;
  }, [categoryKey]);

  const isInvoiceCategory = useMemo(
    () => categoryKey === CERTIFICATE_CATEGORIES.INVOICE_SPA_BILL,
    [categoryKey]
  );
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

  const loadTemplates = useCallback(async () => {
    try {
      setState(FORM_STATES.LOADING);

      const cacheKey = '/certificates/templates';
      const cached = apiCache.get(cacheKey);

      if (cached) {
        setTemplates(cached);
        setError(null);
        setState(FORM_STATES.IDLE);
        return;
      }

      const response = await certificateApi.getPublicTemplates();
      const templates = response.data || [];
      setTemplates(templates);
      setError(null);

      apiCache.set(cacheKey, {}, templates);
    } catch (err) {
      setError(ERROR_MESSAGES.LOAD_TEMPLATES_FAILED);
    } finally {
      setState(FORM_STATES.IDLE);
    }
  }, []);

  const loadSpas = useCallback(async () => {
    try {
      setSpaLoading(true);

      const cacheKey = '/forms/spas';
      const cached = apiCache.get(cacheKey);

      if (cached) {
        setSpas(cached);
        setSpaError(null);
        setSpaLoading(false);
        return;
      }
      const response = await certificateApi.getSpas({ minimal: false });
      const spasData = response.data || [];
      setSpas(spasData);
      setSpaError(null);

      apiCache.set(cacheKey, {}, spasData);
    } catch (err) {
      setSpaError('Failed to load SPA locations');
    } finally {
      setSpaLoading(false);
    }
  }, []);

  const formatSpaAddress = useCallback((spa) => {
    if (!spa) return '';
    return spa.address || '';
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
        spa_logo: spa.logo || '',
        spa_address_appointment: formattedAddress || '',
        spa_phone_appointment: spa.phone_number || '',
        spa_phone1_appointment: spa.alternate_number || '',
      }));
    },
    [formatSpaAddress]
  );

  const handleSpaSelect = useCallback((spa) => {
    if (!spa) {
      setSelectedSpaId(null);
      clearSpaData();
      setSpaSearch('');
      setShowSpaDropdown(false);
      return;
    }
    setSelectedSpaId(spa.id);
    setSpaSearch('');
    setShowSpaDropdown(false);
  }, [clearSpaData]);

  const handleSpaSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSpaSearch(value);
      setShowSpaDropdown(true);

      if (selectedSpaId && value) {
        const selectedSpa = spas.find((s) => s.id === selectedSpaId);
        // If current value is not equal to selected spa name, clear the selection
        if (selectedSpa && selectedSpa.name !== value) {
          setSelectedSpaId(null);
          clearSpaData();
        }
      }
    },
    [selectedSpaId, clearSpaData, spas]
  );

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
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTemplateChange = (e) => {
    const id = parseInt(e.target.value, 10);
    setSelectedTemplateId(id);
    setSuccess(null);
    setError(null);
    // setPreviewHtml && setPreviewHtml(''); // keep if you have this state defined above
  };

  const addInvoiceItem = () => {
    setInvoiceItems((prev) => [...prev, { ...INVOICE_ITEM_TEMPLATE }]);
  };

  const updateInvoiceItem = (index, field, value) => {
    setInvoiceItems((prev) =>
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
    setInvoiceItems((prev) => {
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
    // For Daily Sheet, use SPA name instead of a person's name
    let requestName = '';
    if (categoryKey === CERTIFICATE_CATEGORIES.DAILY_SHEET) {
      requestName = selectedSpa?.name || formData.spa_name || 'Daily Sheet';
    } else {
      requestName =
        formData.manager_name ||
        formData.candidate_name ||
        formData.recipient_name ||
        formData.employee_name ||
        formData.customer_name ||
        formData.name ||
        (formData.first_name ? `${formData.first_name} ${formData.last_name || ''}`.trim() : '') ||
        '';
    }
    if (!requestName && categoryKey !== CERTIFICATE_CATEGORIES.DAILY_SHEET) {
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

      const previewId = `preview_${Date.now()}`;
      sessionStorage.setItem(previewId, html);

      const generationData = {
        template_id: selectedTemplate.id,
        name: requestName,
        email: formData.email,
        spa_id: selectedSpaId || formData.spa_id || null,
        certificate_data: data,
      };
      sessionStorage.setItem(`${previewId}_data`, JSON.stringify(generationData));

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
    // For Daily Sheet, use SPA name instead of a person's name
    let requestName = '';
    if (categoryKey === CERTIFICATE_CATEGORIES.DAILY_SHEET) {
      requestName = selectedSpa?.name || formData.spa_name || 'Daily Sheet';
    } else {
      requestName =
        formData.manager_name ||
        formData.candidate_name ||
        formData.recipient_name ||
        formData.employee_name ||
        formData.customer_name ||
        formData.name ||
        (formData.first_name ? `${formData.first_name} ${formData.last_name || ''}`.trim() : '') ||
        '';
    }
    if (!requestName) {
      setError(ERROR_MESSAGES.NAME_REQUIRED);
      return;
    }
    try {
      setState(FORM_STATES.GENERATING);
      setError(null);
      let data = prepareCertificateData(categoryKey, formData, invoiceItems);

      data = await convertBlobUrlsInData(data);

      const response = await certificateApi.generateCertificate({
        template_id: selectedTemplate.id,
        name: requestName,
        email: formData.email,
        spa_id: selectedSpaId || formData.spa_id || null,
        certificate_data: data,
      });

      const filename = generateCertificateFilename(
        selectedTemplate.name || 'certificate',
        requestName || 'recipient'
      );
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
      setFormData((prev) => ({
        ...prev,
        subtotal: totals.subtotal,
        amount_in_words: totals.totalInWords,
      }));
    }
  }, [totals, isInvoiceCategory]);

  return (
    <div className="min-h-screen bg-background px-3 py-6 md:px-6">
      <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

        <CertificateHeader
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
          selectedTemplateId={selectedTemplateId}
          handleTemplateChange={handleTemplateChange}
          availableVariants={availableVariants}
          availableTemplates={availableTemplates}
          onPreview={onPreview}
          onGenerate={onGenerate}
          state={state}
          FORM_STATES={FORM_STATES}
          navigate={navigate}
        />

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-3 animate-in slide-in-from-top-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <p className="text-[10px] font-black text-red-600  tracking-widest">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-3 animate-in slide-in-from-top-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <p className="text-[10px] font-black text-green-600  tracking-widest">{success}</p>
          </div>
        )}

        {/* SPA selection */}
        {shouldRequireSpa && (
          <SpaSelectionField
            spaSearch={spaSearch}
            handleSpaSearchChange={handleSpaSearchChange}
            selectedSpaId={selectedSpaId}
            selectedSpa={selectedSpa}
            handleSpaSelect={handleSpaSelect}
            showSpaDropdown={showSpaDropdown}
            setShowSpaDropdown={setShowSpaDropdown}
            filteredSpas={filteredSpas}
            spaLoading={spaLoading}
            formatSpaAddress={formatSpaAddress}
          />
        )}

        {/* Dynamic form */}
        <div className="card shadow-soft p-0 overflow-hidden bg-white border-primary/5 animate-in slide-in-from-bottom-4 duration-500 delay-150">
          <div className="bg-primary/[0.03] px-6 py-4 border-b border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white shadow-sm border border-primary/10 rounded-xl text-primary">
                <HiTemplate size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black text-gray-900 leading-none">
                  {categoryFields?.title ||
                    CERTIFICATE_CATEGORY_METADATA[categoryKey]?.title ||
                    'Document Parameters'}
                </h2>
                <p className="text-[8px] font-bold text-gray-400  tracking-widest mt-1">Initialize official document variables</p>
              </div>
            </div>
            {categoryKey && (
              <div className="badge badge-info tracking-wider py-1.5 px-3 font-black text-[9px]">{getCategoryDisplayName(categoryKey)}</div>
            )}
          </div>

          <div className="p-6 bg-white">
            {state === FORM_STATES.LOADING ? (
              <div className="py-20 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-b-transparent mb-4" />
                <p className="text-[10px] font-black text-gray-400  tracking-widest">Compiling template data...</p>
              </div>
            ) : !selectedTemplate ? (
              <div className="py-20 text-center">
                <p className="text-[10px] font-black text-gray-400  tracking-widest underline decoration-primary underline-offset-4">Select a design template to begin entry</p>
              </div>
            ) : FormComponent ? (
              <div className="animate-in fade-in duration-500">
                {isInvoiceCategory ? (
                  <FormComponent
                    formData={{ ...formData, invoiceItems }}
                    handleInputChange={handleInputChange}
                    handleInvoiceItemChange={(index, field, value) =>
                      updateInvoiceItem(index, field, value)
                    }
                    handleAddInvoiceItem={addInvoiceItem}
                    handleRemoveInvoiceItem={removeInvoiceItem}
                  />
                ) : (
                  <FormComponent formData={formData} handleInputChange={handleInputChange} />
                )}
              </div>
            ) : (
              categoryFields && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 animate-in fade-in duration-500">
                  {categoryFields.fields.map((field) => (
                    <div key={field.name} className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400  tracking-widest ml-1">
                        {field.label}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={handleInputChange}
                          rows="3"
                          className="input min-h-[100px] resize-none"
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={handleInputChange}
                          className="input"
                        >
                          <option value="">Select Option</option>
                          {(field.options || []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type || 'text'}
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={handleInputChange}
                          className="input"
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Invoice items block */}
        {isInvoiceCategory && !FormComponent && (
          <InvoiceItemsTable
            invoiceItems={invoiceItems}
            addInvoiceItem={addInvoiceItem}
            updateInvoiceItem={updateInvoiceItem}
            removeInvoiceItem={removeInvoiceItem}
            totals={totals}
          />
        )}

        {/* Footer info section */}
        {selectedTemplate && (
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4 animate-in fade-in duration-700">
            <div className="p-2 bg-primary text-white rounded-xl shadow-soft">
              <HiDocumentText size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-900  tracking-widest leading-none mb-1">Industrial Standards</p>
              <p className="text-[10px] font-bold text-gray-400 leading-relaxed  tracking-widest">
                Ensure all information is verified against official records before generating the legal document.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCertifications;
