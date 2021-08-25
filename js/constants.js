const ITEM_NAME_CLASSES = "sc-1pvqt4t-0.sc-ewjm65-5.jZkQzI";
const PRICE_CLASS = "sc-ewjm65-8.dSgOCi";
const ITEM_CLASS = ".sc-ewjm65-7";
const CART_CLASSES = ".sc-41c2f-4.kNeyVG";

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