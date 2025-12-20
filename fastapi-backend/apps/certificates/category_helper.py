"""
Certificate Category Helper Utilities
Makes it easy to add new certificate categories with multiple template variants
Author: Bimal Developer
"""
from typing import Dict, List, Optional, Any
from apps.certificates.models import CertificateCategory, TemplateType
from sqlalchemy.ext.asyncio import AsyncSession
from apps.certificates.services.certificate_service import create_template


async def create_category_templates(
    db: AsyncSession,
    category: CertificateCategory,
    created_by: int,
    templates: List[Dict[str, Any]],
    is_public: bool = True,
    is_active: bool = True
) -> List:
    """
    Helper function to easily create multiple template variants for a category.
    
    Args:
        db: Database session
        category: Certificate category
        created_by: User ID creating the templates
        templates: List of template dictionaries, each with:
            - name: Template name
            - template_variant: Variant name (e.g., "modern", "classic", "v1", "v2")
            - template_html: HTML content (required for HTML type)
            - template_image: Image path (optional, for IMAGE type)
            - template_type: TemplateType.IMAGE or TemplateType.HTML (default: HTML)
            - template_config: Optional config dict
        is_public: Whether templates are public
        is_active: Whether templates are active
    
    Returns:
        List of created template objects
    
    Example:
        await create_category_templates(
            db=db,
            category=CertificateCategory.SPA_THERAPIST,
            created_by=user_id,
            templates=[
                {
                    "name": "Spa Therapist Certificate - Modern",
                    "template_variant": "modern",
                    "template_html": "<html>...</html>",
                    "template_type": TemplateType.HTML
                },
                {
                    "name": "Spa Therapist Certificate - Classic",
                    "template_variant": "classic",
                    "template_html": "<html>...</html>",
                    "template_type": TemplateType.HTML
                },
                {
                    "name": "Spa Therapist Certificate - Minimal",
                    "template_variant": "minimal",
                    "template_html": "<html>...</html>",
                    "template_type": TemplateType.HTML
                }
            ]
        )
    """
    created_templates = []
    
    for template_data in templates:
        template = await create_template(
            db=db,
            name=template_data["name"],
            category=category,
            created_by=created_by,
            template_html=template_data.get("template_html"),
            template_image=template_data.get("template_image"),
            template_type=template_data.get("template_type", TemplateType.HTML),
            template_variant=template_data.get("template_variant"),
            is_active=is_active,
            is_public=is_public,
            template_config=template_data.get("template_config", {})
        )
        created_templates.append(template)
    
    return created_templates


def get_category_template_structure(category: CertificateCategory) -> Dict:
    """
    Get the data structure/fields required for a certificate category.
    This helps understand what data is needed when creating templates.
    
    Returns:
        Dictionary with category information and required fields
    """
    structures = {
        CertificateCategory.SPA_THERAPIST: {
            "name": "Spa Therapist Certificate",
            "fields": [
                "candidate_name",
                "course_name",
                "start_date",
                "end_date",
                "passport_size_photo",
                "candidate_signature"
            ],
            "spa_required": False
        },
        CertificateCategory.MANAGER_SALARY: {
            "name": "Manager Salary Certificate",
            "fields": [
                "manager_name",
                "position",
                "joining_date",
                "monthly_salary",
                "monthly_salary_in_words",
                "month_year_list",
                "month_salary_list"
            ],
            "spa_required": True
        },
        CertificateCategory.EXPERIENCE_LETTER: {
            "name": "Experience Letter",
            "fields": [
                "candidate_name",
                "position",
                "joining_date",
                "end_date",
                "duration",
                "salary"
            ],
            "spa_required": True
        },
        CertificateCategory.APPOINTMENT_LETTER: {
            "name": "Appointment Letter",
            "fields": [
                "employee_name",
                "position",
                "start_date",
                "salary",
                "manager_signature"
            ],
            "spa_required": True
        },
        CertificateCategory.INVOICE_SPA_BILL: {
            "name": "Invoice Spa Bill",
            "fields": [
                "bill_number",
                "card_number",
                "bill_date",
                "payment_mode",
                "customer_name",
                "customer_address",
                "subtotal",
                "amount_in_words",
                "service_names",
                "hsn_codes",
                "quantities",
                "price_rates",
                "amounts"
            ],
            "spa_required": True
        },
        CertificateCategory.ID_CARD: {
            "name": "ID Card",
            "fields": [
                "candidate_name",
                "candidate_photo",
                "designation",
                "date_of_joining",
                "contact_number",
                "issue_date"
            ],
            "spa_required": True
        },
        CertificateCategory.OFFER_LETTER: {
            "name": "Offer Letter",
            "fields": [
                "employee_name",
                "position",
                "start_date",
                "salary"
            ],
            "spa_required": False
        },
        CertificateCategory.DAILY_SHEET: {
            "name": "Daily Sheet",
            "fields": [
                # Daily Sheet only uses SPA data - no specific fields needed
                # Template uses: spa_name, spa_location, daily_sheet_background
            ],
            "spa_required": True
        }
    }
    
    return structures.get(category, {
        "name": "Unknown Category",
        "fields": [],
        "spa_required": False
    })


def generate_template_variant_names(base_name: str, variants: List[str]) -> List[str]:
    """
    Helper to generate template names for multiple variants.
    
    Args:
        base_name: Base template name (e.g., "Spa Therapist Certificate")
        variants: List of variant names (e.g., ["modern", "classic", "minimal"])
    
    Returns:
        List of full template names
    
    Example:
        generate_template_variant_names(
            "Spa Therapist Certificate",
            ["modern", "classic", "minimal"]
        )
        # Returns:
        # [
        #     "Spa Therapist Certificate - Modern",
        #     "Spa Therapist Certificate - Classic",
        #     "Spa Therapist Certificate - Minimal"
        # ]
    """
    return [f"{base_name} - {variant.title()}" for variant in variants]
