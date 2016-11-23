from django.shortcuts import render
import stripe
from django.conf import settings
from django.views.decorators.http import require_http_methods
from django.http import HttpResponse

stripe.api_key = settings.STRIPE_SECRET


@require_http_methods(['GET'])
def main(request):
    return render(request, "index.html")


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
        return generate_http_response(extract_error_code(error), error.http_status)
    except stripe.error.RateLimitError as error:
        return generate_http_response(extract_error_code(error), error.http_status)
    except stripe.error.InvalidRequestError as error:
        if not extract_error_code(error):
            return generate_http_response(extract_error_param(error), error.http_status)
        return generate_http_response(extract_error_code(error), error.http_status)
    except stripe.error.AuthenticationError as error:
        return generate_http_response(extract_error_code(error), error.http_status)
    except stripe.error.APIConnectionError as error:
        return generate_http_response(extract_error_code(error), error.http_status)
    except stripe.error.StripeError as error:
        return generate_http_response(extract_error_code(error), error.http_status)
    except Exception as error:
        return generate_http_response(error, 418)

    return render(request, 'index.html')


def extract_amount(request):
    return request.POST['amount']


def extract_error_param(e):
    return e.json_body['error']['param']


def generate_http_response(error_code, http_status):
    return HttpResponse(error_code, content_type="application/json", status=http_status)


def extract_error_code(e):
    return e.json_body['error']['code']


def remove_decimal_places(amount):
    return int(float(amount) * 100)
