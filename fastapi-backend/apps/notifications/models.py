"""
Notification Models
Re-export models from users app for convenience
"""
from apps.users.models import Notification, LoginHistory, UserActivity

__all__ = ["Notification", "LoginHistory", "UserActivity"]

