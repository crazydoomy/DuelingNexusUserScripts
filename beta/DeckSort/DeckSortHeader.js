// DeckSortHeader.js
// defines the DeckSort constant for other pieces of the code
// as well as other pieces of useful code

const DeckSort = {
    
};
window.DeckSort = DeckSort;
    
const TAG_REGEX = /^\s*\[([^\]]+)\]/;
const isolateTag = function (el) {
    let str = el.textContent === undefined ? el.toString() : el.textContent;
    let [, tag] = str.match(TAG_REGEX) || [];
    return tag || null;
};
DeckSort.isolateTag = isolateTag;

let waitFrame = function () {
    return new Promise(resolve => {
        requestAnimationFrame(resolve); //faster than set time out
    });
};

let waitForElement = async function (selector, source = document) {
    let query;
    while ((query = source.querySelector(selector)) === null) {
        await waitFrame();
    }
    return query;
};

let waitForNoElement = async function (selector, source = document) {
    while (source.querySelector(selector) !== null) {
        await waitFrame();
    }
    return;
};

const loadScript = function (url, cb) {
    let scriptElement = document.createElement("script");
    scriptElement.src = url;
    if(cb) {
        scriptElement.addEventListener("load", cb);
    }
    document.head.appendChild(scriptElement);
};

const requestText = async function (url) {
    let response = await fetch(url);
    let data = await response.text();
    return data;
};

const requestJSON = async function (url) {
    let response = await fetch(url);
    let data = await response.json();
    return data;
};
    
const removeFrom = (arr, val) => arr.splice(arr.indexOf(val), 1);

// TODO: expand
const toHexString = function (color) {
    if(/^#\d{3}$/.test(color)) {
        return color.replace(/\d/g, "$&$&");
    }
    else if(/^rgb\s*\(\d+\s*(,\d+\s*){2}\)$/.test(color)) {
        return "#" + color.match(/\d+/g).map(d => parseInt(d).toString(16).padStart(2, "0")).join("");
    }
    else {
        return color;
    }
};

const waitForElementJQuery = async function (selector, source = $("body")) {
    let query;
    while (source.find(selector).length === 0) {
        await waitFrame();
    }
    return query;
};

const waitForNoElementJQuery = async function (selector, source = $("body")) {
    while (source.find(selector).length !== 0) {
        await waitFrame();
    }
    return;
};