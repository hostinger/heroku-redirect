var express = require('express');
var query = require('querystring');
var url = require('url');

var app = express();

app.get('*', function (request, response) {

    var id = parseInt(request.url.substr(1).split('.')[0]);

    if (id) {
        var queryParams = {
            rc: id
        };

        if (process.env.UTM_SOURCE) {
            queryParams.utm_source = process.env.UTM_SOURCE;
        } else {
            var referringUrl = url.parse(request.get('Referrer'));

            if (referringUrl.host) {
                queryParams.utm_source = referringUrl.host;
            }
        }

        if (process.env.UTM_CAMPAIGN) {
            queryParams.utm_campaign = process.env.UTM_CAMPAIGN;
        }

        if (process.env.UTM_MEDIUM) {
            queryParams.utm_medium = process.env.UTM_MEDIUM;
        }

        response.redirect(301, process.env.NEW_BASE_URL + '?' + query.stringify(queryParams));

        return;
    }

    response.redirect(process.env.NEW_BASE_URL + request.url)
});

var port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log("Listening on " + port);
});