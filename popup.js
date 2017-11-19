// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var stinkybad = {

    parse_: function(val) {
        if (/^ *[a-zA-Z]+([- ][a-zA-Z]+)* *$/.test(val))
            return 1;
        if (/^https?:\/\/.+$/.test(val))
            return 2;
        if (/^.+\.[a-z]{2,10}(\/.*)?$/.test(val))
            return 2;
    return 0;
    },

    updateIcon: function (element) {
        var valid = this.parse_(element.value);
        element.className = valid > 0 ? 'fx-validation-valid' : 'fx-validation-invalid';
        return valid;
    },

    submitting: function() {
        var e = document.getElementById('submit');
        e.disabled = true;
        e.value = 'wait...';
    },

    validate: function() {
        var elem = document.getElementById('noun');
        var t = this.updateIcon(elem);
        if (t != 0)
          this.submitting();
        if (t == 1) {
            chrome.tabs.create({ url: "http://nounly.com/" + elem.value });
            window.close();
        }
        return t == 2;
    },

    /**
     *
     * @public
     */
    initx: function () {
        var elem = document.getElementById('noun');
        elem.addEventListener('input', this.onchange_.bind(this));
        elem.addEventListener('change', this.onchange_.bind(this));
        elem.addEventListener('keydown', this.onkeydown_.bind(this));
        elem.addEventListener('focus', function (e) { e.target.select(); });
        elem.focus();
        document.getElementById('submit').addEventListener('click', this.onsubmit_.bind(this));
        document.getElementById('privacy').addEventListener('click', function(e) { chrome.tabs.create({ url: "http://nounly.com/privacy.html" })});
    },

    onchange_: function (e) {
      document.getElementById('tabtitle').innerText = "";
      this.updateIcon(e.target);
    },

    onkeydown_: function (e) {
        if (e.keyCode == 13)
            this.onsubmit_(e);
        return true;
    },

    onsubmit_: function (e) {
        if (!this.validate())
          return;
        var uri = document.getElementById('noun').value;
        var hashKey = CryptoJS.enc.Base64.parse("REPLACE WITH STINKYBAD API KEY");
        var today = new Date();
        var UTCstring = today.toUTCString();
        var hash = CryptoJS.HmacSHA256("POST\n" + UTCstring + "\n/v1/", hashKey);
        var content = JSON.stringify({ 'uri': uri });
        /*var title = document.getElementById('tabtitle').innerText;
        if (title == "") title = null;
        var content = JSON.stringify({ 'uri': uri, 'title': title });*/
        var signature = hash.toString(CryptoJS.enc.Base64);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://api.nounly.com/v1/", true, null, null);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-Date", UTCstring);
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("Authorization", "SharedKey chromeext:" + signature);
        xhr.onload = this.showWord_.bind(this);
        xhr.send(content);
        return false;
    },

    showWord_: function (e) {
        var response = JSON.parse(e.target.responseText);
        var e = document.getElementById('noun');
        e.value = response.code;
        e.select();
        var b = document.getElementById('submit');
        b.disabled = false;
        b.value = "submit";
    },
};

//var bgpage = chrome.extension.getBackgroundPage();

document.addEventListener('DOMContentLoaded', function () {
    stinkybad.initx();
});

/*
chrome.extension.onConnect.addListener(function (port) {
    var tab = port.sender.tab;
    port.onMessage.addListener(function (info) {
      document.getElementById('tabtitle').innerText = info.title;
    });
});
*/

chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  var tab = tabs[0];
  if (tab.url.indexOf("chrome:") != 0)
    document.getElementById('noun').value = tab.url;
  /*if (tab.url.indexOf("http:") != 0 &&
      tab.url.indexOf("https:") != 0) {
  } else {
    chrome.tabs.executeScript(null, {file: "content_script.js"});
  }*/
});

