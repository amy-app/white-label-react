import * as React from "react";
import { mathjs } from "./customMathJSFunctions";
import { AmyRenderFuncs } from "./latexUtils";

export interface IProps {
    data: string;
    renderFuncs: AmyRenderFuncs;
}

export default function AmyPlot(props: IProps) {
    const { renderFuncs } = props;
    let data: any = props.data;
    let layout: any = {};

    // get the given function name
    const funcName: string = props.data.split("(")[0];

    try {
        // try to parse the params for the func
        const dataJson = JSON.parse(props.data.slice(funcName.length + 1, props.data.length - 1));

        // make a new layout object
        const layout2: any = { dragmode: false, clickmode: false };
        // for each of the json layout attributes, add them to the new layout
        for (const attr in dataJson.layout) {
            if (dataJson.layout.hasOwnProperty(attr)) {
                layout2[attr] = dataJson.layout[attr];
            }
        }

        let newXaxisRange = { min: -10, max: 10 };
        const newMargin = {
            t: 60,
            b: 30,
            l: 30,
            r: 30,
        };

        // now check if we redefine the limits
        if (layout2.xaxis) {
            if (layout2.xaxis.range) {
                newXaxisRange = {
                    min: parseFloat(layout2.xaxis.range[0]),
                    max: parseFloat(layout2.xaxis.range[1]),
                };
            }
        }
        if (!layout2.margin) {
            layout2.margin = newMargin;
        }

        layout = layout2;
        // if piecewise, dont show legend

        const traces = colorTraces(dataJson.data);

        if (funcName === "plot") {
            const newDataArray = [];
            for (const traceJSON of traces) {
                let newData: any;

                // if it has an eq
                if (traceJSON.eq !== undefined) {
                    const eqData = getEqData(traceJSON, newXaxisRange);
                    for (const trace of eqData) {
                        newData = trace;
                        for (const property in trace) {
                            if (trace.hasOwnProperty(property) && property !== "eq") {
                                newData[property] = trace[property];
                            }
                        }
                        newDataArray.push(newData);
                    }
                    if (eqData.length > 1) {
                        layout.showlegend = false;
                    }
                }
                // it has an x, y
                else {
                    newData = getPointsData(traceJSON);
                    for (const property in traceJSON) {
                        if (traceJSON.hasOwnProperty(property) && property !== "eq") {
                            newData[property] = traceJSON[property];
                        }
                    }
                    newDataArray.push(newData);
                }
            }
            data = newDataArray;
        } else if (funcName === "table") {
            data = dataJson.data;
        }

        // console.log(`Plotly Data:`, data);
        // console.log(`Plotly layout:`, layout);
        const plotElem = renderFuncs.plot("myChart", data, layout);
        return <span>{plotElem}</span>;
    } catch (e) {
        return <span>Error: ${e.message}</span>;
    }
}

function colorTraces(traces: any[]): any[] {
    // first we need to check if any trace already has color
    const usedColors: string[] = [];
    for (const trace of traces) {
        if (trace.line && trace.line.color) {
            usedColors.push(trace.line.color);
        } else if (trace.marker && trace.marker.color) {
            usedColors.push(trace.marker.color);
        }
    }

    // the plotly colors in order of use for traces
    const colors = {
        blue: "blue",
        orange: "orange",
        green: "green",
        red: "red",
        purple: "purple",
        brown: "brown",
        pink: "pink",
        grey: "grey",
        yellow: "yellow",
        cyan: "cyan",
    };
    const colorOrder = Object.entries(colors)
        .map(([_, value]) => value)
        .filter((color) => !usedColors.includes(color));

    // now we color every trace according to the standard plotly coloring
    let index = 0;
    for (const trace of traces) {
        const thisColor = colorOrder[index];

        if (!trace.line && !trace.marker) {
            trace.line = {
                color: thisColor,
            };
        }
        if (trace.line && !trace.line.color) {
            trace.line.color = thisColor;
        }
        if (trace.marker && !trace.marker.color) {
            trace.marker.color = thisColor;
        }

        index += 1;
        if (index >= colorOrder.length) {
            index = 0;
        }
    }

    return traces;
}

function isRealNum(n: number): boolean {
    return typeof n === "number" && !isNaN(n) && isFinite(n);
}

/**
 * Sometimes the incline of an equation line is too steep so we find where it intersects X and jump there
 * @param {number} lastX
 * @param {number} thisX
 * @param {string} exp
 * @returns {any[]}
 */
function getXIntersect(
    lastVal: { x: number; y: number },
    nextVal: { x: number; y: number },
    exp: string,
    depth: number = 20,
): { x: number; y: number } {
    // check the equation at halfway between lastX and thisX
    const difference = Math.abs(lastVal.x - nextVal.x) / 2;
    const halfwayX = lastVal.x + difference;
    const halfwayY = mathjs.eval(exp.replace(/x/g, `(${halfwayX.toString()})`));
    const halfwayVal: { x: number; y: number } = { x: halfwayX, y: halfwayY };

    // console.log(`Halfway between ${lastVal.x} === ${nextVal.x}   ${difference}    => ${halfwayX}`);

    if (depth === 0 || lastVal.x === nextVal.x || halfwayX === lastVal.x || halfwayX === nextVal.x) {
        // console.log(
        //     `PRECONDITION EXIT getXIntersect(${lastVal.x}, ${nextVal.x}, ${exp})   =>   ${halfwayVal.x}, ${halfwayVal.y}`,
        // );
        if (isRealNum(halfwayVal.y)) {
            return halfwayVal;
        } else if (isRealNum(lastVal.y)) {
            return lastVal;
        } else if (isRealNum(nextVal.y)) {
            return nextVal;
        }
    }

    let yValue: { x: number; y: number };
    // we did NOT find a value at halfway
    if (!isRealNum(halfwayVal.y)) {
        // going into equation
        if (!isRealNum(lastVal.y)) {
            yValue = getXIntersect(halfwayVal, nextVal, exp, depth - 1);
        }
        // going out of equation
        else {
            yValue = getXIntersect(lastVal, halfwayVal, exp, depth - 1);
        }
    }
    // we did find a value at halfway
    else {
        // going into equation
        if (!isRealNum(lastVal.y)) {
            yValue = getXIntersect(lastVal, halfwayVal, exp, depth - 1);
        }
        // going out of equation
        else {
            yValue = getXIntersect(halfwayVal, nextVal, exp, depth - 1);
        }
    }
    // if (depth === 100) console.log(`getXIntersect(${lastVal.x}, ${nextVal.x}, ${exp})   =>   ${yValue.x}, ${yValue.y}`);
    return yValue;
}

/**
 * Generates the x, y data for a single given trace, handles piecewise functions and asymptotes edge cases
 * @param {*} data
 * @param {{ min: number; max: number }} xLimits
 * @return {*}  {any[]}
 */
function getEqData(data: any, xLimits: { min: number; max: number }): any[] {
    const dataEq = data.eq; // full equation
    const pieces = dataEq.split(";").map((itm: string) => itm.trim()); // length === 1 for std funcs, length > 1 for piecewise
    const stepSize = (Math.abs(xLimits.min) + Math.abs(xLimits.max)) / 1000;

    // ============================ Generates raw Data ============================ //
    let conditions: Array<{ eq: string; condition: string }> = [];
    let ret: Array<{
        x: any[];
        y: any[];
        type: string;
        mode: string;
        line: any;
        marker?: Object;
        // size?: number
    }> = [];
    for (const piece of pieces) {
        const pieceArr = piece.split(",");
        let exp = pieceArr[0];
        if (exp[0] === "y") {
            exp = exp.split("=")[1]?.trim(); // eg: x + 4
        }
        const condition = pieceArr.length > 1 ? pieceArr[1].replace("for", "").trim() : "true"; // eg: for x > 2 and x <= 4
        conditions.push({ eq: exp, condition: condition });

        // loop over x range, checking condition
        let thisTrace: any = { x: [], y: [] };
        for (let x = xLimits.min; x < xLimits.max; x += stepSize) {
            try {
                const xValue = parseFloat(x.toFixed(3));

                // test if x value is in the current piece. if so, add data to the current trace
                if (mathjs.eval(condition, { x: xValue }) === true) {
                    let yValue = mathjs.eval(exp, { x: xValue });
                    yValue = Math.round(yValue * 1000) / 1000;

                    if (thisTrace[thisTrace.length - 1]) {
                        const prevX = thisTrace.x[thisTrace.length - 1];
                        const prevY = thisTrace.y[thisTrace.length - 1];

                        if (
                            (!isRealNum(prevY) && isRealNum(yValue)) || // going into equation
                            (isRealNum(prevY) && !isRealNum(yValue)) // going out of equation
                        ) {
                            const xIntersect = getXIntersect({ x: prevX, y: prevY }, { x: xValue, y: yValue }, exp);
                            thisTrace.x.push(xIntersect.x);
                            thisTrace.y.push(xIntersect.y);
                            thisTrace.x.push(xValue);
                            thisTrace.y.push(yValue);
                            continue;
                        }
                    }
                    thisTrace.x.push(xValue);
                    thisTrace.y.push(yValue);
                }
            } catch (e) {
                console.error(e);
            }
        }
        ret.push(thisTrace);
        thisTrace = { x: [], y: [] };
    }

    // ============================ Asymptote Splitting ============================ //
    // iterate over all ORIGINAL traces found above (ie, multiple for piecewise functions)
    // save traces to retNew. If a trace contains a singularity, add that subtrace to retNew
    // and append the remainder to ret for further singularity checking
    const retNew: Array<{
        x: any[];
        y: any[];
        type: string;
        mode: string;
        line: any;
        marker?: Object;
    }> = [];
    for (const trace of ret) {
        let prevY = trace.y[0];
        let asymptoteDetected = false;
        for (const [index, thisY] of trace.y.slice(1).entries()) {
            let derivative = (thisY - prevY) / stepSize;
            // if derivative is large and the function swaps sign
            if ((derivative > 1000 || derivative < -1000) && prevY * thisY < 0) {
                // extract 0 to ith elements (up to and including prevY) into a new trace and push onto retNew
                retNew.push({
                    x: trace.x.slice(0, index + 1), // note: i + 1 as we have sliced off the first ele
                    y: trace.y.slice(0, index + 1),
                    type: trace.type,
                    mode: trace.mode,
                    line: trace.line,
                });
                // push the remaining trace onto ret to be checked for further asymptotes
                ret.push({
                    x: trace.x.slice(index + 1),
                    y: trace.y.slice(index + 1),
                    type: trace.type,
                    mode: trace.mode,
                    line: trace.line,
                });
                asymptoteDetected = true;
                break; // we pushed the remainder of the trace onto the end, so check later and skip for now
            }
            prevY = thisY;
        }
        if (asymptoteDetected === false) {
            retNew.push(trace);
        }
    }
    ret = retNew;

    // for any new traces, copy the properties from data
    for (const property in data) {
        if (data.hasOwnProperty(property) && property !== "eq") {
            for (const newTrace of ret) {
                newTrace[property] = data[property];
                newTrace[property] = data[property];
            }
        }
    }

    // if we have already added a neg data trace, we need to hide the label for the positive
    if (ret.length > 0) {
        (ret[0] as any).showlegend = false;
    }

    // ============================ Piecewise End Markers ============================ //
    // finally, plot the bounds circles (if piecewise function)
    // filter out the true from normal functions and split any 'and'-ed conditions
    conditions = conditions.filter((val) => val.condition !== "true"); // filter out normal functions
    // handles case where a previous marker should be removed
    let prevCondition = "";
    let prevBoundary = -Infinity;
    let prevYValue = -Infinity;
    for (let conditionObj of conditions) {
        const eq = conditionObj.eq;
        const condition = conditionObj.condition;
        const conditionArray = condition.split("and").map((itm) => itm.trim());
        if (conditionArray.length > 0) {
            for (const c of conditionArray) {
                const matches = c.match(/(<=|>=|<|>|=|!=)\s(-?[0-9]+\.?[0-9]*)/);
                let marker: Object;
                const markerColor = data.marker && data.marker.color ? data.marker.color : "blue";

                const currYValue = mathjs.eval(eq, { x: matches[2] });
                if (
                    prevBoundary === Number(matches[2]) &&
                    prevYValue === currYValue &&
                    ((matches[1] === ">=" && prevCondition === "<=") ||
                        (matches[1] === ">" && prevCondition === "<=") ||
                        (matches[1] === ">=" && prevCondition === "<"))
                ) {
                    // for these cases, we don't want a circle. however, we have already pushed
                    // the previous circle onto ret. so pop and dont add another
                    ret.pop(); // don't want this
                    continue;
                } else if (matches[1].includes("=") && matches[1] !== "!=") {
                    // closed circle
                    marker = { color: markerColor, size: 17 }; // use input data color
                } else {
                    // open circle
                    marker = { color: "white", size: 15, line: { color: markerColor, width: 2 } };
                }
                ret.push({
                    x: [matches[2]],
                    y: [currYValue],
                    type: "circle",
                    mode: "markers",
                    line: "",
                    marker,
                });
                prevCondition = matches[1];
                prevBoundary = Number(matches[2]);
                prevYValue = currYValue;
            }
        }
    }
    return ret;
}

/**
 * Takes a data object eg: {x: [1,2,3], y: [43,2 4],...} and adds it to the state
 *
 * @param {*} data
 * @memberof AmyPlot
 */
function getPointsData(data: any): any {
    const newData: any = {};
    // add the data's x and y value to the state
    for (const property in data) {
        if (data.hasOwnProperty(property) && property !== "eq") {
            newData[property] = data[property];
        }
    }
    return newData;
}
