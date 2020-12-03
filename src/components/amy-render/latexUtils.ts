/**
 * This is a utility file for anything related to Latex.
 */

export interface InstructionSection {
    type: "text" | "latex" | "graph" | "diagram";
    start: number;
    end: number;
    text: string;
}

export interface AmyRenderConfig {
    color?: "white" | "black"; // The color the latex should be, supports all Latex colors
    ignoreGraphs?: boolean; // Ignores any graph notation so the output only shows plain text, diagrams and latex
    ignoreDiagrams?: boolean; // Ignores any diagram notation so the output only shows plain text, graphs and latex
    useBlockMath?: boolean; // Displays in blockMath mode, so displays on its own line and regular fonts on fractions
}

export interface AmyRenderFuncs {
    markdown: (text: string) => any;
    latex: { inline: (key: string, text: string) => any; block: (key: string, text: string) => any };
    plot: (...args: any) => any;
}

/**
 *  checks if the text at position index matches the multi-char needle
 *  eg: isBracket("Solve $[2 + 4]$", 6, "$[")  -> True
 *
 * @param {string} text
 * @param {*} index
 * @param {*} needle
 */
function isBracket(text: string, index: number, needle: string): boolean {
    let textCount = index;
    for (const char of needle) {
        if (text[textCount] !== char) {
            return false;
        }
        textCount++;
    }
    return true;
}

/**
 * For a given string       eg: "Solve the following $[2 + 3]$ with graph g[y == 2 + 2x]g"
 * it will return an        eg: [
 * array of the substrings        {type: "text", start: 0, end: 19, text: "Solve the following "},
 *                                {type: "latex", start: 22, end: 26, text: "2 + 3"}
 *                                {type: "text", start: 27, end: 38, text: " with graph "},
 *                                {type: "graph", start: 41, end: 51, text: "y == 2 + 2x"}
 *                              ]
 *
 * @private
 * @param {string} text search string
 * @returns {ITextPosition[]}
 * @memberof AmyLatex
 */
export function getInstructionSections(text: string): InstructionSection[] {
    const latexOpen = "$[";
    const latexClose = "]$";
    const graphOpen = "g[";
    const graphClose = "]g";
    const diagramOpen = "d[";
    const diagramClose = "]d";

    const openClosing: InstructionSection[] = [];
    let inProgress: InstructionSection = { type: "text", start: 0, end: -1, text: "" };

    for (let i = 0; i < text.length; i++) {
        // if we are in text mode, we can check for a start of brackets
        if (inProgress.type === "text") {
            // Check if the current position is the beginning of a bracket set
            if (isBracket(text, i, latexOpen) || isBracket(text, i, graphOpen) || isBracket(text, i, diagramOpen)) {
                // if the current inProgress isnt empty, save it
                if (inProgress.text !== "") {
                    inProgress.end = i; // because we've hit a bracker we must ignore i
                    openClosing.push(inProgress);
                    inProgress = { type: "text", start: i, end: -1, text: "" };
                }
                // console.log(openClosing);
                inProgress.type = isBracket(text, i, latexOpen)
                    ? "latex"
                    : isBracket(text, i, graphOpen)
                    ? "graph"
                    : "diagram";
                inProgress.start = i + 2; // we have to skip the start brackers for the index
                i++;
            } else {
                inProgress.text += text[i];
            }
        }
        // if the mode isnt normal text, then we should look for the end bracket
        else {
            // We need to check for the end of whatever section we are in
            if (
                (inProgress.type === "latex" && isBracket(text, i, latexClose)) ||
                (inProgress.type === "graph" && isBracket(text, i, graphClose)) ||
                (inProgress.type === "diagram" && isBracket(text, i, diagramClose))
            ) {
                inProgress.end = i;
                openClosing.push(inProgress);
                i++;
                // reset inProgress;
                inProgress = { type: "text", start: i + 1, end: -1, text: "" };
            } else {
                inProgress.text += text[i];
            }
        }
    }
    // check if we have an unpushed text substring at the end
    if (inProgress.text !== "") {
        inProgress.end = text.length;
        openClosing.push(inProgress);
    }

    // console.log(openClosing);
    return openClosing
        .map((value) => {
            return {
                ...value,
                text: text.substr(value.start, value.end - value.start),
            };
        })
        .sort((a, b) => a.start - b.start);
}

/**
 * Tests if a given string has the same amount of brackets
 * That also includes brackets like $[ ]$
 * @param latexifiedText string with brackets
 */
export function hasSymetricBrackets(latexifiedText: string) {
    const c2o = new Map([
        ["]$", "$["],
        ["}", "{"],
        [")", "("],
        ["]", "["],
    ]);

    const openBrackets = Array.from(c2o.values());
    const closingBrackets = Array.from(c2o.keys());
    const allBrackets = [...openBrackets, ...closingBrackets];

    let stack: string[] = [];

    // window function
    for (let i = 0; i < latexifiedText.length; i++) {
        for (const b of allBrackets) {
            const sub = latexifiedText.substring(i, i + b.length);
            if (sub === b) {
                stack.push(sub);
                if (b.length > 1) {
                    i = i + b.length - 1;
                }
                break;
            }
        }
    }

    // if we have unqual number it's for sure wrong
    if (stack.length % 2 !== 0) {
        return false;
    }

    // each type of bracket must have equal numbers
    for (const [op, cl] of Array.from(c2o)) {
        if (stack.filter((e) => e === op).length !== stack.filter((e) => e === cl).length) {
            return false;
        }
    }

    function indexOfFirstClose() {
        for (const [key, val] of Object.entries(stack)) {
            if (closingBrackets.includes(val)) {
                return Number(key);
            }
        }
        return -1;
    }

    while (stack.length > 1) {
        const firstCloseIndex = indexOfFirstClose();
        const lastOpenIndex = firstCloseIndex - 1;

        const firstClose = stack[firstCloseIndex];
        const lastOpen = stack[lastOpenIndex];

        if (c2o.get(firstClose) === lastOpen) {
            delete stack[firstCloseIndex];
            delete stack[lastOpenIndex];
            stack = stack.filter((e) => !!e);
        } else {
            return false;
        }
    }

    return true;
}

/**
 * Fast and simple PRNG taken from: https://stackoverflow.com/a/47593316
 * @param {*} a
 * @return {*}
 */
export function mulberry32(a: number): Function {
    return function () {
        // eslint-disable-line no-param-reassign
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * O(n) Fisher–Yates shuffle. Copies and shuffles the input according to the seeded RNG random().
 * Based on from: https://bost.ocks.org/mike/shuffle/
 * @param {any[]} array
 * @param {number} seed
 * @return {*}
 */
export function shuffleArray<Type>(input: Type[], seed: number = 5): Type[] {
    const array = input.slice();
    let currentIndex: number = array.length,
        randomIndex: number;
    const random = mulberry32(seed);
    // While there remain elements to shuffle ...
    while (currentIndex) {
        // Pick a remaining element…
        randomIndex = Math.floor(random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}
