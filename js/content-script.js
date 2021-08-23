var waitForEl = function (selector, callback) {
    if (jQuery(selector).length) {
        callback();
    } else {
        setTimeout(function () {
            waitForEl(selector, callback);
        }, 100);
    }
};

const splitPopup = `
<div id="split" class="center overlay">
    <h3><span id="split-item"></span></h3>
    <h5>Total price: <span class="price"></span></h5>
    <div class="form-container">
        <form id="pick-people">
        </form>
        <form id="name-add">
            <input type="text" id="new-name" name="new-name"><br>
            <input type="submit" value="Add person">
        </form>
    </div>
    <h5>Total price per person: <span class="price"></span> / <span id="num-people"></span> = <span id="price-per-person"></span></h5>
    <button id="split-popup-close">X</button>
</div>  
`;

const totalsPopup = `
<div id="totals" class="center overlay">
    <h3>Totals per person</h3>
    <table id="person-totals">
        <thead>
            <tr>
                <th>Name</th>
                <th>Amount</th>
            <tr>
        </thead>
        <tbody>
        </tbody>
    </table>
    <button id="totals-popup-close">X</button>
</div>  
`;

var pickedPeoplePerItem = {};
var pricePerItem = {};

function calculatePricePerPerson(item) {
    var numPeople = pickedPeoplePerItem[item].size;
    var price = pricePerItem[item];
    return price / numPeople;
}

function getItem(ind) {
    return $(".sc-1pvqt4t-0.sc-ewjm65-5.jZkQzI a span").eq(ind).text();
}

function getPrice(ind) {
    return $("span.sc-ewjm65-8.dSgOCi:eq(" + ind + ")").text();
}

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

    var people;
    chrome.storage.sync.get("people", function (result) {
        if (result.people === undefined) {
            people = [];
        } else {
            people = result.people;
            console.log(people);
        }
        console.log(people);
        people.push(newName);
        chrome.storage.sync.set({
            people: people
        }, function () {
            console.log('People is set to ' + people);
        });
    })


    $("#pick-people").append(`<div class="name-row" id="row-${newName}"><label for="${newName}"  style="word-wrap:break-word"><input type="checkbox" id="${newName}" name="${newName}" value="${newName}"><span>${newName}</span></label><span id="remove-${newName}" class="remove-name">Remove</span></div>`);
    $(`#${newName}`).bind("click", function () {
        var checkboxStatus = $(this).prop("checked");
        handleCheckboxChange(newName, checkboxStatus);
    });
    $(`#remove-${newName}`).bind("click", function () {
        $(`#row-${newName}`).remove();

        chrome.storage.sync.get("people", function (result) {
            people = result.people;
            people = people.filter(function(item) {
                return item !== newName
            })
            chrome.storage.sync.set({
                people: people
            }, function () {
                console.log('People is set to ' + people);
            });
        })
    });

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

// wait for cart items to appear
waitForEl(".sc-ewjm65-7", function () {
    // begin html injection
    $("body").append(splitPopup);
    $("body").append(totalsPopup);
    $(".sc-ewjm65-7").append('<div class="center-text"><span class="split-btn">Split</span></div>');
    $(".sc-41c2f-4.kNeyVG").append('<button id="totals-btn" class="default-button">View totals per person</button>');

    // configure people from storage
    var people;
    chrome.storage.sync.get("people", function (result) {
        if (result.people === undefined) {
            people = [];
        } else {
            people = result.people;
        }
        people.forEach((newName) => {
            $("#pick-people").append(`<div class="name-row" id="row-${newName}"><label for="${newName}"  style="word-wrap:break-word"><input type="checkbox" id="${newName}" name="${newName}" value="${newName}"><span>${newName}</span></label><span id="remove-${newName}" class="remove-name">Remove</span></div>`);
            $(`#${newName}`).bind("click", function () {
                var checkboxStatus = $(this).prop("checked");
                handleCheckboxChange(newName, checkboxStatus);
            });
            $(`#remove-${newName}`).bind("click", function () {
                $(`#row-${newName}`).remove();
        
                chrome.storage.sync.get("people", function (result) {
                    people = result.people;
                    people = people.filter(function(item) {
                        return item !== newName
                    })
                    chrome.storage.sync.set({
                        people: people
                    }, function () {
                        console.log('People is set to ' + people);
                    });
                })
            });
        })
    })

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
        $(".sc-ewjm65-7").each((ind, el) => {
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