var waitForEl = function (selector, callback) {
    if (jQuery(selector).length) {
        callback();
    } else {
        setTimeout(function () {
            waitForEl(selector, callback);
        }, 100);
    }
};

function getItem(ind) {
    return $(`.${ITEM_NAME_CLASSES} a span`).eq(ind).text();
}

function getPrice(ind) {
    return $(`span.${PRICE_CLASS}:eq(` + ind + `)`).text();
}

function addPersonToStorage(name) {
    var people;
    chrome.storage.sync.get("people", function (result) {
        if (result.people === undefined) {
            people = [];
        } else {
            people = result.people;
        }
        people.push(name);
        chrome.storage.sync.set({
            people: people
        }, function () {
            console.log('People is set to ' + people);
        });
    });
}

function removePersonFromStorage(name) {
    chrome.storage.sync.get("people", function (result) {
        people = result.people;
        people = people.filter(function(item) {
            return item !== name
        });
        chrome.storage.sync.set({
            people: people
        }, function () {
            console.log('People is set to ' + people);
        });
    });
}
