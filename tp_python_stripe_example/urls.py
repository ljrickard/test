from django.conf.urls import url
from python_stripe_payment import views as application

urlpatterns = [
    url(r'^$', application.main, name='index'),
    url(r'^donations$', application.donations, name='donations')
]