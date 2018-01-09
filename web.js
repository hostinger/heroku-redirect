var express = require('express');
var query = require('querystring');
var url = require('url');
var got = require('got');

var app = express();

function trackEvent (ga_tracking_id, category, action, label, value) {
  const data = {
    // Tracking ID / Property ID.
    tid: ga_tracking_id,
    // Event hit type.
    t: 'pageview'
  };

  return got.post('http://www.google-analytics.com/collect', {
    form: data
  });
}

app.get('*', function (request, response, next) {

    var id = parseInt(request.url.substr(1).split('.')[0]);

    var languageCode = request.headers.host.split('.')[0].toUpperCase();
    var baseUrl = process.env['NEW_BASE_URL_' + languageCode] || process.env['NEW_BASE_URL'];
    var gaTrackingId = process.env['GA_TRACKING_ID_' + languageCode] || process.env['GA_TRACKING_ID']
    
    if (id) {
        var queryParams = {
            rc: id
        };
        
        // Track GA Event
        trackEvent(
            gaTrackingId
        ).catch(next);

        if (process.env.UTM_SOURCE) {
            queryParams.utm_source = process.env.UTM_SOURCE;
        } else {
            var referringUrl = request.get('Referrer');

            if (referringUrl) {
                referringUrl = url.parse(referringUrl);

                if (referringUrl.host) {
                    queryParams.utm_source = referringUrl.host;
                }
            }
        }

        if (process.env.UTM_CAMPAIGN) {
            queryParams.utm_campaign = process.env.UTM_CAMPAIGN;
        }

        if (process.env.UTM_MEDIUM) {
            queryParams.utm_medium = process.env.UTM_MEDIUM;
        }

        response.redirect(301, baseUrl + '?' + query.stringify(queryParams));

        return;
    }

    response.redirect(301, baseUrl + request.url)
});

var port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log("Listening on " + port);
});
