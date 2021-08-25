var pickedPeoplePerItem = {};
var pricePerItem = {};

/**************************
 * BEGIN HELPERS
 **************************/
function calculatePricePerPerson(item) {
    var numPeople = pickedPeoplePerItem[item].size;
    var price = pricePerItem[item];
    return price / numPeople;
}

function generatePickPersonRow(newName) {
    $("#pick-people").append(
        `<div class="name-row" id="row-${newName}">
            <label for="${newName}"  style="word-wrap:break-word">
                <input type="checkbox" id="${newName}" name="${newName}" value="${newName}">
                <span>${newName}</span>
            </label>
            <span id="remove-${newName}" class="remove-name">Remove</span>
        </div>`);
    $(`#${newName}`).bind("click", function () {
        var checkboxStatus = $(this).prop("checked");
        handleCheckboxChange(newName, checkboxStatus);
    });
    $(`#remove-${newName}`).bind("click", function () {
        $(`#row-${newName}`).remove();
        removePersonFromStorage(newName);
    });
}

/**************************
 * BEGIN ACTION HANDLERS
 **************************/
function handleCheckboxChange(name, checkboxStatus) {
    var item = $("#split-item").text();
    if (checkboxStatus) {
        if (item in pickedPeoplePerItem) {
            pickedPeoplePerItem[item].add(name);
        } else {
            pickedPeoplePerItem[item] = new Set([name]);
        }
    } else {
        pickedPeoplePerItem[item].delete(name);
    }

    if (item in pickedPeoplePerItem) {
        var numPeople = pickedPeoplePerItem[item].size;
        $("#num-people").text(numPeople);
        var pricePerPerson = calculatePricePerPerson(item);
        $("#price-per-person").text(pricePerPerson);
    } else {
        $("#num-people").text("");
        $("#price-per-person").text("");
    }
}

function handleNameAdd() {
    var newName = $("#new-name").val().trim();
    if (newName == "") {
        return;
    }

    addPersonToStorage(newName);
    generatePickPersonRow(newName);

    // clear the textbox
    $("#name-add").trigger("reset");
}

function handleSplitClick(ind) {
    var item = getItem(ind);
    var price = getPrice(ind);

    $("#split-item").text(item);
    $(".price").text(price);
    $("#split").css("display", "block");

    // reset the checkboxes
    $("#pick-people").trigger("reset");
    // check off the people who selected this item
    if (item in pickedPeoplePerItem) {
        pickedPeoplePerItem[item].forEach((name) => {
            $(`#${name}`).prop("checked", true);
        });
    }

    if (item in pickedPeoplePerItem) {
        var numPeople = pickedPeoplePerItem[item].size;
        $("#num-people").text(numPeople);
        var pricePerPerson = calculatePricePerPerson(item);
        $("#price-per-person").text(pricePerPerson);
    } else {
        $("#num-people").text("");
        $("#price-per-person").text("");
    }

    if (!(item in pricePerItem)) {
        pricePerItem[item] = Number(price.replace(/[^0-9.-]+/g, ""));
    }
}

function handleTotalsClick() {
    $("#totals").css("display", "block");
    $('#person-totals tbody').empty();

    var moneyOwedPerPerson = {};
    for (var item in pickedPeoplePerItem) {
        pricePerPerson = calculatePricePerPerson(item);
        pickedPeoplePerItem[item].forEach((person) => {
            if (person in moneyOwedPerPerson) {
                moneyOwedPerPerson[person] += pricePerPerson;
            } else {
                moneyOwedPerPerson[person] = pricePerPerson;
            }
        });
    }

    for (var person in moneyOwedPerPerson) {
        $("#person-totals tbody").append(`<tr><td>${person}</td><td>${moneyOwedPerPerson[person]}</td></tr>`)
    }
}

/**************************
 * BEGIN CONTENT SCRIPT
 **************************/

// wait for cart items to appear
waitForEl(`${ITEM_CLASS}`, function () {
    // begin html injection
    $("body").append(splitPopup);
    $("body").append(totalsPopup);
    $(`${ITEM_CLASS}`).append('<div class="center-text"><span class="split-btn">Split</span></div>');
    $(`${CART_CLASSES}`).append('<button id="totals-btn" class="default-button">View totals per person</button>');

    // configure people from storage
    var people;
    chrome.storage.sync.get("people", function (result) {
        if (result.people === undefined) {
            people = [];
        } else {
            people = result.people;
        }
        people.forEach((newName) => {
            generatePickPersonRow(newName);
        });
    });

    // begin button bindings
    $('#split-popup-close').bind('click', function () {
        $("#split").css("display", "none");
    });

    $('#totals-popup-close').bind('click', function () {
        $("#totals").css("display", "none");
    });

    $('.split-btn').bind('click', function () {
        var ind = $(this).index(".split-btn");
        handleSplitClick(ind);
    });

    $("#totals-btn").bind("click", function () {
        handleTotalsClick();
    });

    $("#name-add").submit(function (event) {
        event.preventDefault();
        handleNameAdd();
    });
});

function checkDOMChange() {
    console.log("calling")
    try {
        $(`${ITEM_CLASS}`).each((ind, el) => {
            if ($(el).find('span.split-btn').length == 0) {
                $(el).append('<div class="center-text"><span class="split-btn">Split</span></div>');
            }
        });
    } catch (e) {
        // ignore the error and continue calling the function
    }
    setTimeout(checkDOMChange, 1000);
}

checkDOMChange();