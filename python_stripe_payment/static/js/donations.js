$(function () {

    /**
     * Clean up state when the modal closes
     * Hide the spinner and message if they are visible
     */
    $('#stripeFormModal').on('hidden.bs.modal', function () {
        hideSpinner();
        hideMessage();
    });

    Stripe.setPublishableKey('<insert-your-publishable-stripe-key-here>');

    /**
     * Take control of the form submission. Prevent the default submission
     * behaviour and retrieve a stripe token first
     */
    $('#stripe-form').submit(function (e) {
        e.preventDefault();
        showSpinner();
        // Charge the user with their inputted details
        createCharge();

        $('#submit-btn').prop("disabled", true);
    });

    /**
     * This function creates a stripe charge request using the Stripe object.
     * This request will call the stripeResponseHandler on completion
     * @method createCharge
     */
    function createCharge() {
        Stripe.card.createToken({
            number: $('#card-number').val(),
            cvc: $('#cvc').val(),
            exp_month: $('#expiry-month').val(),
            exp_year: $('#expiry-year').val()
        }, stripeResponseHandler);
    }

    /**
     * Sends a post request to the donation_controller with the amount and token
     * attributes.
     *
     * @method stripeResponseHandler
     * @param   http_code   status      The http_code returned with the response
     * @param   {}          response    The response from the api
     */
    function stripeResponseHandler(status, response) {
        if (response.error) {
            // Show the errors on the form
            $("#form-errors").show();
            $('#form-errors').html(response.error.message);

        } else {
            // Send a post request to the charges route
            $.post('/donations', {stripeToken: response.id, amount: $('#amount').val()})
                .done(res => showSuccess(res.responseText))
                .fail(err => handleErrors(err))
                .always(function () {
                    $('#submit-btn').prop("disabled", false);
                });
        }
    };

    function showSuccess(res) {
        // Hide the spinner
        hideSpinner();

        // Show the user the success message
        showMessage('The charge was successful, thank you for donating.');
    };

    /**
     * Sorts through the error retrieved from the stripe charge and executes
     * the nessecary methods
     * @method handleErrors
     * @param  {}     err     error object returned from the stripe charge
     */
    function handleErrors(err) {
        switch (err.type) {
            case "card_error":
                handleCardErrors(err);
                break;

            case "invalid_request_error":
                // The user sent an invalid request, highlight all fields
                fields = [
                    'card-holder-name',
                    'card-number',
                    'cvc',
                    'expiry-month',
                    'expiry-year'
                ];
                highlightFields(fields);
                break;

            case "rate_limit_error":
                // Wait two seconds and retry the transaction
                retry();
                break;

            case "authentication_error":
                // Wait two seconds and retry the transaction
                retry();
                break;

            case "api_connection_error":
                // Wait two seconds and retry the transaction
                retry();
                break;

            case "api_error":
                // Wait two seconds and retry the transaction
                retry();
                break;

            default:
                // Wait two seconds and retry the transaction
                retry();
        }
    };

    /**
     * Sorts the possible errors returned from the stripe response which are
     * related to the users card.
     * @method handleCardErrors
     * @param  {}     err     error object returned from the stripe charge
     * NOTE : 'invalid_zip' and 'missing' codes are not listed below. We do not take the
     * users zip number and missing only applies when using Stripe Customers.
     */
    function handleCardErrors(err) {
        // Handle the card errors
        switch (err.code) {
            case ('invalid_number' || 'incorrect_number'):
                highlightFields(['card-number']);
                break;

            case 'invalid_expiry_month':
                highlightFields(['expiry-month'])
                break;

            case 'invalid_expiry_year':
                highlightFields(['expiry-year'])
                break;

            case ('invalid_cvc' || 'incorrect_cvc'):
                highlightFields(['cvc'])
                break;

            case 'card_declined':
                showMessage('Sorry but your card was declined, please try again or contact your credit card supplier');
                break;

            case 'expired_card':
                showMessage('Sorry but your card has expired, please try again or contact your credit card supplier');
                break;

            case 'processing_error':
                showMessage('Sorry their was an issue processing your card, please try again');
                break;

            // For the default just show a processing error
            default:
                showMessage('Sorry their was an issue processing your card, please try again');
        }
    };

    /**
     * Highlight fields with invalid params.
     * @method highlightFields
     * @return []     fields      A list of all the fields to highlight
     */
    function highlightFields(fields) {
        // Highlight specific/all fields
        fields.forEach((element) => {
            $(`#${element}`).css('border', '1px solid red');
        });

        // Hide the spinner if active
        hideSpinner();
    };

    /**
     * Retry the transaction from scratch with the users inputted details.
     * This method should inform the user that the transaction is taking longer
     * than normal/being re-tried.
     * @method retry
     */
    function retry() {
        // Set the amount to a 00 value for a success response
        $('#amount').val(1.00);

        // Wait two seconds to try and avoid any network issues
        setTimeout(() => {
            // Change the message that the user sees
            $('.payment-text').text('Just a little longer .... ');
            createCharge();
        }, 2000);

        // Put the default text back in the payment text section
        $('#payment-text').text('One moment we are processing your request ...');
    };

    /**
     * Show the spinner and hide the form
     * @method showSpinner
     */
    function showSpinner() {
        $('#spinner-container').show();
        $('#stripe-form').hide();
    };

    /**
     * Hide the spinner and show the form
     * @method hideSpinner
     */
    function hideSpinner() {
        $('#spinner-container').hide();
        $('#stripe-form').show();
    };

    /**
     * Show the user a message based on the error we recieve
     * @method showMessage
     * @param  string     message     The message to show the user
     */
    function showMessage(message) {
        $('#message-text').text(message);

        $('#stripe-form').hide();
        $('#spinner-container').hide();
        $('#message-container').show();
    };

    /**
     * Hide the message from the user and show the form again
     * @method hideMessage
     */
    function hideMessage() {
        $('#message-container').hide();
        $('#stripe-form').show();
    };
});

$(function () {


    // This function gets cookie with a given name
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    var csrftoken = getCookie('csrftoken');

    /*
     The functions below will create a header with csrftoken
     */

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    function sameOrigin(url) {
        // test that a given url is a same-origin URL
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }

    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
                // Send the token to same-origin, relative URLs only.
                // Send the token only if the method warrants CSRF protection
                // Using the CSRFToken value acquired earlier
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

});