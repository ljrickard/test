from tp_python_stripe_example.settings.base import *

DEBUG = os.environ.get("DEBUG", False)

ALLOWED_HOSTS = []

SECRET_KEY = os.environ.get("SECRET_KEY", "")

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.10/howto/static-files/

STATIC_URL = '/static/'

# Stripe keys in prod are taken from environment variables
STRIPE_PUBLISHABLE = os.getenv('STRIPE_PUBLISHABLE', '')
STRIPE_SECRET = os.getenv('STRIPE_SECRET', '')
