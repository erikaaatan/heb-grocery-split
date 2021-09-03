var waitForEl = function (selector, callback) {
    if (jQuery(selector).length) {
        callback();
    } else {
        setTimeout(function () {
            waitForEl(selector, callback);
        }, 100);
    }
};

function getAllItemsInCart() {
    return $(`.${ITEM_NAME_CLASSES} a span`).map(function(){
        return $.trim($(this).text());
    }).get();
}

function getItem(ind) {
    return $(`.${ITEM_NAME_CLASSES} a span`).eq(ind).text();
}

function getPrice(ind) {
    return $(`span.${PRICE_CLASS}:eq(` + ind + `)`).text();
}

async function getPeopleFromStorage() {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.sync.get("people", function (value) {
                resolve(value["people"]);
            })
        }
        catch (ex) {
            reject(ex);
        }
    });
}

async function addPersonToStorage(name) {
    var people = await getPeopleFromStorage();
    if (people === undefined) {
        people = [];
    }
    people.push(name);
    chrome.storage.sync.set({
        people: people
    }, function () {
        console.log('People is set to ' + people);
    });
}

async function removePersonFromStorage(name) {
    var people = await getPeopleFromStorage();
    people = people.filter(function(item) {
        return item !== name
    });
    chrome.storage.sync.set({
        people: people
    }, function () {
        console.log('People is set to ' + people);
    });
}

function formatItems(itemList) {
    return itemList.join(", ");
}
