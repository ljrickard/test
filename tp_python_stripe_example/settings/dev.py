from tp_python_stripe_example.settings.base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

SECRET_KEY = os.environ.get("SECRET_KEY", "f4oyu6*ih*nujk_kz!^(d6hpvn3l=a1qrh(e$8x8*y372&^yw5")

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.10/howto/static-files/

STATIC_URL = '/static/'

STRIPE_PUBLISHABLE = os.getenv('STRIPE_PUBLISHABLE', '<insert-your-publishable-stripe-key-here>')

# Testing Pays Configurations

# Use your Testing Pays API key here
STRIPE_SECRET = os.getenv('STRIPE_SECRET', 'insert-your-private-stripe-key-here')

# Set the base URL to Testing Pays API
STRIPE_BASE_URL = "https://api.testingpays.com/stripe"

