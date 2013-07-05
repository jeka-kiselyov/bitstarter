#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var util = require('util');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = false;
var OUTFILE_DEFAULT = false;

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertURLValid = function(url) {
   var ret = url.toString();
   return ret;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioHtmlString = function(string) {
    return cheerio.load(string);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtml = function($, checksfile) {
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    return checkHtml($, checksfile);
};

var checkHtmlString = function(string, checksfile) {
    $ = cheerioHtmlString(string);
    return checkHtml($, checksfile);
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};


if(require.main == module) {
  program
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-o, --output <file>', 'Save output as file', null, OUTFILE_DEFAULT)
    .option('-u, --url <url>', 'URL of html file', clone(assertURLValid), URL_DEFAULT)
    .parse(process.argv);

    if (program.url)
    {
      var restResponse = function(result, response) {
        if (result instanceof Error)
          console.error('Error: ' + util.format(response.message));
        else
        {
          var checkJson = checkHtmlString(result, program.checks);
          var outJson = JSON.stringify(checkJson, null, 4);
          console.log(outJson);

          if (program.output)
            fs.writeFileSync(program.output, outJson);
        }
      };

      rest.get(program.url).on('complete', restResponse);
    } else {
      var checkJson = checkHtmlFile(program.file, program.checks);
      var outJson = JSON.stringify(checkJson, null, 4);
      console.log(outJson);

      if (program.output)
        fs.writeFileSync(program.output, outJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
