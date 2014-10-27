/* jshint node:true */
/* global describe:true, it:true, after:true */
"use strict";

var assert = require('assert');
var processChatAsync = require('../lib/process-chat-async');
var fs = require('fs');
var path = require('path');

describe('process-chat-async', function() {

  var dir = path.join(__dirname, 'markdown-conversions');

  var items = fs.readdirSync(dir);
  items.filter(function(file) {
    return /\.markdown$/.test(file);
  }).forEach(function(file) {
    var markdownFile = path.join(dir, file);
    var htmlFile = markdownFile.replace('.markdown', '.html');
    var markdown = fs.readFileSync(markdownFile, { encoding: 'utf8' });
    var expectedHtml = fs.readFileSync(htmlFile, { encoding: 'utf8' });

    it('should handle ' + file, function(done) {
      processChatAsync(markdown)
        .then(function(result) {
          var html = result.html;
          assert.equal(html.trim(), expectedHtml.trim());
        })
        .nodeify(done);
    });

  });

  it('should detect japanese', function(done) {
    processChatAsync("世界こんにちは、お元気ですか？")
      .then(function(result) {
        assert.equal(result.lang, 'ja');
      })
      .nodeify(done);
  });

  it('should detect korean', function(done) {
    processChatAsync("세계 안녕하세요, 어떻게 지내 ?")
      .then(function(result) {
        assert.equal(result.lang, 'ko');
      })
      .nodeify(done);
  });

  it('should detect russian', function(done) {
    processChatAsync("Привет мир , как ты?")
      .then(function(result) {
        assert.equal(result.lang, 'ru');
        return processChatAsync("1. Привет мир , как ты?");
      })
      .nodeify(done);
  });

  it('should detect chinese (simplified)', function(done) {
    processChatAsync("您好，欢迎来到小胶质")
      .then(function(result) {
        assert.equal(result.lang, 'zh');
      })
      .nodeify(done);
  });

  it('should detect chinese (traditional)', function(done) {
    processChatAsync("您好，歡迎來到小膠質")
      .then(function(result) {
        assert.equal(result.lang, 'zh-Hant');
      })
      .nodeify(done);
  });

  it('should detect afrikaans', function(done) {
    processChatAsync("hoe is jy meneer?")
      .then(function(result) {
        assert.equal(result.lang, 'af');
        return processChatAsync("## hoe is jy meneer?");
      })
      .then(function(result) {
        assert.equal(result.lang, 'af');
      })
      .nodeify(done);
  });

});
