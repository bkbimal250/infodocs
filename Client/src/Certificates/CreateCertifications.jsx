import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { certificateApi } from '../api/Certificates/certificateApi';
import { apiCache } from '../utils/apiCache';
import { debounce } from '../utils/debounce';
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
    const selected = templates.find((t) => t.id === selectedTemplateId) || templates[0];
    setSelectedTemplate(selected || null);
    setSelectedTemplateId(selected ? selected.id : null);
  }, [templates, selectedTemplateId]);

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
      const response = await certificateApi.getSpas();
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

  const debouncedSpaSearch = useMemo(
    () =>
      debounce((value) => {
        setSpaSearch(value);
        setShowSpaDropdown(true);
      }, 300),
    []
  );

  const handleSpaSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      debouncedSpaSearch(value);

      if (selectedSpaId) {
        const selectedSpa = filteredSpas.find((s) => s.id === selectedSpaId);
        if (!selectedSpa && value) {
          setSelectedSpaId(null);
          clearSpaData();
        }
      }
    },
    [debouncedSpaSearch, selectedSpaId, clearSpaData, filteredSpas]
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
    const requestName =
      formData.manager_name ||
      formData.candidate_name ||
      formData.recipient_name ||
      formData.employee_name ||
      formData.customer_name ||
      formData.name ||
      '';
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
    const requestName =
      formData.manager_name ||
      formData.candidate_name ||
      formData.recipient_name ||
      formData.employee_name ||
      formData.customer_name ||
      formData.name ||
      '';
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
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-info-light)] px-3 py-6 md:px-6">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Top bar */}
        <div
          className="rounded-2xl shadow-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] px-4 py-4 md:px-6 md:py-5"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/certificates')}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-secondary)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <HiArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <div className="hidden md:block">
                <h1 className="text-base md:text-lg font-semibold text-[var(--color-text-primary)]">
                  Create Certificate
                </h1>
                <p className="text-xs md:text-sm text-[var(--color-text-secondary)]">
                  Select a template and fill the details to generate a certificate.
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-end md:justify-end">
              <div className="w-full md:w-64">
                <label
                  className="block text-xs font-medium mb-1 text-[var(--color-text-secondary)]"
                >
                  Template
                </label>
                <select
                  value={selectedTemplateId || ''}
                  onChange={handleTemplateChange}
                  className="w-full rounded-xl border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] shadow-sm outline-none focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 md:gap-3 md:ml-2">
                <button
                  onClick={onPreview}
                  disabled={state === FORM_STATES.PREVIEW || state === FORM_STATES.GENERATING}
                  className="flex-1 md:flex-none rounded-xl px-3 py-2 text-sm font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed bg-[var(--color-primary-light)] text-[var(--color-text-inverse)] hover:bg-[var(--color-primary)] transition-colors"
                >
                  {state === FORM_STATES.PREVIEW ? 'Previewing…' : 'Preview'}
                </button>
                <button
                  onClick={onGenerate}
                  disabled={state === FORM_STATES.PREVIEW || state === FORM_STATES.GENERATING}
                  className="flex-1 md:flex-none rounded-xl px-3 py-2 text-sm font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed bg-[var(--color-info)] text-[var(--color-text-inverse)] hover:bg-[var(--color-info-dark)] transition-colors"
                >
                  {state === FORM_STATES.GENERATING ? 'Generating…' : 'Generate PDF'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-[var(--color-error)] bg-[var(--color-error-light)] px-3 py-2 text-sm text-[var(--color-error-dark)]">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-3 rounded-lg border border-[var(--color-success)] bg-[var(--color-success-light)] px-3 py-2 text-sm text-[var(--color-success-dark)]">
              {success}
            </div>
          )}
        </div>

        {/* SPA selection */}
        {shouldRequireSpa && (
          <div className="rounded-2xl shadow-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] p-4 md:p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm md:text-base font-semibold text-[var(--color-text-primary)]">
                  Select SPA Location
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Search and pick the SPA details that will be used on this certificate.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative spa-dropdown-container">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <svg
                      className="h-4 w-4 md:h-5 md:w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={spaSearch}
                    onChange={handleSpaSearchChange}
                    placeholder="Search by name, code, area, or city..."
                    className="w-full rounded-xl border-2 px-9 pr-10 py-2.5 text-sm outline-none transition-all shadow-sm bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                    style={{
                      borderColor: !selectedSpaId && !spaSearch
                        ? 'var(--color-error-light)'
                        : selectedSpaId
                        ? 'var(--color-success)'
                        : 'var(--color-border-secondary)',
                    }}
                    onFocus={() => setShowSpaDropdown(true)}
                  />
                  {selectedSpaId && (
                    <button
                      type="button"
                      onClick={() => handleSpaSelect(null)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors"
                      title="Clear selection"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                  {spaSearch && (
                    <span className="absolute right-11 top-1/2 -translate-y-1/2 rounded-lg px-2 py-0.5 text-[10px] font-medium bg-[var(--color-info-light)] text-[var(--color-info-dark)]">
                      {filteredSpas.length} {filteredSpas.length === 1 ? 'result' : 'results'}
                    </span>
                  )}
                </div>

                {showSpaDropdown && (spaSearch || !selectedSpaId) && (
                  <div className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] shadow-xl">
                    {spaLoading ? (
                      <div className="p-4 text-center text-[var(--color-text-secondary)] text-sm">
                        <div className="mx-auto mb-2 h-5 w-5 animate-spin rounded-full border-2 border-b-transparent" />
                        Loading SPA locations...
                      </div>
                    ) : filteredSpas.length > 0 ? (
                      <ul className="py-1">
                        {filteredSpas.map((spa) => (
                          <li
                            key={spa.id}
                            onClick={() => handleSpaSelect(spa.id)}
                            className="cursor-pointer px-3 py-2.5 text-sm transition-colors"
                            style={{
                              backgroundColor:
                                selectedSpaId === spa.id
                                  ? 'var(--color-info-light)'
                                  : 'transparent',
                            }}
                          >
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[var(--color-text-primary)]">
                                  {spa.name}
                                </span>
                                {spa.code && (
                                  <span className="rounded-full bg-[var(--color-gray-100)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-secondary)]">
                                    Code: {spa.code}
                                  </span>
                                )}
                                {selectedSpaId === spa.id && (
                                  <span className="rounded-full bg-[var(--color-success-light)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-success-dark)]">
                                    Selected
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 text-[11px] text-[var(--color-text-secondary)]">
                                {spa.area && <span>{spa.area}</span>}
                                {spa.city && <span>{spa.city}</span>}
                                {spa.state && <span>{spa.state}</span>}
                              </div>
                              {spa.address && (
                                <p className="truncate text-[11px] text-[var(--color-text-tertiary)]">
                                  {spa.address}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : spaSearch ? (
                      <div className="p-3 text-center text-xs text-[var(--color-text-secondary)]">
                        <p>No SPAs found matching “{spaSearch}”.</p>
                        <p className="mt-1 text-[var(--color-text-tertiary)]">
                          Try a different search term.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 text-center text-xs text-[var(--color-text-secondary)]">
                        No SPA locations available.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedSpa && (
                <div className="mt-2 rounded-2xl border border-[var(--color-border-secondary)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm md:text-base font-semibold text-[var(--color-text-primary)]">
                          {selectedSpa.name}
                        </h4>
                        {selectedSpa.code && (
                          <span className="rounded-full bg-[var(--color-info-light)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-info-dark)]">
                            Code: {selectedSpa.code}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                        {formatSpaAddress(selectedSpa) || '—'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mt-2 md:mt-0">
                      <div>
                        <p className="text-[10px] font-medium text-[var(--color-text-tertiary)]">
                          Contact
                        </p>
                        <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                          {selectedSpa.phone_number || '—'}
                        </p>
                        {selectedSpa.alternate_number && (
                          <p className="text-[11px] text-[var(--color-text-secondary)]">
                            {selectedSpa.alternate_number}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-[var(--color-text-tertiary)]">
                          Area
                        </p>
                        <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                          {selectedSpa.area || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-[var(--color-text-tertiary)]">
                          City
                        </p>
                        <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                          {selectedSpa.city || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-[var(--color-text-tertiary)]">
                          State
                        </p>
                        <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                          {selectedSpa.state || '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {spaError && (
                <div className="mt-2 rounded-xl border border-[var(--color-error)] bg-[var(--color-error-light)] px-3 py-2 text-xs text-[var(--color-error-dark)]">
                  {spaError}
                </div>
              )}
              {!spaError && !spaLoading && !spas.length && (
                <div className="mt-2 rounded-xl border border-[var(--color-warning)] bg-[var(--color-warning-light)] px-3 py-2 text-xs text-[var(--color-warning-dark)]">
                  No SPA locations available. Please contact administrator.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic form */}
        {FormComponent ? (
          <div className="rounded-2xl shadow-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] p-4 md:p-5">
            <h3 className="mb-3 text-sm md:text-base font-semibold text-[var(--color-text-primary)]">
              {categoryFields?.title ||
                CERTIFICATE_CATEGORY_METADATA[categoryKey]?.title ||
                'Certificate Details'}
            </h3>
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
            <div className="rounded-2xl shadow-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] p-4 md:p-5">
              <h3 className="mb-3 text-sm md:text-base font-semibold text-[var(--color-text-primary)]">
                {categoryFields.title}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {categoryFields.fields.map((field) => (
                  <div key={field.name} className="space-y-1">
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)]">
                      {field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full rounded-xl border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] shadow-sm outline-none focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] shadow-sm outline-none focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                      >
                        {(field.options || []).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] shadow-sm outline-none focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* Fallback invoice items block if no custom FormComponent */}
        {isInvoiceCategory && !FormComponent && (
          <div className="rounded-2xl shadow-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm md:text-base font-semibold text-[var(--color-text-primary)]">
                Invoice Items
              </h3>
              <button
                onClick={addInvoiceItem}
                className="rounded-lg bg-[var(--color-success)] px-3 py-1.5 text-xs md:text-sm font-medium text-[var(--color-text-inverse)] shadow-sm hover:bg-[var(--color-success-dark)] transition-colors"
              >
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {invoiceItems.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 gap-2 md:grid-cols-6 md:items-end"
                >
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateInvoiceItem(idx, 'description', e.target.value)}
                    className="rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] shadow-sm outline-none"
                  />
                  <input
                    type="text"
                    placeholder="HSN"
                    value={item.hsn_code}
                    onChange={(e) => updateInvoiceItem(idx, 'hsn_code', e.target.value)}
                    className="rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] shadow-sm outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateInvoiceItem(idx, 'quantity', e.target.value)}
                    className="rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] shadow-sm outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => updateInvoiceItem(idx, 'rate', e.target.value)}
                    className="rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] shadow-sm outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Amount"
                    value={item.amount}
                    readOnly
                    className="rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] shadow-sm outline-none"
                  />
                  <button
                    onClick={() => removeInvoiceItem(idx)}
                    className="rounded-lg bg-[var(--color-error)] px-3 py-2 text-xs md:text-sm font-medium text-[var(--color-text-inverse)] shadow-sm hover:bg-[var(--color-error-dark)] transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">
                  Subtotal
                </label>
                <input
                  type="text"
                  name="subtotal"
                  value={formData.subtotal || ''}
                  readOnly
                  className="w-full rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] shadow-sm outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">
                  Amount in Words
                </label>
                <input
                  type="text"
                  name="amount_in_words"
                  value={formData.amount_in_words || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] shadow-sm outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCertifications;
