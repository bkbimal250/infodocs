import SpaTherapistCertificateForm from './SpaTherapistCertificateForm';
import ManagerSalaryCertificateForm from './ManagerSalaryCertificateForm';
import ExperienceLetterForm from './ExperienceLetterForm';
import AppointmentLetterForm from './AppointmentLetterForm';
import OfferLetterForm from './OfferLetterForm';
import InvoiceCertificateForm from './InvoiceCertificateForm';
import IdCardForm from './IdCardForm';
import DailySheetForm from './DailySheetForm';
import UnderTakingSheet from './UnderTakingSheet';
import JobFormsheet from './JobFormsheet';
import CertificateFormFields from './CertificateFormFields';
import ImageUpload from './ImageUpload';
import SignatureUpload from './SignatureUpload';
import ImageCrop from './ImageCrop';
import CertificateHeader from './CertificateHeader';
import SpaSelectionField from './SpaSelectionField';
import InvoiceItemsTable from './InvoiceItemsTable';
import { CERTIFICATE_CATEGORIES } from '../../utils/certificateConstants';

export {
  SpaTherapistCertificateForm,
  ManagerSalaryCertificateForm,
  ExperienceLetterForm,
  AppointmentLetterForm,
  OfferLetterForm,
  InvoiceCertificateForm,
  IdCardForm,
  DailySheetForm,
  UnderTakingSheet,
  JobFormsheet,
  CertificateFormFields,
  ImageUpload,
  SignatureUpload,
  ImageCrop,
  CertificateHeader,
  SpaSelectionField,
  InvoiceItemsTable,
};

/**
 * Component Selection Helper
 * 
 * Usage:
 *   const Component = getCertificateFormComponent(certificateType);
 *   <Component formData={data} handleInputChange={handler} />
 */
export const getCertificateFormComponent = (certificateCategoryDisplay) => {
  const components = {
    [CERTIFICATE_CATEGORIES.SPA_THERAPIST]: SpaTherapistCertificateForm,
    [CERTIFICATE_CATEGORIES.MANAGER_SALARY]: ManagerSalaryCertificateForm,
    [CERTIFICATE_CATEGORIES.EXPERIENCE_LETTER]: ExperienceLetterForm,
    [CERTIFICATE_CATEGORIES.APPOINTMENT_LETTER]: AppointmentLetterForm,
    [CERTIFICATE_CATEGORIES.OFFER_LETTER]: OfferLetterForm,
    [CERTIFICATE_CATEGORIES.INVOICE_SPA_BILL]: InvoiceCertificateForm,
    [CERTIFICATE_CATEGORIES.ID_CARD]: IdCardForm,
    [CERTIFICATE_CATEGORIES.DAILY_SHEET]: DailySheetForm,
    [CERTIFICATE_CATEGORIES.UNDER_TAKING_SHEET]: UnderTakingSheet,
    [CERTIFICATE_CATEGORIES.JOB_FORM_SHEET]: JobFormsheet,
  };
  // Return null for categories without a specific component instead of CertificateFormFields object
  return components[certificateCategoryDisplay] || null;
};
