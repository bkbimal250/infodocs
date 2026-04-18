"""
Analytics Service
Optimized business logic for analytics using parallel query execution.
"""
import asyncio
import logging
from typing import Dict, Any, List
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession

from apps.forms_app.models import Hiring_Form, SPA
from apps.StaffManagement.models import Staff, StaffStatusEnum
from apps.users.models import User
from apps.Query.models import Query
from apps.certificates.models import (
    SpaTherapistCertificate, ManagerSalaryCertificate,
    ExperienceLetterCertificate, AppointmentLetterCertificate,
    InvoiceSpaBillCertificate, IDCardCertificate,
    DailySheetCertificate, UndertakingSheet, JobformSheet,
    GeneratedCertificate, CertificateCategory, CertificateTemplate
)

logger = logging.getLogger(__name__)

class AnalyticsService:
    @staticmethod
    async def get_overall_analytics(db: AsyncSession) -> Dict[str, Any]:
        """
        Get aggregated counts across the system.
        Uses asyncio.gather for parallel database execution to minimize latency.
        """
        try:
            # 1. Base statements
            stmts = [
                select(func.count(Hiring_Form.id)),         # 0
                select(func.count(Staff.id)),               # 1
                select(func.count(Staff.id)).where(Staff.current_status == StaffStatusEnum.active), # 2
                select(func.count(User.id)),                # 3
                select(func.count(User.id)).where(User.is_active == True), # 4
                select(func.count(Query.id)),               # 5
                select(func.count(Query.id)).where(Query.status == "pending"), # 6
                select(func.count(SPA.id)).where(SPA.is_active == True), # 7
                select(func.count(CertificateTemplate.id)) # 8
            ]
            
            # 2. Certificate models statements
            cert_models = [
                SpaTherapistCertificate, ManagerSalaryCertificate,
                ExperienceLetterCertificate, AppointmentLetterCertificate,
                InvoiceSpaBillCertificate, IDCardCertificate,
                DailySheetCertificate, UndertakingSheet, JobformSheet,
                GeneratedCertificate
            ]
            
            for model in cert_models:
                stmts.append(select(func.count(model.id)))
            
            # Execute all queries sequentially
            results = []
            for stmt in stmts:
                results.append(await db.execute(stmt))
            
            # Extract results
            counts = [r.scalar() for r in results]
            
            # Certificate counts start at index 9 (8 base + 1 template)
            total_certificates = sum(counts[9:])
            
            return {
                "total_forms": counts[0],
                "total_hiring_forms": counts[0], # Alias for frontend consistency
                "total_staff": counts[1],
                "active_staff": counts[2],
                "total_users": counts[3],
                "active_users": counts[4],
                "total_queries": counts[5],
                "pending_queries": counts[6],
                "total_spas": counts[7], # Using active spas count for "total spas" in dash if needed
                "active_spas": counts[7],
                "total_templates": counts[8],
                "total_certificates": total_certificates
            }
        except Exception as e:
            logger.error(f"Error in get_overall_analytics: {str(e)}", exc_info=True)
            raise

    @staticmethod
    async def get_candidate_analytics(db: AsyncSession) -> Dict[str, Any]:
        """
        Analytics focused on hiring forms and candidate pipeline.
        """
        # For now, simple count by role
        query = select(Hiring_Form.for_role, func.count(Hiring_Form.id)).group_by(Hiring_Form.for_role)
        result = await db.execute(query)
        role_breakdown = {row[0]: row[1] for row in result.all()}
        
        return {
            "role_breakdown": role_breakdown,
            "total_requirements": sum(role_breakdown.values())
        }

    @staticmethod
    async def get_certificate_analytics(db: AsyncSession) -> Dict[str, Any]:
        """
        Breakdown of generated certificates by type.
        """
        # Since certificates are in separate tables, we use the same parallel counting approach
        cert_mappings = [
            (CertificateCategory.SPA_THERAPIST, SpaTherapistCertificate),
            (CertificateCategory.MANAGER_SALARY, ManagerSalaryCertificate),
            (CertificateCategory.EXPERIENCE_LETTER, ExperienceLetterCertificate),
            (CertificateCategory.APPOINTMENT_LETTER, AppointmentLetterCertificate),
            (CertificateCategory.INVOICE_SPA_BILL, InvoiceSpaBillCertificate),
            (CertificateCategory.ID_CARD, IDCardCertificate),
            (CertificateCategory.DAILY_SHEET, DailySheetCertificate),
            (CertificateCategory.UNDER_TAKING_SHEET, UndertakingSheet),
            (CertificateCategory.JOB_FORM_SHEET, JobformSheet)
        ]
        
        stmts = [select(func.count(model.id)) for _, model in cert_mappings]
        results = []
        for stmt in stmts:
            results.append(await db.execute(stmt))
        
        breakdown = {}
        for i, (cat_label, _) in enumerate(cert_mappings):
            breakdown[cat_label.value] = results[i].scalar()
            
        return {
            "breakdown": breakdown,
            "total": sum(breakdown.values())
        }

    @staticmethod
    async def get_consolidated_overview(db: AsyncSession) -> Dict[str, Any]:
        """
        Get all analytics (overall, candidates, certificates) in a single response.
        Optimized with comprehensive parallel execution.
        """
        try:
            # 1. Base statements
            base_stmts = [
                select(func.count(Hiring_Form.id)),         # 0
                select(func.count(Staff.id)),               # 1
                select(func.count(Staff.id)).where(Staff.current_status == StaffStatusEnum.active), # 2
                select(func.count(User.id)),                # 3
                select(func.count(User.id)).where(User.is_active == True), # 4
                select(func.count(Query.id)),               # 5
                select(func.count(Query.id)).where(Query.status == "pending"), # 6
                select(func.count(SPA.id)).where(SPA.is_active == True), # 7
                select(func.count(CertificateTemplate.id)), # 8
                # Candidate breakdown
                select(Hiring_Form.for_role, func.count(Hiring_Form.id)).group_by(Hiring_Form.for_role) # 9
            ]
            
            # 2. Certificate mappings
            cert_mappings = [
                (CertificateCategory.SPA_THERAPIST, SpaTherapistCertificate),
                (CertificateCategory.MANAGER_SALARY, ManagerSalaryCertificate),
                (CertificateCategory.EXPERIENCE_LETTER, ExperienceLetterCertificate),
                (CertificateCategory.APPOINTMENT_LETTER, AppointmentLetterCertificate),
                (CertificateCategory.INVOICE_SPA_BILL, InvoiceSpaBillCertificate),
                (CertificateCategory.ID_CARD, IDCardCertificate),
                (CertificateCategory.DAILY_SHEET, DailySheetCertificate),
                (CertificateCategory.UNDER_TAKING_SHEET, UndertakingSheet),
                (CertificateCategory.JOB_FORM_SHEET, JobformSheet),
                (None, GeneratedCertificate)
            ]
            
            # Combine all statements
            all_stmts = base_stmts + [select(func.count(model.id)) for _, model in cert_mappings]
            
            # Execute queries sequentially for session stability
            results = []
            for stmt in all_stmts:
                results.append(await db.execute(stmt))
            
            # Extract data
            counts = [r.scalar() if i != 9 else r.all() for i, r in enumerate(results)]
            
            # Candidate breakdown processing
            candidate_results = counts[9]
            candidate_breakdown = {row[0]: row[1] for row in candidate_results}
            
            # Certificate breakdown processing
            cert_start_idx = len(base_stmts)
            cert_breakdown = {}
            total_certificates = 0
            for i, (cat_label, _) in enumerate(cert_mappings):
                count = counts[cert_start_idx + i]  # Use pre-fetched count from 'counts' list
                if cat_label:
                    cert_breakdown[cat_label.value] = count
                total_certificates += count

            return {
                "overall": {
                    "total_forms": counts[0],
                    "total_hiring_forms": counts[0],
                    "total_staff": counts[1],
                    "active_staff": counts[2],
                    "total_users": counts[3],
                    "active_users": counts[4],
                    "total_queries": counts[5],
                    "pending_queries": counts[6],
                    "total_spas": counts[7],
                    "active_spas": counts[7],
                    "total_templates": counts[8],
                    "total_certificates": total_certificates
                },
                "candidates": {
                    "role_breakdown": candidate_breakdown,
                    "total_requirements": sum(candidate_breakdown.values())
                },
                "certificates": {
                    "breakdown": cert_breakdown,
                    "total": total_certificates
                }
            }
        except Exception as e:
            logger.error(f"Error in get_consolidated_overview: {str(e)}", exc_info=True)
            raise
