'use strict';

const coreCalc = require('./coreCalc');
const coreConv = require('./coreConv');

var prefix = '';


/** @const {Object} */
const textForOperators = {
    'plus': '+',
    'added to': '+',
    'adds': '+',
    'with': '+',
    'minus': '-',
    'subtract': '-',
    'less': '-',
    'divided by': '/',
    'by': '/',
    'multiplied by': '*',
    'into': '*',
    'cross': '*',
    'arithmetic right shift': '>>',
    'left shift': '<<'
};

/** @const {string} */
const lengthUnits = Object.keys(coreConv.lengthUnits).join('|');

/** @const {string} */
const weightUnits = Object.keys(coreConv.weightUnits).join('|');

/** @const {string} */
const temperatureUnits = coreConv.temperatureUnits.join('|');

/** @const {string} */
const currencyUnits = Object.keys(coreConv.currencyUnits).join('|');

/**
 * This function generates a RegExp for the given units
 * @example generate(km|cm|in)
 * @param {string} units
 * @private
 */
const generateRegExpForUnits = units => new RegExp(`^(\\d+(\\.\\d*)?\\s*)(${units})\\s*(to|TO)\\s*(${units})\\s*$`, 'm');

/** @const {object} */
const lengthRegExp = generateRegExpForUnits(lengthUnits);

/** @const {object} */
const weightRegExp = generateRegExpForUnits(weightUnits);

/** @const {object} */
const temperatureRegExp = generateRegExpForUnits(temperatureUnits);

/** @const {object} */
const currencyRegExp = generateRegExpForUnits(currencyUnits);

/** @const {object} */
const commentRegExp = new RegExp(/^(\s*)#+(.*)/, 'm')

/** @const {object} */
const percentageRegExp = new RegExp(/(\d+)\s*(%\s*of)\s*(\d+)/, 'm')

/** @const {object} */
const ratioRegExp = new RegExp(/(\d+\/\d+)\s*of\s*(\d+)/, 'm');

/** @const {object} */
var simple = new RegExp(/(\w{1,3}\s*to\s+\w{1,3})/, 'im');

/** @const {object} */
var compound = new RegExp(/(to\s+\w{1,3})(.*)/, 'im');

/**
 * This function filters the given value with
 * filter conditions :  null, undefined, empty or to
 * returns false if it meets any of the above conditions
 * @param {*} v - value which is filtered for null, undefined, empty or to.
 * @returns {boolean} - result after filtering
 * @private
 */
const filterValues = v => (v !== null && v !== undefined && v !== '' && v !== 'to' && v !== 'TO');

/**
 * This function parses the given expression with the provided regExp and passes the values to the core modules
 * @param {string} inp
 * @param {object} type
 * @param {string} unit
 * @returns {number}
 */
const parseInput = (inp, type, unit) => {
    inp = inp.split(type).filter(filterValues);
    prefix = inp[2];
    let result = coreConv.convert(unit, ...inp);
    return result
}


/**
 * This is main function which parses and sends the values to the core modules
 * @param {string} exp - provides user input, that can be an equation or conversion. But not both, yet.
 * @returns {number}
 */

// TODO: refactor
const main = exp => {
    exp = exp.toLowerCase();
    exp = exp.trim();

    // Ignores if starts with #
    if (commentRegExp.test(exp)) return "";

    // Replaces the text alternatives for operators
    Object.keys(textForOperators).forEach(operator => {
        exp = exp.replace(operator, textForOperators[operator])
    })

    exp = exp.split(')');
    let out = [];

    exp.forEach(each => {
        each = each.trim();

        each = each.replace(/[(]{1,}/, '');


        if (ratioRegExp.test(each)) {
            out.push(parseInput(each, ratioRegExp, 'r'));
        } else if (percentageRegExp.test(each)) {
            out.push(parseInput(each, percentageRegExp, 'p'));
        } else if (temperatureRegExp.test(each)) {
            out.push(parseInput(each, temperatureRegExp, 't'));
        } else if (lengthRegExp.test(each)) {
            out.push(parseInput(each, lengthRegExp, 'l'));
        } else if (weightRegExp.test(each)) {
            out.push(parseInput(each, weightRegExp, 'w'));
        } else if (currencyRegExp.test(each.toUpperCase())) {
            out.push(parseInput(each.toUpperCase(), currencyRegExp, 'c'));
        } else {
            if (simple.test(each)) {
                each = "1 " + each;
                if (lengthRegExp.test(each)) {
                    out.push(parseInput(each, lengthRegExp, 'l'));
                } else if (weightRegExp.test(each)) {
                    out.push(parseInput(each, weightRegExp, 'w'));
                }
            } else if (compound.test(each)) {
                var temp = each.split(compound).filter(filterValues);

                temp[0] = "1 " + prefix + temp[0].trim();
                if (lengthRegExp.test(temp[0])) {
                    out.push(parseInput(temp[0], lengthRegExp, 'l'));
                } else if (weightRegExp.test(temp[0])) {
                    out.push(parseInput(temp[0], weightRegExp, 'w'));
                }

                out.push(temp[1] ? temp[1].trim() : null);
            } else {
                out.push(each)
            }
        }

    });

    return coreCalc.evalExp(out.map((each, index) => {
        if (index !== 0 && each) {
            return /^[\/\+\-\*]/.test(each) ? each : "*" + each
        } else {
            return each
        }
    }).join(''))

}


module.exports = main;
