"""
WSGI config for the backend project.

This module exposes the WSGI callable as a module-level variable named
``application`` so a WSGI server (Gunicorn, uWSGI, etc.) can serve the project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

application = get_wsgi_application()
