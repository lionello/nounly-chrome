chrome.omnibox.setDefaultSuggestion({ description: "Go to stinkybad %s" });

chrome.omnibox.onInputEntered.addListener(function (text, disposition) {
    if (/^[a-zA-z]+([- ][a-zA-z]+)* *$/.test(text)) {
        chrome.tabs.create({ url: "http://stinkybad.com/" + text });
    }
    else {
        chrome.tabs.create({ url: "http://stinkybad.com/?" + encodeURIComponent(text) });
    }
});