console.log('gg');
const main = document.querySelector('#main');
const bt = document.querySelector('#bt');

function click() {
    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab) {
            if (tab.url !== 'chrome://newtab/')
                chrome.tabs.get(tab.id, function (e) {
                    console.log(e)
                })
        });
    });
}

bt.addEventListener('click', click);