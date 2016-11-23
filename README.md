# Testing Pays
<img src="TestingPaysLogo.png" width="250" height="200" align="right">
> Demonstrating how Testing Pays API can be used to test Stripe's payment processor.

## Requirements

Python 3.4.3 or later is required to run this application. You can have multiple Python versions (2.x and 3.x) installed on the same system without problems. See [Python Virtual Environments](http://docs.python-guide.org/en/latest/dev/virtualenvs/) for more information.

## Running

```
$ pip install -r requirements.txt

$ python manage.py runserver 8000 --settings=tp_python_stripe_example.settings.dev
```

See [requirements.txt](requirements.txt) above for required packages or install using pip install as shown above. Prior to running the server it is necessary to add your Stripe publishable key and your [Testing Pays API key](https://admin.testingpays.com). 

## Updating API Keys

```python
STRIPE_PUBLISHABLE = os.getenv('STRIPE_PUBLISHABLE', '<insert-your-publishable-stripe-key-here>')

# Testing Pays Configurations

# Use your Testing Pays API key here
STRIPE_SECRET = os.getenv('STRIPE_SECRET', 'insert-your-private-stripe-key-here')

# Set the base URL to Testing Pays API
STRIPE_BASE_URL = "https://api.testingpays.com/stripe"


```

The [dev.py](tp_python_stripe_example/settings/dev.py) within the settings folder allows for testing settings to be kept separate from production settings. Update both the `STRIPE_PUBLISHABLE` key that you got from Stripe and `STRIPE_SECRET` key available from Testing Pays within the `dev.py` file. The Stripe base url is also updated within the dev settings file to point to the Testing Pays API. 

```javascript
Stripe.setPublishableKey('<insert-your-publishable-stripe-key-here>');
```

In addition, update the `Stripe.setPublishableKey` with your Stripe Publishable key in the [donations.js](python_stripe_payment/static/js/donations.js)
file. 

## Production versus Development Environments

```python
@require_http_methods(['POST'])
def donations(request):
    if settings.STRIPE_BASE_URL:
        stripe.api_base = settings.STRIPE_BASE_URL

    try:
        stripe.Charge.create(
            amount=remove_decimal_places(extract_amount(request)),
            currency='EUR',
            description='Charge for testing.pays@example.com',
            source=request.POST['stripeToken'],
        )
    except stripe.error.CardError as error:
```

As shown in the code snippet above (see [views.py](python_stripe_payment/views.py)), the `dontations` route checks if the `stripe.api_key` has been set prior to creating the Stripe charge. This `api_key` is only set for development evironments. When running in production the `STRIPE_BASE_URL` will be empty and therefore the default Stripe key will be used.
