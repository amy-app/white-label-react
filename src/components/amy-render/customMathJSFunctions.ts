import * as mathjs from "mathjs";
import * as pluralize from "pluralize";
import { shuffleArray } from "./latexUtils";

/**
 *
 * Function evaluations to import into mathjs so we can use out custom functions in mathjs.eval() inside of evaluateExpression()
 *
 */

export const implicitFuncs: string[] = ["cos", "tan", "sin", "sqrt", "f_log", "f_div"];

function removeLeadingZeros(str: string): string {
    let _retString: string = "";

    let foundNonZero: boolean = false;
    for (const char of str) {
        if (!foundNonZero) {
            if (char !== "0" && char !== "." && char !== "-") {
                _retString += char;
                foundNonZero = true;
            }
        } else {
            _retString += char;
        }
    }
    return _retString;
}

export function getSingularUnit(unit: string): string {
    try {
        let unitName: string = mathjs.eval(unit).units.name;
        try {
            unitName = mathjs.eval(pluralize.singular(unit)).toString();
        } catch {
            unitName = unit;
        }
        return unitName;
    } catch (e) {
        return unit;
    }
}

const customFunctions: any = {
    // Divides a by b
    f_div: function (a: number, b: number): number {
        return a / b;
    },
    // DO NOT USE THIS IS FOR PARSING AROUNF MATHJS
    f_Eval: function (a: number): number {
        return a;
    },

    // Returns a / 100, representing the mathematical version of a%
    f_percent: function (a: number): number {
        return a / 100;
    },

    f_mixedNum: function (a: any, b: any): number {
        return parseFloat(a) + parseFloat(b);
    },

    // An array using curly brackets eg: {a, b, c, d}
    f_bArray: function (array: any[] | mathjs.Matrix): any[] | mathjs.Matrix {
        if (array === []) {
            return array;
        } else {
            return mathjs.matrix(array);
        }
    },

    // An array using parenthesis eg: (a, b, c, d)
    f_pArray: function (array: any[] | mathjs.Matrix): any[] | mathjs.Matrix {
        if (array === []) {
            return array;
        } else {
            return mathjs.matrix(array);
        }
    },

    // An array using no brackets eg: a, b, c, d
    f_sArray: function (array: any[] | mathjs.Matrix): any[] | mathjs.Matrix {
        if (array === []) {
            return array;
        } else {
            return mathjs.matrix(array);
        }
    },

    // An array using no brackets eg: [a, b, c, d]
    f_Array: function (array: any[] | mathjs.Matrix): any[] | mathjs.Matrix {
        if (array === []) {
            return array;
        } else {
            return mathjs.matrix(array);
        }
    },

    // An array using no spacing or commas eg: abcd
    f_gArray: function (_array: any[] | mathjs.Matrix): any {
        return mathjs.eval("22");
    },

    /*
    Given the input number n, this function returns all factor pairs of n (each written as a product).
    For example
    f_factorPairs(4) -> 1 \times 4, -1 \times -4, 2 \times 2, -2 \times -2
    f_factorPairs(-4) -> -1 \times 4, 1 \times -4, -2 \times 2
    Notice that order isn't important in that if we have 1 \times 4 we don't display 4 \times 1
    */
    f_factorPairs: function (num: number, positiveOnly: boolean = false): any[] | mathjs.Matrix {
        const factorPairs: string[] = [];
        // If n is positive
        if (num > 0) {
            for (let f1: number = 1; f1 < Math.floor(Math.sqrt(num)) + 1; f1++) {
                if (num % f1 === 0) {
                    const f2: number = num / f1;
                    factorPairs.push(String(f1) + " * " + String(f2));
                    factorPairs.push(-1 * f1 + " * " + -1 * f2);
                }
            }
        }

        // If n is negative
        if (num < 0) {
            for (let f1: number = 1; f1 < Math.floor(Math.sqrt(-1 * num)) + 1; f1++) {
                if (num % f1 === 0) {
                    const f2 = num / f1;
                    factorPairs.push(String(f1) + " * " + String(f2));
                    if (f1 !== -1 * f2) {
                        factorPairs.push(-1 * f1 + " * " + -1 * f2);
                    }
                }
            }
        }

        // If n is zero
        if (num === 0) {
            factorPairs.push("0 * 0");
        }

        if (positiveOnly) {
            return factorPairs.filter((val) => !val.includes("-"));
        } else {
            return factorPairs;
        }
    },

    // Returns the sorted array with the optional ascending param
    f_sort: function (array: mathjs.Matrix, ascending?: boolean): mathjs.Matrix {
        let arrayData: any[] = [];
        mathjs.forEach(array, (value) => {
            arrayData.push(parseFloat(value.toString()));
        });

        if (ascending || ascending === undefined) {
            arrayData = arrayData.sort((a, b) => {
                return a - b;
            });
        } else {
            arrayData = arrayData
                .sort((a, b) => {
                    return a - b;
                })
                .reverse();
        }
        return mathjs.matrix(arrayData);
    },

    // Returns the factorial of a given number
    f_factorial: function (a: number): number {
        let rval: number = 1;
        for (let index: number = 2; index <= a; index++) {
            rval = rval * index;
        }
        return rval;
    },

    // Returns the number formatted with the given params
    f_format: function (num: any, arg1?: any, arg2?: any): string {
        const possibleModes: string[] = ["auto", "exponential", "fixed", "engineering"];
        let mode: "auto" | "exponential" | "fixed" | "engineering", precision: number;
        // 1) Both Precision and Mode are passed
        if (possibleModes.includes(arg1) && arg2 !== undefined) {
            precision = mathjs.eval(arg2);
            mode = arg1;
        }
        // 2) Only Precision is passed
        else if (!possibleModes.includes(arg1) && arg1 !== undefined && arg2 === undefined) {
            precision = mathjs.eval(arg1);
        }
        // 3) Only Mode is passed
        else if (possibleModes.includes(arg1) && arg2 === undefined) {
            mode = arg1;
        }

        const formatOptions: mathjs.FormatOptions = {
            notation: possibleModes.includes(mode) ? mode : "auto",
            precision: precision !== undefined ? precision : undefined,
            lowerExp: -Infinity,
            upperExp: Infinity,
        };

        let _toReturn = mathjs.format(mathjs.eval(num), formatOptions);

        // Adding Trailing Zeros
        let precisionDigits: number;
        if (mode === "fixed") {
            precisionDigits = _toReturn.replace(".", "").length;
        } else {
            precisionDigits = removeLeadingZeros(_toReturn).length;
        }
        if (precision > precisionDigits && !_toReturn.includes("e-")) {
            // add a decimal point to _toReturn if there is none
            if (_toReturn.indexOf(".") < 0) _toReturn += ".";
            _toReturn += "0".repeat(precision - precisionDigits);
        }

        return _toReturn.toString();
    },

    // Returns a new complex number generated from the given Polar
    complexFromPolar: function (r: number, phi: number): number {
        return (mathjs as any).type.Complex.fromPolar(r, phi);
    },

    // Returns a matrix of both possibilities, + and -
    plusMinus: function (a: number): mathjs.Matrix {
        return mathjs.matrix([a, a * -1]);
    },

    // Returns a matrix of both possibilities, + and -
    f_plusMinus: function (a: number, b: number): mathjs.Matrix {
        return mathjs.matrix([a + b, a - b]);
    },

    // A catcher to handle any ghost brackets not caught by the parser
    f_Ghost: function (a: number): number {
        return a;
    },

    // Returns an array representing the simultaneous equation
    f_simul: function (array: any[] | mathjs.Matrix): any[] | mathjs.Matrix {
        if (array === []) {
            return array;
        } else {
            return mathjs.matrix(array);
        }
    },

    // Returns an array representing the simultaneous equation
    f_simulNumbered: function (array: any[] | mathjs.Matrix): any[] | mathjs.Matrix {
        if (array === []) {
            return array;
        } else {
            return mathjs.matrix(array);
        }
    },

    // Returns the closest value to num in the array
    f_closestVal: function (num: string, array: mathjs.Matrix): number {
        const numVal: any = mathjs.eval(num);

        let closest: number = (array as any)._data[0];
        let bestDiff: number = Math.abs(numVal - closest);

        for (const node of (array as any)._data) {
            const val: any = mathjs.eval(node);
            const difference: number = Math.abs(numVal - val);

            if (difference < bestDiff) {
                closest = val;
                bestDiff = difference;
            }
        }

        return closest;
    },

    // Returns the Quadratic Solution of a, b, c with an optional precision where x is the variable
    f_quadSolve: function (_x: string, a: number, b: number, c: number, _prec?: number): mathjs.Matrix {
        const left: number = mathjs.eval(`(-1 * ${b} + sqrt(${b}^2 - (4 * ${a} * ${c}))) / (2 * ${a})`);
        const right: number = mathjs.eval(`(-1 * ${b} - sqrt(${b}^2 - (4 * ${a} * ${c}))) / (2 * ${a})`);
        // const discriminant: number = mathjs.eval(`${b}^2 - (4 * ${a} * ${c})`);

        // console.log("b^2 - (4 * a * c) is: " + discriminant);

        // Debugging.
        // console.log("the left number is: " + left);
        // console.log("the right number is: " + right);

        const _ret: mathjs.Matrix = mathjs.matrix([left, right]);

        // console.log(mathjs.matrix([left, right]));
        return _ret;
    },

    // Returns the division represented by the ratio
    f_ratio: function (a: number, b: number): number {
        return a / b;
    },

    // Returns the evaluated power
    f_pow: function (a: number, b: number): number {
        return a ** b;
    },

    // Returns multiplication
    f_implicitMulti: function (...args: number[]): number {
        let product: number = 1;
        for (const num of args) {
            product = product * num;
        }
        return product;
    },

    // Returns multiplication
    f_dotMulti: function (...args: number[]): number {
        let product: number = 1;
        for (const num of args) {
            product = product * num;
        }
        return product;
    },

    // Returns multiplication
    f_explicitMulti: function (...args: number[]): number {
        let product: number = 1;
        for (const num of args) {
            product = product * num;
        }
        return product;
    },

    // Returns addition
    f_explicitPlus: function (...args: number[]): number {
        let sum: number = 0;
        for (const num of args) {
            sum = sum + num;
        }
        return sum;
    },

    // Returns subtraction
    f_explicitMinus: function (...args: number[]): number {
        return args[0] - args[1];
    },

    // Returns multiplication
    f_multi: function (...args: number[]): number {
        let product: number = 1;
        for (const num of args) {
            product = product * num;
        }
        return product;
    },

    // Returns the definite integral
    f_intDef: function (..._args: number[]): number {
        return 1;
    },

    // Returns the indefinite integral
    f_intIndef: function (..._args: number[]): number {
        return 1;
    },

    // returns the next prime in the given direction
    f_nextPrime: function (a: number, direction: string): number {
        // we cant take negatives
        if (a < 0) {
            return a;
        }
        // the number of fails before we just quit
        let watchDog: number = 1000;

        let num: number = mathjs.eval(a.toString());
        // the change is how much we move +ve or -ve in the direction
        const change: number = direction === "down" ? -1 : 1;

        if (mathjs.isPrime(num)) {
            num += change;
        }
        // make sure we start off on an odd
        if (num % 2 === 0) {
            num += change;
        }
        // keep moving by two in the direction until we hit prime.
        while (!mathjs.isPrime(num)) {
            num += change * 2;
            // check for timeout condition
            watchDog -= 1;
            if (watchDog === 0) {
                return a;
            }
        }

        return num;
    },

    f_shuffleArray: function (array: mathjs.Matrix): mathjs.Matrix {
        // convert eh mathjs matrix into a js array
        let arrayData: any[] = [];
        mathjs.forEach(array, (value) => {
            arrayData.push(value);
        });

        arrayData = shuffleArray(arrayData);

        return mathjs.matrix(arrayData);
    },

    // Returns the number
    f_numToText: function (a: number): number {
        return a;
    },

    f_numToPlaceVal: function (a: number): number {
        return a;
    },

    f_stringOption: function (..._args: any): string {
        return "string";
    },

    f_log: function (a: number, b?: number): any {
        if (b) {
            return mathjs.log(a, b);
        } else {
            // mathjs precision gets in the way so we cut it if its crazy long so 2.999999999999 -> 3
            let numString = mathjs.log(a, 10).toString();

            if (numString.length > 15) {
                numString = (mathjs.parse(numString) as any).toString({ precision: 14 });
            }
            return numString;
        }
    },

    f_latex: function (tex: string): string {
        return tex;
    },

    f_underline: function (a: any): string {
        return a;
    },

    f_conj: function (a: any, _notation?: string): any {
        return mathjs.conj(a);
    },

    f_factors: function (n: number, nMin?: number, nMax?: number, showNegative?: boolean): mathjs.Matrix {
        // by default nMin and nMax are 1 and n respectivley
        const min: number = nMin !== undefined ? nMin : n * -1;
        const max: number = nMax !== undefined ? nMax : n;
        // find all factors from min to max
        const _ret: number[] = [];
        for (let num = min; num <= max; num++) {
            if (n % num === 0) {
                if (num > 0 || showNegative === true) _ret.push(mathjs.eval(String(num)));
            }
        }
        // return the sorted array
        return mathjs.matrix(
            _ret.sort((a: number, b: number): number => {
                return a - b;
            }),
        );
    },

    f_commonFactors: function (
        n1: number,
        n2: number,
        nMin?: number,
        nMax?: number,
        showNegative?: boolean,
    ): mathjs.Matrix {
        // get the common factors of each
        const factors1 = (mathjs as any).f_factors(n1, nMin, nMax, showNegative);
        const factors2 = (mathjs as any).f_factors(n2, nMin, nMax, showNegative);

        // make real arrays from them
        const array1: number[] = [];
        const array2: number[] = [];

        mathjs.forEach(factors1, (value) => {
            array1.push(value);
        });

        mathjs.forEach(factors2, (value) => {
            array2.push(value);
        });

        const _ret = array1.filter((value) => array2.includes(value));
        return mathjs.matrix(
            _ret.sort((a: number, b: number): number => {
                return a - b;
            }),
        );
    },

    f_multiples: function (n: number, nMin?: number, nMax?: number, count?: number): any {
        // by default nMin and nMax are 1 and 10 respectivley
        const numRet: number = count !== undefined ? count : 10;
        const min: number = nMin !== undefined ? nMin : n;
        const max: number = nMax !== undefined ? nMax : n * numRet;

        // get all the multiples
        const _ret: number[] = [];
        for (let i = 1; i <= numRet; i++) {
            const multiple = parseFloat((n * i).toPrecision(12));
            if (multiple <= max && multiple >= min) {
                _ret.push(multiple);
            }
        }

        return mathjs.matrix(_ret);
    },

    f_commonMultiples: function (n1: number, n2: number, nMin?: number, nMax?: number, count?: number): any {
        // get the common factors of each
        const factors1 = (mathjs as any).f_multiples(n1, nMin, nMax, 100);
        const factors2 = (mathjs as any).f_multiples(n2, nMin, nMax, 100);
        const numRet: number = count !== undefined ? count : 10;

        // make real arrays from them
        const array1: number[] = [];
        const array2: number[] = [];

        mathjs.forEach(factors1, (value) => {
            array1.push(value);
        });

        mathjs.forEach(factors2, (value) => {
            array2.push(value);
        });

        let _ret = array1.filter((value) => array2.includes(value));
        _ret = _ret.sort((a: number, b: number): number => {
            return a - b;
        });

        _ret = _ret.slice(0, numRet);

        return mathjs.matrix(_ret);
    },

    f_strike: function (n: any): any {
        return n;
    },

    f_bstrike: function (n: any): any {
        return n;
    },

    f_divR: function (a: number, b: number): any {
        return a / b;
    },

    f_exp: function (a: number, exp: number): any {
        return mathjs.eval(`(${a}) ^ (${exp})`);
    },

    // Returns a so it can be used in the tree as the insides of the box
    f_box: function (a: any): any {
        return a;
    },

    f_boxbox: function (a: any): any {
        return a;
    },

    // Returns the evaluated given expression so it can be used in the tree
    f_boxOp: function (left: any, right: number, operator: string): any {
        return mathjs.eval(`${left} ${operator} ${right}`);
    },

    f_boxplus: function (a: number, _exp: number): any {
        return a;
    },

    f_boxtimes: function (a: number, _exp: number): any {
        return a;
    },

    f_subscript: function (tex: string, subTex: string): string {
        return tex + "_" + subTex;
    },

    f_superscript: function (tex: string, subTex: string): string {
        return tex + "^" + subTex;
    },

    f_evalWSymbol: function (a: number, symbol: string, b: number): any {
        let symbolStr = symbol.toString();
        if (symbolStr[0] === `"` && symbolStr[symbolStr.length - 1] === `"`) {
            symbolStr = symbolStr.slice(1, symbolStr.length - 1);
        }
        // build the xpression
        const expStr: string = `${a.toString()} ${symbolStr} ${b.toString()}`;
        // console.log(expStr);
        return mathjs.eval(expStr);
    },

    f_recurring: function (num: string | number, recurring: number): number | string {
        const numAddOp = mathjs.eval(num.toString()) < 0 ? "-" : "+";

        if (recurring < 0) {
            return "ERROR";
        }

        let eqString: string = num.toString().replace(/\"/g, "");
        const digitsAfterDecimal = num.toString().split(".")[1] ? num.toString().split(".")[1].length : 0;

        if (digitsAfterDecimal > 0) {
            eqString += ` ${numAddOp} (1/10^${digitsAfterDecimal})`;
            eqString += ` * ${recurring} / ${"9".repeat(recurring.toString().length)}`;
        } else {
            eqString += ` ${numAddOp} ${recurring} / ${"9".repeat(recurring.toString().length)}`;
        }

        return mathjs.eval(eqString);
    },

    f_deg: function (): string {
        return "deg";
    },
    f_degF: function (): string {
        return "degF";
    },
    f_degC: function (): string {
        return "degC";
    },
    f_unit(unit: string): string {
        return unit;
    },
    f_symbol(symbol: string): string {
        return symbol;
    },
    f_op(symbol: string): string {
        return symbol;
    },
    f_string(symbol: string): string {
        return symbol;
    },

    f_hat(symbol: string): string {
        return symbol;
    },
    f_widehat(symbol: string): string {
        return symbol;
    },
    f_angle(symbol: string): string {
        return symbol;
    },
    f_tally(number: number): number {
        return number;
    },

    cis(angle: number, radius?: number, _mode?: string): number {
        return (mathjs as any).type.Complex.fromPolar(radius ? radius : 1, angle);
    },

    f_datasetFromFreqs(rawValues: mathjs.Matrix, rawFreqs: mathjs.Matrix): mathjs.Matrix {
        const values = [];
        const freqs = [];
        rawValues.forEach((val) => values.push(val));
        rawFreqs.forEach((val) => freqs.push(val));

        const output: number[] = [];
        for (const [index, val] of values.entries()) {
            for (let i = 0; i < freqs[index]; i++) {
                output.push(val);
            }
        }
        return mathjs.matrix(output);
    },

    getElement(array: mathjs.Matrix, index: number): any {
        const regArray = [];
        array.forEach((item) => {
            regArray.push(item);
        });

        return regArray[index - 1];
    },

    f_filter(array: mathjs.Matrix, boolCheck: string): mathjs.Matrix {
        // console.log(boolCheck.replace(/x/g, "2"), mathjs.eval(boolCheck.replace(/x/g, "2")));

        const newArray = [];
        array.forEach((item) => {
            if (mathjs.eval(boolCheck.replace(/x/g, item.toString())) === true) {
                newArray.push(item);
            }
        });

        return mathjs.matrix(newArray);
    },

    length(array: any[]): number {
        const regArray = [];
        array.forEach((item) => {
            regArray.push(item);
        });

        return regArray.length;
    },

    trunc(num: number, perc: number = 0): number {
        return Math.trunc(num * 10 ** perc) / 10 ** perc;
    },
};

function customUnits(math: any): void {
    math.createUnit("millionths", {
        aliases: ["millionth", "millionths"],
    });
    math.createUnit("hundredThousandths", {
        definition: "10 millionths",
        aliases: ["hundredthousandth", "hundredthousandths"],
    });
    math.createUnit("tenthousandths", {
        definition: "10 hundredthousandths",
        aliases: ["tenThousandths", "tenthousandth"],
    });
    math.createUnit("thousandths", {
        definition: "10 tenthousandths",
        aliases: ["thousandth", "thousandths"],
    });
    math.createUnit("hundredths", {
        definition: "10 thousandths",
        aliases: ["hundredth", "hundredths"],
    });
    math.createUnit("tenths", {
        definition: "10 hundredths",
        aliases: ["tenth", "tenths"],
    });
    math.createUnit("one", {
        definition: "10 tenths",
        aliases: ["one", "amyOnes"],
    });

    math.createUnit("tens", {
        definition: "10 one",
        aliases: ["ten", "tens"],
    });
    math.createUnit("hundreds", {
        definition: "10 tens",
        aliases: ["hundred", "hundreds"],
    });
    math.createUnit("thousands", {
        definition: "10 hundreds",
        aliases: ["thousand", "thousands"],
    });
    math.createUnit("tenthousands", {
        definition: "10 thousands",
        aliases: ["tenThousands", "tenthousand"],
    });
    math.createUnit("hundredthousands", {
        definition: "10 tenthousands",
        aliases: ["hundredThousand", "hundredthousands"],
    });
    math.createUnit("millions", {
        definition: "10 hundredthousands",
        aliases: ["million", "millions"],
    });

    math.createUnit("cent", {
        aliases: ["cents", "cent"],
    });
    math.createUnit("dollar", {
        definition: "100 cents",
        aliases: ["dollars", "dollar"],
    });
}

function importFuncs(math: any): void {
    try {
        math.import(customFunctions);
        customUnits(math);
    } catch (e) {
        console.error(`MathJS Custom Functions importer failed: ${e.message}`);
        // console.log("this should only happen when running a test framework in watch mode");
    }
}

importFuncs(mathjs);
export { mathjs };
