'use strict';

/* TODO:
 * division by 0 returns nothing
 */

// the operators to be used in the expression
const operators = ['+', '-', '*', '/', '%', '(', ')', '**', '|', '&', '^', '<<', '>>'];

/**
 * The precedence of the operators from low to high
 * The operator with low number has the low precedence
 * The operator with high number has the high precedence
 */
const precedence = {
    '|': 0,
    '^': 1,
    '<<': 1,
    '>>': 1,
    '&': 2,
    '+': 3,
    '-': 3,
    '*': 4,
    '/': 4,
    '%': 4,
    '**': 5
};

/**
 * This is a function to process and evaluate expression
 * @param {String} expression - Expressions to be calculated
 * @returns {Number} - final value from expression evaluation
 */
const evalExp = (expression) => {
    let tokens = [];

    // remove the spaces from the expressions
    let exp = expression.replace(/\s/g, '');

    // add 0 to the negative expressions
    // TODO : handle negative numbers
    if (exp[0] === '-') exp = 0 + exp;

    // extract the tokens from the expression
    // the token can be operators such as +, -, * , /
    // tokens can also be numbers such as 5, 34, 21, etc
    tokens = getTokens(exp);

    // maintain the values and operator stack
    let values = [];
    let ops = [];

    tokens.forEach(token => {
        if (!operators.includes(token)) {
            values.push(parseFloat(token));
        } else if (token === '(') {
            ops.push(token);
        } else if (token === ')') {
            // loop while the operator is not opening brace
            while (ops[ops.length - 1] != '(') {
                values.push(operate(ops.pop(), values.pop(), values.pop()));
            }
            ops.pop();
        } else if (operators.includes(token)) {
            while (ops.length !== 0 && hasPrecedence(token, ops[ops.length - 1])) {
                values.push(operate(ops.pop(), values.pop(), values.pop()));
            }
            ops.push(token);
        }
    });

    // operate the remaining operands in the stack
    while (ops.length !== 0) {
        values.push(operate(ops.pop(), values.pop(), values.pop()));
    }

    // The values stack will end up with the final value to be popped
    const result = values[values.length - 1];
    return isNaN(result) ? '' : result;
};

/**
 * This is a function to resolve the string expression to numbers and operators token
 * @param {String} exp - expression string to be tokenized
 * @returns {Object(Array)} - list of tokens consisting of numbers and operators
 */
const getTokens = exp => {
    let tokens = [];
    let operand = '';

    for (let i = 0; i < exp.length; i++) {
        // first check if the token is a multi character operator
        if (exp[i] === '*' && exp[i + 1] === '*') {
            if (operand !== '')
                tokens.push(operand);
            operand = '';
            tokens.push('**');
        } else if (exp[i] === '*' && exp[i - 1] === '*') {
            continue;
        } else if (exp[i] === '<' && exp[i + 1] === '<') {
            if (operand !== '')
                tokens.push(operand);
            operand = '';
            tokens.push('<<');
        } else if (exp[i] === '<' && exp[i - 1] === '<') {
            continue;
        } else if (exp[i] === '>' && exp[i + 1] === '>') {
            if (operand !== '')
                tokens.push(operand);
            operand = '';
            tokens.push('>>');
        } else if (exp[i] === '>' && exp[i - 1] === '>') {
            continue;
        } else {
            // if the token is not a multi character operator, evaluate for other operators and numbers
            if (!operators.includes(exp[i])) {
                operand += exp[i];
            } else {
                if (operand !== '')
                    tokens.push(operand);
                tokens.push(exp[i]);
                operand = '';
            }
        }
    }
    tokens.push(operand);

    // filter out any junk/spaces
    tokens = tokens.filter(token => token !== '');
    return tokens;
};

/**
 * This is a function to perform basic mathematical operations
 * @param {String} operator - Operator to perform mathematical operation
 * @param {Number} operand1 - Operand on which operation is to be performed
 * @param {Number} operand2 - Operand on which operation is to be performed
 * @returns {Number} - result after performing operation
 */
const operate = (operator, operand1, operand2) => {
    switch (operator) {
        case '+':
            return operand1 + operand2;
        case '-':
            return operand2 - operand1;
        case '*':
            return operand2 * operand1;
        case '%':
            return operand2 % operand1;
        case '/':
            return operand2 / operand1;
        case '**':
            return Math.pow(operand2, operand1);
        case '&':
            return operand2 & operand1;
        case '|':
            return operand1 | operand2;
        case '^':
            return operand1 ^ operand2;
        case '<<':
            return operand2 << operand1;
        case '>>':
            return operand2 >> operand1;
    }
};

/**
 * This is the function to check for the precedence of any two operators
 * @param {String} op1 - Operator to compare the precedence with another operator
 * @param {String} op2 - Operator to compare the precedence with another operator
 * @returns {Boolean} - True if the op2 precedence is high or equal, or False
 */
const hasPrecedence = (op1, op2) => {
    // if the operator is '(' or ')' no need to check the precedence
    // since further calculation needs to be done for the expression inside (--)
    // so return False
    if (op2 === '(' || op2 === ')') return false;

    // for other operators check for the precedence as defined
    if (precedence[op2] >= precedence[op1]) {
        return true;
    } else {
        return false;
    }
};

module.exports = {
    evalExp,
    hasPrecedence,
    operate,
    getTokens
};
