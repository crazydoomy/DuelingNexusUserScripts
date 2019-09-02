const EXT = {
    RESULTS_PER_PAGE: 30,
    MIN_INPUT_LENGTH: 1,
    Search: {
        cache: [],
        current_page: 1,
        max_page: null,
        per_page: null,
        messages: [],
    }
};
const FN = {
    compose: function (f, g) {
        return function (...inputs) {
            return f(g(...inputs));
        }
    },
    not: function (x) {
        return !x;
    }
};


(function () {
    // minified with https://kangax.github.io/html-minifier/
    const ADVANCED_SETTINGS_HTML_STRING = '<div id=rs-ext-advanced-search-bar><button id=rs-ext-monster-toggle class="engine-button engine-button-default">monster</button> <button id=rs-ext-spell-toggle class="engine-button engine-button-default">spell</button> <button id=rs-ext-trap-toggle class="engine-button engine-button-default">trap</button><div id=rs-ext-advanced-pop-outs><div id=rs-ext-spell class="rs-ext-shrinkable rs-ext-shrunk"><p><b>Spell Card Type: </b><select id=rs-ext-spell-type><option><option>Normal<option>Quick-play<option>Field<option>Continuous<option>Ritual<option>Equip</select></div><div id=rs-ext-trap class="rs-ext-shrinkable rs-ext-shrunk"><p><b>Trap Card Type: </b><select id=rs-ext-trap-type><option><option>Normal<option>Continuous<option>Counter</select></div><div id=rs-ext-monster class="rs-ext-shrinkable rs-ext-shrunk"><table class="rs-ext-left-float rs-ext-table"id=rs-ext-link-arrows><tr><th colspan=3>Link Arrows<tr><td><button class=rs-ext-toggle-button>↖</button><td><button class=rs-ext-toggle-button>↑</button><td><button class=rs-ext-toggle-button>↗</button><tr><td><button class=rs-ext-toggle-button>←</button><td><button class=rs-ext-toggle-button id=rs-ext-equals>=</button><td><button class=rs-ext-toggle-button>→</button><tr><td><button class=rs-ext-toggle-button>↙</button><td><button class=rs-ext-toggle-button>↓</button><td><button class=rs-ext-toggle-button>↘</button></table><div id=rs-ext-monster-table class="rs-ext-left-float rs-ext-table"><table><tr><th>Category<td><select class=rs-ext-input id=rs-ext-monster-category><option><option>Normal<option>Effect<option>Non-Effect<option>Link<option>Pendulum<option>Leveled<option>Xyz<option>Synchro<option>Fusion<option>Ritual<option>Gemini<option>Flip<option>Spirit<option>Toon</select><tr><th>Type<td><select id=rs-ext-monster-type class=rs-ext-input><option><option>Aqua<option>Beast<option>Beast-Warrior<option>Cyberse<option>Dinosaur<option>Dragon<option>Fairy<option>Fiend<option>Fish<option>Insect<option>Machine<option>Plant<option>Psychic<option>Pyro<option>Reptile<option>Rock<option>Sea Serpent<option>Spellcaster<option>Thunder<option>Warrior<option>Winged Beast<option>Wyrm<option>Zombie<option>Creator God<option>Divine-Beast</select><tr><th>Attribute<td><select id=rs-ext-monster-attribute class=rs-ext-input><option><option>DARK<option>EARTH<option>FIRE<option>LIGHT<option>WATER<option>WIND<option>DIVINE</select><tr><th>Level/Rank/Link Rating<td><input class=rs-ext-input id=rs-ext-level><tr><th>Pendulum Scale<td><input class=rs-ext-input id=rs-ext-scale disabled><tr><th>ATK<td><input class=rs-ext-input id=rs-ext-atk><tr><th>DEF<td><input class=rs-ext-input id=rs-ext-def></table></div></div></div><div id=rs-ext-spacer></div></div>';
    
    const ADVANCED_SETTINGS_HTML_ELS = jQuery.parseHTML(ADVANCED_SETTINGS_HTML_STRING);
    ADVANCED_SETTINGS_HTML_ELS.reverse();
    
    // minified with cssminifier.com
    const ADVANCED_SETTINGS_CSS_STRING = "#rs-ext-advanced-search-bar{width:100%}.rs-ext-toggle-button{width:3em;height:3em;background:#ddd;border:1px solid #000}.rs-ext-toggle-button:hover{background:#fff}button.rs-ext-selected{background:#00008b;color:#fff}button.rs-ext-selected:hover{background:#55d}.rs-ext-left-float{float:left}.rs-ext-shrinkable{transition:transform .3s ease-out;height:auto;background:#ccc;width:100%;transform:scaleY(1);transform-origin:top;overflow:hidden;z-index:10000}.rs-ext-shrinkable>*{margin:10px}#rs-ext-monster,#rs-ext-spell,#rs-ext-trap{background:rgba(0,0,0,.7)}.rs-ext-shrunk{transform:scaleY(0);z-index:100}#rs-ext-advanced-pop-outs{position:relative}#rs-ext-advanced-pop-outs>.rs-ext-shrinkable{position:absolute;top:0;left:0}#rs-ext-monster-table th{text-align:right;width:30px}.rs-ext-table{padding-right:5px}#rs-ext-spacer{height:0;transition:height .3s ease-out}";
    
    // disable default listener (Z.Pb)
    $("#editor-search-text").off("input");
    
    // VOLATILE FUNCTIONS, MAY CHANGE AFTER A MAIN UPDATE
    const CARD_LIST = X;
    const TYPE_HASH = ag;
    const TYPE_LIST = Object.values(TYPE_HASH);
    
    const ATTRIBUTE_MASK_HASH = Xf;
    
    const ATTRIBUTE_HASH = {};
    for(obfs in Xf) {
        let attr = $f[obfs].toUpperCase();
        ATTRIBUTE_HASH[attr] = ATTRIBUTE_MASK_HASH[obfs];
    }
    
    const attributeOf = function (cardObject) {
        return cardObject.H;
    }
    
    const makeSearchable = function (name) {
        return name.replace(/ /g, "")
                   .toUpperCase();
    }
    
    const searchableCardName = function (id_or_card) {
        let card;
        if(typeof id_or_card === "number") {
            card = CARD_LIST[X];
        }
        else {
            card = id_or_card;
        }
        let searchable = makeSearchable(card.name);
        // cache name
        if(!card.searchName) {
            card.searchName = searchable;
        }
        return searchable;
    }
    
    const monsterType = function (card) {
        return Df[card.race];
    }
    // U provides a map
    // (a.type & U[c]) => (Vf[U[c]])
    const monsterTypeMap = {};
    for(let key in Vf) {
        let value = Vf[key];
        monsterTypeMap[value] = parseInt(key, 10);
    }
    window.monsterTypeMap = monsterTypeMap;
    
    const decomposeLinkRating = function (card) {
        // a.i & Fc && (c += "&#8598;"), a.i & Gc && (c += "&#8593;"), a.i & Hc && (c += "&#8599;"), a.i & Dc && (c += "&#8592;"), a.i & Ec && (c += "&#8594;"), a.i & Ic && (c += "&#8601;"), a.i & Jc && (c += "&#8595;"), a.i & Kc && (c += "&#8600;")
        
    }
    
    const allowedCount = function (card) {
        // card.A = the source id (e.g. for alt arts)
        // card.id = the actual id
        return Uf(card.A || card.id);
    }
    const clearVisualSearchOptions = function () {
        return Z.Db();
    }
    const isPlayableCard = function (card) {
        // internally checks U.U - having that bit means its not a playable card
        // (reserved for tokens, it seems)
        return Z.ua(card);
    }
    const sanitizeText = function (text) {
        // qa - converts to uppercase and removes:
        //      newlines, hyphens, spaces, colons, and periods
        return qa(text);
    }
    const cardCompare = function (cardA, cardB) {
        return Z.fa(cardA, cardB);
    }
    const addCardToSearch = function (card) {
        return Z.la(card);
    }
    
    // interaction stuff
    const pluralize = function (noun, count, suffix = "s", base = "") {
        return noun + (count == 1 ? base : suffix);
    }
    
    // gui/dom manipulation stuff
    const clearChildren = function (el) {
        while(el.firstChild) {
            el.removeChild(el.firstChild);
        }
        return true;
    }
    const appendTextNode = function (el, text) {
        let textNode = document.createTextNode(text);
        el.appendChild(textNode);
        return true;
    }
    const makeElement = function (name, id = null, content = null) {
        let el = document.createElement(name);
        if(id !== null) {
            el.id = id;
        }
        if(content !== null) {
            appendTextNode(el, content);
        }
        return el;
    }
    const replaceTextNode = function (el, newText) {
        clearChildren(el);
        appendTextNode(el, newText);
    }
    const NO_SELECT_PROPERTIES = [
        "-webkit-touch-callout",
        "-webkit-user-select",
        "-khtml-user-select",
        "-moz-user-select",
        "-ms-user-select",
        "user-select",
    ];
    // TODO: select based on browser?
    const noSelect = function (el) {
        NO_SELECT_PROPERTIES.forEach(property => {
            el.style[property] = "none";
        });
    }
    
    const GUI_COLORS = {
        HEADER: {
            NEUTRAL: "rgba(0,   0,   0,   0.7)",
            SUCCESS: "rgba(0,   150, 0,   0.7)",
            FAILURE: "rgba(150, 0,   0,   0.7)"
        }
    };
    const SYMBOLS = {
        SUCCESS: "✔",
        INFO: "🛈",
        ERROR: "⚠",
    };
    
    let styleHeaderNeutral = function (el) {
        el.style.background = GUI_COLORS.HEADER.NEUTRAL;
        el.style.fontSize = "16px";
        el.style.padding = "3px";
        el.style.marginBottom = "10px";
    }
    
    /* UPDATE PAGE STRUCTURE */
    // add css
    let rsExtCustomCss = makeElement("style", null, ADVANCED_SETTINGS_CSS_STRING);
    document.head.appendChild(rsExtCustomCss);
    
    let searchText = document.getElementById("editor-search-text");
    
    // info box
    let infoBox = makeElement("div");
    // let infoMessage = makeElement("span", "rs-ext-info-message");
    // infoBox.appendChild(document.createTextNode("🛈 "));
    // infoBox.appendChild(infoMessage);
    
    styleHeaderNeutral(infoBox);
    searchText.parentNode.insertBefore(infoBox, searchText);
    
    // advanced search settings
    for(let el of ADVANCED_SETTINGS_HTML_ELS) {
        searchText.parentNode.insertBefore(el, searchText);
    }
    
    // page navigation bar
    let navigationHolder = makeElement("div", "rs-ext-navigation");
    let leftButton = makeElement("button", "rs-ext-navigate-left", "<");
    let rightButton = makeElement("button", "rs-ext-navigate-right", ">");
    for(let button of [leftButton, rightButton]) {
        button.classList.add("engine-button");
        button.classList.add("engine-button-default");
    }
    leftButton.style.margin = rightButton.style.margin = "5px";
    let pageInfo = makeElement("span", null, "Page ");
    let currentPageIndicator = makeElement("span","rs-ext-current-page", "X");
    let maxPageIndicator = makeElement("span", "rs-ext-max-page", "X");
    pageInfo.appendChild(currentPageIndicator);
    appendTextNode(pageInfo, " of ");
    pageInfo.appendChild(maxPageIndicator);
    
    navigationHolder.appendChild(leftButton);
    navigationHolder.appendChild(pageInfo);
    navigationHolder.appendChild(rightButton);
    
    styleHeaderNeutral(navigationHolder);
    navigationHolder.style.textAlign = "center";
    noSelect(navigationHolder);
    
    searchText.parentNode.insertBefore(navigationHolder, searchText);
    
    // wire event listeners for advanced search settings
    let toggleButtonState = function () {
        let isSelected = this.classList.contains("rs-ext-selected");
        if(isSelected) {
            this.classList.remove("rs-ext-selected");
        }
        else {
            this.classList.add("rs-ext-selected");
        }
        updateSearchContents();
    };
    [...document.querySelectorAll(".rs-ext-toggle-button")].forEach(el => {
        el.addEventListener("click", toggleButtonState.bind(el));
    });
    
    let monsterTab = document.getElementById("rs-ext-monster");
    let spellTab = document.getElementById("rs-ext-spell");
    let trapTab = document.getElementById("rs-ext-trap");
    
    let spacer = document.getElementById("rs-ext-spacer");
    
    let createToggleOtherListener = function (target, ...others) {
        return function () {
            if(target.classList.contains("rs-ext-shrunk")) {
                spacer.classList.add("rs-ext-activated");
                target.classList.remove("rs-ext-shrunk");
                others.forEach(other => other.classList.add("rs-ext-shrunk"));
            }
            else {
                spacer.classList.remove("rs-ext-activated");
                target.classList.add("rs-ext-shrunk");
            }
            updateSearchContents();
        }
    }
    
    document.getElementById("rs-ext-monster-toggle")
            .addEventListener("click", createToggleOtherListener(monsterTab,  spellTab,   trapTab));
    document.getElementById("rs-ext-spell-toggle")
            .addEventListener("click", createToggleOtherListener(spellTab,    monsterTab, trapTab));
    document.getElementById("rs-ext-trap-toggle")
            .addEventListener("click", createToggleOtherListener(trapTab,     monsterTab, spellTab));
    
    const currentSection = function () {
        return [monsterTab, spellTab, trapTab].find(el => !el.classList.contains("rs-ext-shrunk")) || null;
    }
    
    const updatePaddingHeight = function () {
        let section = currentSection();
        let height;
        if(section) {
            height = section.clientHeight;
        }
        else {
            height = 0;
        }
        spacer.style.height = height + "px";
    }
    let interval = setInterval(updatePaddingHeight, 1);
    console.info("Interval started. ", interval);
    
    
    
    const LINK_ARROW_MEANING = {
        "Bottom-Left":      0b000000001,
        "Bottom-Middle":    0b000000010,
        "Bottom-Right":     0b000000100,
        "Center-Left":      0b000001000,
        // "Center-Middle":    0b000010000,
        "Center-Right":     0b000100000,        
        "Top-Left":         0b001000000,
        "Top-Middle":       0b010000000,
        "Top-Right":        0b100000000,
    };
    
    const UNICODE_TO_LINK_NUMBER = {
        "\u2196":   LINK_ARROW_MEANING["Top-Left"],
        "\u2191":   LINK_ARROW_MEANING["Top-Middle"],
        "\u2197":   LINK_ARROW_MEANING["Top-Right"],
        "\u2190":   LINK_ARROW_MEANING["Center-Left"],
        // no center middle
        "\u2192":   LINK_ARROW_MEANING["Center-Right"],
        "\u2199":   LINK_ARROW_MEANING["Bottom-Left"],
        "\u2193":   LINK_ARROW_MEANING["Bottom-Middle"],
        "\u2198":   LINK_ARROW_MEANING["Bottom-Right"],
        
        // meaningless
        "=":        0b0,    
    };
    const convertUnicodeToNumber = function (chr) {
        return UNICODE_TO_LINK_NUMBER[chr] || 0;
    }
    
    const tagStringOf = function (tag, value = null, comp = "=") {
        if(value !== null) {
            return "{" + tag + comp + value + "}";
        }
        else {
            return "{" + tag + "}";
        }
    }
    
    const ISOLATE_COMPARATOR_REGEX = /^([&=]|[!><]=?)?(.+)/;
    // returns 1 or 2 elements
    const isolateComparator = function (str) {
        let [_, comp, rest] = str.match(ISOLATE_COMPARATOR_REGEX);
        return [rest, comp].filter(e => e);
    }
    
    // various elements
    const MONSTER_INPUTS = {
        ARROWS:     [...document.querySelectorAll(".rs-ext-toggle-button")],
        TYPE:       document.getElementById("rs-ext-monster-type"),
        ATTRIBUTE:  document.getElementById("rs-ext-monster-attribute"),
        LEVEL:      document.getElementById("rs-ext-level"),
        ATK:        document.getElementById("rs-ext-atk"),
        DEF:        document.getElementById("rs-ext-def"),
        CATEGORY:   document.getElementById("rs-ext-monster-category"),
    };
    const INPUT_TO_KEYWORD = {
        // ARROWS: "ARROWS",
        TYPE: "TYPE",
        ATTRIBUTE: "ATTR",
        LEVEL: "LEVIND",
        ATK: "ATK",
        DEF: "DEF",
    };
    const CATEGORY_TO_KEYWORD = {
        "Normal": "NORMAL",
        "Effect": "EFFECT",
        "Non-Effect": "NONEFF",
        "Link": "LINK",
        "Pendulum": "PEND",
        "Leveled": "LEVELED",
        "Xyz": "XYZ",
        "Synchro": "SYNC",
        "Fusion": "FUSION",
        "Ritual": "RITUAL",
        "Gemini": "GEMINI",
        "Flip": "FLIP",
        "Spirit": "SPIRIT",
        "Toon": "TOON",
    };
    const monsterSectionTags = function () {
        let tagString = "{MONSTER}";
        
        // links
        let selectedArrows = MONSTER_INPUTS.ARROWS.filter(arrow => arrow.classList.contains("rs-ext-selected"));
        let selectedSymbols = selectedArrows.map(arrow => arrow.textContent);
        let bitmaps = selectedSymbols.map(convertUnicodeToNumber);
        let mask = bitmaps.reduce((a, c) => a | c, 0b0);
        
        if(mask) {
            let comp = (selectedSymbols.indexOf("=") !== -1) ? "=" : "&";
            tagString += tagStringOf("ARROWS", mask, comp);
        }
        
        // category
        let category = MONSTER_INPUTS.CATEGORY.value;
        if(category) {
            let keyword = CATEGORY_TO_KEYWORD[category];
            tagString += tagStringOf(keyword);
        }
        
        for(let [inputName, tagName] of Object.entries(INPUT_TO_KEYWORD)) {
            let inputElement = MONSTER_INPUTS[inputName];
            let value = inputElement.value;
            if(!value) continue;
            switch(inputElement.tagName) {
                case "INPUT":
                    tagString += tagStringOf(tagName, ...isolateComparator(value));
                    break;
                case "SELECT":
                    tagString += tagStringOf(tagName, value);
                    break;
                default:
                    console.error("Fatal error: unknown");
                    break;
            }
        }
        
        return tagString;
    }
    
    const SPELL_TRAP_INPUTS = {
        SPELL:  document.getElementById("rs-ext-spell-type"),
        TRAP:   document.getElementById("rs-ext-trap-type"),
    };
    const SPELL_TO_KEYWORD = {
        "Normal": "NORMALST",
        "Quick-play": "QUICK",
        "Field": "FIELD",
        "Continuous": "CONT",
        "Ritual": "RITUALST",
        "Equip": "EQUIP",
    };
    const spellSectionTags = function () {
        let tagString = "{SPELL}";
        
        let value = SPELL_TRAP_INPUTS.SPELL.value;
        if(value) {
            let keyword = SPELL_TO_KEYWORD[value];
            tagString += tagStringOf(keyword);
        }
        
        return tagString;
    }
    
    const TRAP_TO_KEYWORD = {
        "Normal": "NORMALST",
        "Continuous": "CONT",
        "Counter": "COUNTER",
    };
    const trapSectionTags = function () {
        let tagString = "{TRAP}";
        
        let value = SPELL_TRAP_INPUTS.TRAP.value;
        if(value) {
            let keyword = TRAP_TO_KEYWORD[value];
            tagString += tagStringOf(keyword);
        }
        
        return tagString;
    }
    
    const generateSearchFilters = function () {
        let section = currentSection();
        switch(section) {
            case monsterTab:
                return monsterSectionTags();
                break;
                
            case spellTab:
                return spellSectionTags();
                break;
                
            case trapTab:
                return trapSectionTags();
                break;
                
            // case null:
            default: 
                return;
                // break;
        }
    }
    
    /* main code */
    
    const COMPARATORS = {
        ">":  function (x, y) { return x  >  y; },
        "<":  function (x, y) { return x  <  y; },
        "=":  function (x, y) { return x === y; },
        // used exclusively for masks
        "&":  function (x, y) { return (x & y) == y; },
        // "!":  function (x, y) { return x !== y; },
        "!=": function (x, y) { return x !== y; },
        "<=": function (x, y) { return x  <= y; },
        ">=": function (x, y) { return x  >= y; },
    };
    const generateComparator = function(compIdentifier) {
        let comp = COMPARATORS[compIdentifier];
        if(comp) {
            return comp;
        }
        else {
            return null;
        }
    }
    
    const isToken               = (card) => card.type & monsterTypeMap["Token"];
    
    const isTrapCard            = (card) => card.type & monsterTypeMap["Trap"];
    const isSpellCard           = (card) => card.type & monsterTypeMap["Spell"];
    const isRitualSpell         = (card) => isSpellCard(card) && (card.type & monsterTypeMap["Ritual"]);
    const isContinuous          = (card) => card.type & monsterTypeMap["Continuous"];
    const isCounter             = (card) => card.type & monsterTypeMap["Counter"];
    const isField               = (card) => card.type & monsterTypeMap["Field"];
    const isEquip               = (card) => card.type & monsterTypeMap["Equip"];
    const isQuickPlay           = (card) => card.type & monsterTypeMap["Quick-Play"];
    const isSpellOrTrap         = (card) => isSpellCard(card) || isTrapCard(card);
    
    const nonNormalSpellTraps   = [isContinuous, isQuickPlay, isField, isCounter, isEquip, isRitualSpell];
    const isNormalSpellOrTrap   = (card) =>
        isSpellOrTrap(card)
        && !nonNormalSpellTraps.some(cond => cond(card));
    
    const isNormalMonster       = (card) => card.type & monsterTypeMap["Normal"];
    const isEffectMonster       = (card) => card.type & monsterTypeMap["Effect"];
    const isMonster             = (card) => !isTrapCard(card) && !isSpellCard(card);
    const isNonEffectMonster    = (card) => !isEffectMonster(card);
    const isFusionMonster       = (card) => card.type & monsterTypeMap["Fusion"];
    const isRitualMonster       = (card) => isMonster(card) && (card.type & monsterTypeMap["Ritual"]);
    const isSynchroMonster      = (card) => card.type & monsterTypeMap["Synchro"];
    const isTunerMonster        = (card) => card.type & monsterTypeMap["Tuner"];
    const isLinkMonster         = (card) => card.type & monsterTypeMap["Link"];
    const isGeminiMonster       = (card) => card.type & monsterTypeMap["Dual"];
    const isToonMonster         = (card) => card.type & monsterTypeMap["Toon"];
    const isFlipMonster         = (card) => card.type & monsterTypeMap["Flip"];
    const isSpiritMonster       = (card) => card.type & monsterTypeMap["Spirit"];
    const isXyzMonster          = (card) => card.type & monsterTypeMap["Xyz"];
    const isPendulumMonster     = (card) => card.type & monsterTypeMap["Pendulum"];
    
    const isLevelMonster = (card) => isMonster(card) && !isLinkMonster(card) && !isXyzMonster(card);
    
    let kindMap = {
        "TRAP": isTrapCard,
        "SPELL": isSpellCard,
        "MONSTER": isMonster,
        "CONT": isContinuous,
        "CONTINUOUS": isContinuous,
        "COUNTER": isCounter,
        "FIELD": isField,
        "EQUIP": isEquip,
        "QUICK": isQuickPlay,
        "QUICKPLAY": isQuickPlay,
        "NORMAL": isNormalMonster,
        "NORMALST": isNormalSpellOrTrap,
        "EFFECT": isEffectMonster,
        "NONEFF": isNonEffectMonster,
        "NONEFFECT": isNonEffectMonster,
        "FUSION": isFusionMonster,
        "RITUAL": isRitualMonster,
        "RITUALST": isRitualSpell,
        "TUNER": isTunerMonster,
        "LINK": isLinkMonster,
        "SYNC": isSynchroMonster,
        "SYNCHRO": isSynchroMonster,
        "DUAL": isGeminiMonster,
        "GEMINI": isGeminiMonster,
        "TOON": isToonMonster,
        "FLIP": isFlipMonster,
        "SPIRIT": isSpiritMonster,
        "XYZ": isXyzMonster,
        "PENDULUM": isPendulumMonster,
        "PEND": isPendulumMonster,
        "LEVELED": isLevelMonster,
    };
    const createKindValidator = function (tagName) {
        if(kindMap[tagName]) {
            return kindMap[tagName];
        } else {
            addMessage(STATUS.ERROR, "No such kind tag: " + tagName);
            return null;
        }
    }
    
    const VALIDATOR_ONTO_MAP = {
        "ATK": "attack",
        "DEF": "i",
        "ARROWS": "i",
    };
    const VALIDATOR_LEVEL_MAP = {
        "LEVEL": isLevelMonster,
        "LV": isLevelMonster,
        "RANK": isXyzMonster,
        "RK": isXyzMonster,
        "LINK": isLinkMonster,
        "LR": isLinkMonster,
        "SCALE": isPendulumMonster,
        "LI": () => true,
        "LEVIND": () => true,
    };
    
    const initialCapitalize = function (str) {
        return str[0].toUpperCase() + str.slice(1).toLowerCase()
    }
    
    // returns a validation function
    /*
     * ALLOWED PARAMETERS:
     * ATK, num - search for atk 
     * DEF, num - search for atk
     * LIM, num - search by limit status (0 = banned, 1 = limited, 2 = semi-limited, 3 = unlimited)
     * LV,  num - search by level indicator
     * LEVEL,RANK,RK,LINK,LR - same for respective type
     */
    const createValidator = function (tag) {
        if(VALIDATOR_ONTO_MAP[tag.param]) {
            let value = parseInt(tag.value, 10);
            let prop = VALIDATOR_ONTO_MAP[tag.param];
            return function (cardObject) {
                let objectValue = cardObject[prop];
                if(tag.param === "DEF" && isLinkMonster(cardObject)) {
                    return false;
                }
                if(tag.param === "ARROWS" && !isLinkMonster(cardObject)) {
                    return false;
                }
                return isMonster(cardObject) && tag.comp(objectValue, value);
            };
        }
        else if(VALIDATOR_LEVEL_MAP[tag.param]) {
            let check = VALIDATOR_LEVEL_MAP[tag.param];
            let level = parseInt(tag.value, 10);
            return function (cardObject) {
                return check(cardObject) && tag.comp(cardObject.level, level);
            }
        }
        else if(tag.param === "LIM") {
            if(/^\d+$/.test(tag.value)) {
                let value = parseInt(tag.value, 10);
                return function (cardObject) {
                    let count = allowedCount(cardObject);
                    return tag.comp(count, value);
                };
            }
            else {
                addMessage(STATUS.ERROR, "Invalid numeral " + tag.value + ", ignoring tag");
                return function () {
                    return true;
                };
            }
        }
        else if(tag.param === "NAME") {
            let sub = sanitizeText(tag.value);
            return function (cardObject) {
                return sanitizeText(cardObject.Z).indexOf(sub) !== -1;
            };
        }
        else if(tag.param === "TYPE") {
            let searchType = initialCapitalize(tag.value);
            if(TYPE_LIST.indexOf(searchType) !== -1) {
                return function (cardObject) {
                    return monsterType(cardObject) == searchType;
                };
            }
            else {
                addMessage(STATUS.ERROR, "Invalid type " + tag.value + ", ignoring tag");
                return function () {
                    return true;
                };
            }
        }
        else if(tag.param === "ATTR" || tag.param === "ATTRIBUTE") {
            let searchAttribute = tag.value.toUpperCase();
            let attributeMask = ATTRIBUTE_HASH[searchAttribute];
            if(attributeMask !== undefined) {
                attributeMask = parseInt(attributeMask, 10);
                return function (cardObject) {
                    return attributeOf(cardObject) === attributeMask;
                };
            }
            else {
                addMessage(STATUS.ERROR, "Invalid attribute " + tag.value + ", ignoring tag");
                return function () {
                    return true;
                };
            }
        }
        else {
            addMessage(STATUS.ERROR, "No such parameter supported: " + tag.param);
            return null;
        }
    }
    
    const allSatisfies = function (tags, card) {
        return tags.every(tag => tag(card));
    }
    
    const defaultSearchOptionState = function () {
        clearVisualSearchOptions();
    };
    
    const displayResults = function () {
        defaultSearchOptionState();
        if(EXT.Search.cache.length !== 0) {
            replaceTextNode(currentPageIndicator, EXT.Search.current_page);
            let startPosition = (EXT.Search.current_page - 1) * EXT.Search.per_page;
            let endPosition = Math.min(
                EXT.Search.cache.length,
                startPosition + EXT.Search.per_page
            );
            for(let i = startPosition; i < endPosition; i++) {
                addCardToSearch(EXT.Search.cache[i].id);
            }
        }
        clearChildren(infoBox);
        for(let container of EXT.Search.messages) {
            let [kind, message] = container;
            let color, symbol;
            switch(kind) {
                case STATUS.ERROR:
                    color = GUI_COLORS.HEADER.FAILURE;
                    symbol = SYMBOLS.ERROR;
                    break;
                
                case STATUS.SUCCESS:
                    color = GUI_COLORS.HEADER.SUCCESS;
                    symbol = SYMBOLS.SUCCESS;
                    break;
                
                case STATUS.NEUTRAL:
                default:
                    color = GUI_COLORS.HEADER.NEUTRAL;
                    symbol = SYMBOLS.INFO;
                    break;
            }
            let symbolElement = document.createElement("span");
            let messageElement = document.createElement("span");
            
            appendTextNode(symbolElement, symbol);
            symbolElement.style.padding = "3px";
            appendTextNode(messageElement, message);
            
            let alignTable = document.createElement("table");
            alignTable.style.backgroundColor = color;
            alignTable.style.padding = "2px";
            alignTable.appendChild(makeElement("tr"));
            alignTable.children[0].appendChild(makeElement("td"));
            alignTable.children[0].children[0].appendChild(symbolElement);
            alignTable.children[0].appendChild(makeElement("td"));
            alignTable.children[0].children[1].appendChild(messageElement);
            
            infoBox.appendChild(alignTable);
        }
    }
    
    const STATUS = { ERROR: 0, NEUTRAL: -1, SUCCESS: 1 };
    const addMessage = function (kind, message) {
        EXT.Search.messages.push([kind, message]);
    }
    
    const initializeMessageContainer = function () {
        EXT.Search.messages = [];
    }
    
    const ISOLATE_TAG_REGEX = /\{(!?)([^\{\}]+?)((?:([&=]|[!><]=?)([^\{\}]+?),?)*)\}/g;
    const validatorFrom = function (isNegation, param, comp, value) {
        let validator;
        if(comp) {
            let tag = {
                param: param.toUpperCase(),
                comp: generateComparator(comp.toUpperCase()),
                value: value
            };
            // console.log(match, tag);
            validator = createValidator(tag);
        } else {
            validator = createKindValidator(param);
        }
        
        if(isNegation) {
            validator = FN.compose(FN.not, validator);
        }
        
        return validator;
    };
    let updateSearchContents = function () {
        clearVisualSearchOptions();
        initializeMessageContainer();
        // TODO: move sanitation process later in the procedure
        let input = $("#editor-search-text").val();
        
        // append tags generated by search options
        let extraTags = generateSearchFilters();
        if(extraTags) {
            input += extraTags;
        }
        
        // isolate the tags in the input
        let tags = [];
        input = input.replace(ISOLATE_TAG_REGEX, function (match, isNegation, param, info) {
            let validators = [];
            let previousComp = null;
            if(info) {
                let sections = info.split(/\s*,\s*/);
                // create new tag using conjunction of provided parameters
                for(let section of sections) {
                    if(section.length === 0) {
                        addMessage(STATUS.ERROR, "Incomplete conditional section, skipping");
                        continue;
                    }
                    // console.log(section, sections, param, info);
                    let [value, comp] = isolateComparator(section);
                    comp = comp || previousComp || "=";
                    let validator = validatorFrom(isNegation, param, comp, value);
                    if(validator) {
                        validators.push(validator);
                    }
                    previousComp = comp;
                }
            }
            else {
                let validator = validatorFrom(isNegation, param);
                if(validator) {
                    validators.push(validator);
                }
            }
            
            if(validators.length) {
                let combined;
                if(validators.length === 1) {
                    combined = validators[0];
                }
                else {
                    combined = function (cardObject) {
                        for(let validator of this) {
                            if(!validator(cardObject)) {
                                return false;
                            }
                        }
                        return true;
                    }.bind(validators);
                }
                tags.push(combined);
            }
            
            // remove the tag, replace with nothing
            return "";
        });
        
        // remove any improper tags
        input = input.replace(/\{[^\}]+$/, "").toUpperCase();
        
        // needs non-empty input
        if (input.length !== 0 || tags.length !== 0) {
            let exactMatches = [];
            let fuzzyMatches = [];
            
            let cardId = parseInt(input, 10);
            
            // if the user is searching by ID
            if(!isNaN(cardId)) {
                cardId = CARD_LIST[cardId];
                if(cardId && isPlayableCard(cardId)) {
                    fuzzyMatches.push(cardId);
                }
            }
            
            console.log("SEARCHING: ", JSON.stringify(input));
            // only if the user is not searching by a valid ID
            let hasTags = tags.length !== 0;
            let isLongEnough = input.length >= EXT.MIN_INPUT_LENGTH;
            let isFuzzySearch = hasTags || isLongEnough;
            
            let searchableInput = input.replace(/ /g, "").toUpperCase();
            if (0 === fuzzyMatches.length) {
                // for each card ID
                for (var e in CARD_LIST) {
                    let card = CARD_LIST[e];
                    if(isPlayableCard(card)) {
                        if(allSatisfies(tags, card)) {
                            let compareName = searchableCardName(card);
                            if(compareName === searchableInput) {
                                // if the search name is the input, push it
                                exactMatches.push(card);
                            } else if(isFuzzySearch) {
                                let cardMatchesSearch = compareName.indexOf(searchableInput) !== -1;
                                if(cardMatchesSearch) {
                                    fuzzyMatches.push(card);
                                }
                            }
                        }
                    }
                }
            }
            
            // sort each by "Z.fa", the pecking order function
            exactMatches.sort(cardCompare);
            fuzzyMatches.sort(cardCompare);
            
            // display 
            let totalEntryCount = exactMatches.length + fuzzyMatches.length;
            let displayAmount = Math.min(totalEntryCount, EXT.RESULTS_PER_PAGE);
            if(displayAmount === 0) {
                EXT.Search.cache = [];
                if(isFuzzySearch) {
                    let suggestion;
                    if(hasTags) {
                        suggestion = "Try changing or removing some tags.";
                    }
                    else {
                        suggestion = "Check your spelling and try again.";
                    }
                    if(input.replace(/\W/g, "").toLowerCase() == "sock") {
                        addMessage(STATUS.ERROR, "No results found. If you're looking for me, try Sock#3222 on discord :D");
                    }
                    else {
                        addMessage(STATUS.ERROR, "No results found. " + suggestion);
                    }
                }
                else {
                    addMessage(STATUS.ERROR, "Your input was too short. Try typing in some text or adding some tags.");
                }
            } else {
                let cache = exactMatches.concat(fuzzyMatches);
                EXT.Search.cache = cache;
                // RESULTS_PER_PAGE can change between calculations
                EXT.Search.per_page = EXT.RESULTS_PER_PAGE;
                EXT.Search.current_page = 1;
                EXT.Search.max_page = Math.ceil(EXT.Search.cache.length / EXT.Search.per_page);
                
                replaceTextNode(currentPageIndicator, EXT.Search.current_page);
                replaceTextNode(maxPageIndicator, EXT.Search.max_page);
                
                let message = "";
                
                let anyErrors = EXT.Search.messages.some(
                    message => message[0] == STATUS.ERROR
                );
                message += "Search successful";
                if(anyErrors) {
                    message += ", but there were some errors";
                }
                message += ". Found " + totalEntryCount + " ";
                message += pluralize("entr", totalEntryCount, "ies", "y");
                message += " (" + EXT.Search.max_page + " " + pluralize("page", EXT.Search.max_page) + ")";
                addMessage(anyErrors ? STATUS.NEUTRAL : STATUS.SUCCESS, message);
            }
            
            
            
            /* 
            // show exact matches
            let numberToShow = EXT.RESULTS_PER_PAGE;
            for (let i = 0; i < exactMatches.length && numberToShow !== 0; ++i, --numberToShow) {
                // Z.la - add to search
                addCardToSearch(exactMatches[i].id);
            }
            
            for (let i = 0; i < fuzzyMatches.length && numberToShow; ++i, --numberToShow) {
                addCardToSearch(fuzzyMatches[i].id);
            } */
        }
        else {
            EXT.Search.cache = [];
            replaceTextNode(currentPageIndicator, "X");
            replaceTextNode(maxPageIndicator, "X");
            addMessage(STATUS.NEUTRAL, "Please enter a search term to begin.");
        }
        displayResults();
    };
    
    // add new input function
    $("#editor-search-text").on("input", updateSearchContents);
    updateSearchContents();
    
    // add relevant listeners
    let allInputs = [
        document.querySelectorAll("#rs-ext-monster-table input, #rs-ext-monster-table select"),
        SPELL_TRAP_INPUTS.SPELL,
        SPELL_TRAP_INPUTS.TRAP,
    ].flat();
    
    for(let input of allInputs) {
        $(input).on("input", updateSearchContents);
    }
    
    
    let previousPage = function () {
        EXT.Search.current_page = Math.max(1, EXT.Search.current_page - 1);
        displayResults();
    }
    let nextPage = function () {
        EXT.Search.current_page = Math.min(EXT.Search.max_page, EXT.Search.current_page + 1);
        displayResults();
    }
    $(leftButton).on("click", previousPage);
    $(rightButton).on("click", nextPage);
})();