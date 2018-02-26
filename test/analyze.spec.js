/* eslint-env mocha */

'use strict';

const assert = require('chai').assert;
const Wappalyzer = require('../src/wappalyzer');

describe('should analyze website elements properly', function () {

  it('should analyze html', async () => {
    const html = `
    <!DOCTYPE HTML>
    <html>
      <head>
        <title>Page title | Html detection </title>
        <meta charset="utf-8" />
      </head>
      <body>
      <h1>Technologies Test Page | Html detection</h1>
      <!-- Google Tag Manager -->
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KAAOEOE"
        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
      <!-- End Google Tag Manager -->
      </body>
    </html>
  `;
    const wappalyzer = new Wappalyzer();
    wappalyzer.apps = {
      "Google Tag Manager": {
        "cats": [
          42
        ],
        "js": {
          "googletag": "",
          "google_tag_manager": ""
        },
        "html": [
          "googletagmanager\\.com/ns\\.html[^>]+></iframe>",
          "<!-- (?:End )?Google Tag Manager -->"
        ],
        "icon": "Google Tag Manager.png",
        "website": "http://www.google.com/tagmanager"
      }
    };
    var applications = null;
    wappalyzer.driver = {
      log () {},
      displayApps (detectedMap) {
        applications = detectedMap;
      }
    };

    await wappalyzer.analyze({ canonical: 'example.com' }, { html });
    assert.equal(applications['Google Tag Manager'].name, 'Google Tag Manager');
  });

  it('should analyze scripts', async () => {
    const scripts = [
      'http://www.google-analytics.com/analytics.js',
      'http://example.com/assets/js/jquery.min.js'
    ];
    const wappalyzer = new Wappalyzer();
    wappalyzer.apps = {
      "Google Analytics": {
        "cats": [
          10
        ],
        "js": {
          "gaGlobal": "",
          "GoogleAnalyticsObject": ""
        },
        "headers": {
          "Set-Cookie": "__utma"
        },
        "icon": "Google Analytics.svg",
        "script": "google-analytics\\.com\\/(?:ga|urchin|(analytics))\\.js\\;version:\\1?UA:",
        "website": "http://google.com/analytics"
      },
      "jQuery": {
        "cats": [
          12
        ],
        "js": {
          "jQuery.fn.jquery": "([\\d.]+)\\;version:\\1"
        },
        "icon": "jQuery.svg",
        "script": [
          "jquery(?:\\-|\\.)([\\d.]*\\d)[^/]*\\.js\\;version:\\1",
          "/([\\d.]+)/jquery(?:\\.min)?\\.js\\;version:\\1",
          "jquery.*\\.js(?:\\?ver(?:sion)?=([\\d.]+))?\\;version:\\1"
        ],
        "website": "https://jquery.com"
      }
    };
    var applications = null;
    wappalyzer.driver = {
      log () {},
      displayApps (detectedMap) {
        applications = detectedMap;
      }
    };

    await wappalyzer.analyze({ canonical: 'example.com' }, { scripts });
    assert.equal(applications['Google Analytics'].name, 'Google Analytics');
    assert.equal(applications['jQuery'].name, 'jQuery');
  });

  it('should analyze headers', async () => {
    const headers = {
      'date': [ 'Thu, 01 Feb 2018 11:34:18 GMT' ],
      'connection': [ 'keep-alive' ],
      'x-powered-by': [ 'Express'],
      'etag': [ 'W/125-1jQLmiya7mfec43xR3Eb3pjdu64s' ],
      'content-length': [ '293' ],
      'content-type': [ 'text/html; charset=utf-8' ]
    };
    const wappalyzer = new Wappalyzer();
    wappalyzer.apps = {
      "Express": {
        "cats": [
          18,
          22
        ],
        "headers": {
          "X-Powered-By": "^Express$"
        },
        "icon": "Express.png",
        "implies": "Node.js",
        "website": "http://expressjs.com"
      }
    };
    var applications = null;
    wappalyzer.driver = {
      log () {},
      displayApps (detectedMap) {
        applications = detectedMap;
      }
    };

    await wappalyzer.analyze({ canonical: 'example.com' }, { headers });
    assert.equal(applications['Express'].name, 'Express');
  });

  it('should analyze js globals', async () => {
    const js = {
      'Moment.js': { 'moment': { '0': true } },
      'Google Font API': { 'WebFonts': { '0': true } }
    };
    const wappalyzer = new Wappalyzer();
    wappalyzer.apps = {
      "Moment.js": {
        "cats": [
          12
        ],
        "js": {
          "moment": "",
          "moment.version": "(.*)\\;version:\\1"
        },
        "icon": "Moment.js.svg",
        "script": "moment(?:\\.min)?\\.js",
        "website": "https://momentjs.com"
      },
      "Google Font API": {
        "cats": [
          17
        ],
        "js": {
          "WebFonts": ""
        },
        "html": "<link[^>]* href=[^>]+fonts\\.(?:googleapis|google)\\.com",
        "icon": "Google Font API.png",
        "script": "googleapis\\.com/.+webfont",
        "website": "http://google.com/fonts"
      }
    };
    var applications = null;
    wappalyzer.driver = {
      log () {},
      displayApps (detectedMap) {
        applications = detectedMap;
      }
    };

    wappalyzer.parseJsPatterns();
    await wappalyzer.analyze({ canonical: 'example.com' }, { js });

    assert.equal(applications['Google Font API'].name, 'Google Font API');
    assert.equal(applications['Moment.js'].name, 'Moment.js');
  });
});
