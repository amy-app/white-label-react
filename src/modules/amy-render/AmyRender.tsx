import "katex/dist/katex.min.css";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { BlockMath, InlineMath } from "react-katex";
import sanitizeHtml from "sanitize-html";
import { AmyDiagram } from "./AmyDiagram";
import AmyPlot from "./AmyPlot";
import {
    AmyRenderConfig,
    AmyRenderFuncs,
    findBracketSubString,
    hasSymetricBrackets,
    ITextPosition,
} from "./latexUtils";

export interface Props {
    text: string; // The text that might include latex indicated with $[]$ signs
    config: AmyRenderConfig;
    renderFuncs: AmyRenderFuncs;
}

/**
 * AmyRender looks at any value and searches for $[]$ indicators to render them in latex
 * @export
 * @extends {React.Component<IProps>}
 */
export default function AmyRender(props: Props) {
    const latexifiedText: string = props.text;
    const outputElems: JSX.Element[] = [];
    const { ignoreGraphs, ignoreDiagrams, color } = props.config;

    let currentLatexTextBlock: string = "";

    // only format to latex if all brackets have the same amount of openings + closings
    if (hasSymetricBrackets(latexifiedText)) {
        const openClosing: ITextPosition[] = findBracketSubString(latexifiedText);

        console.log(openClosing);

        openClosing.forEach((value, index) => {
            if (value.type === "graph") {
                if (ignoreGraphs !== true) {
                    outputElems.push(
                        <span key={index}>
                            <br />
                            <AmyPlot data={value.text} renderFuncs={props.renderFuncs} />
                            <br />
                            <br />
                        </span>,
                    );
                }
            } else if (value.type === "diagram") {
                if (ignoreDiagrams !== true) {
                    // get the svgCode from the object
                    let SVGCode = "";
                    if (JSON.parse(value.text).svgCode) {
                        SVGCode = JSON.parse(value.text).svgCode;
                    } else {
                        console.error("Failed to find SVGCode in diagram ");
                    }
                    outputElems.push(
                        <span key={index}>
                            <br />
                            <AmyDiagram
                                data={value.text}
                                svgCode={SVGCode}
                                config={{ color: color === "white" ? "white" : "black" }}
                                renderFuncs={props.renderFuncs}
                            />
                            <br />
                            <br />
                        </span>,
                    );
                }
            } else {
                if (value.type === "latex") {
                    currentLatexTextBlock += `$[${value.text}]$`;
                } else {
                    currentLatexTextBlock += value.text;
                }

                // if we are looking at a latex or text and the next one isnt one, we should merge and add them to the outputElems
                if (openClosing[index + 1]) {
                    if (openClosing[index + 1].type !== "text" && openClosing[index + 1].type !== "latex") {
                        // merge all the preceeding blocks into one text
                        outputElems.push(
                            mergeLatexTextIPositions(currentLatexTextBlock, index, props.config, props.renderFuncs),
                        );
                        currentLatexTextBlock = "";
                    }
                } else {
                    outputElems.push(
                        mergeLatexTextIPositions(currentLatexTextBlock, index, props.config, props.renderFuncs),
                    );
                }
            }
        });

        if (openClosing.length === 0) {
            outputElems.push(<React.Fragment>{latexifiedText}</React.Fragment>);
        }
        return <React.Fragment>{outputElems}</React.Fragment>;
    } else {
        // in case not the same amount of openeing and closing exist. Return an error
        console.error(`Error: Non-symmetric brackets in ${latexifiedText}`);
        return <React.Fragment />;
    }
}

/**
 * Takes all the latex and text textPositions and merges them, returning the JSX.Elements
 * @private
 * @param {ITextPosition[]} text
 * @returns {JSX.Element[]}
 */
function mergeLatexTextIPositions(
    text: string,
    index: number,
    config: AmyRenderConfig,
    renderers: AmyRenderFuncs,
): JSX.Element {
    let mdReadyText = text;
    const openClosing = findBracketSubString(text);
    const { color, useBlockMath, ignoreGraphs } = config;
    const inParagraph = ignoreGraphs !== true;

    openClosing.forEach((value, openCLosingindex) => {
        if (value.type === "latex") {
            mdReadyText = mdReadyText.replace(`$[${value.text}]$`, `$[[nonMarkdown_${openCLosingindex}]]$`);
        }
    });

    mdReadyText = sanitizeHtml(renderers.markdown(mdReadyText));

    openClosing.forEach((value, openCLosingindex) => {
        if (value.type === "latex") {
            let thisHTML: string = "";
            if (useBlockMath) {
                if (color !== undefined) {
                    thisHTML = ReactDOMServer.renderToString(
                        renderers.latex.block(openCLosingindex.toString(), `\\color{${color}}` + value.text),
                    );
                } else {
                    thisHTML = ReactDOMServer.renderToString(<BlockMath key={openCLosingindex} math={value.text} />);
                }
            } else {
                if (color !== undefined) {
                    thisHTML = ReactDOMServer.renderToString(
                        renderers.latex.inline(openCLosingindex.toString(), `\\color{${color}}` + value.text),
                    );
                } else {
                    thisHTML = ReactDOMServer.renderToString(<InlineMath key={openCLosingindex} math={value.text} />);
                }
            }
            mdReadyText = mdReadyText.replace(`$[[nonMarkdown_${openCLosingindex}]]$`, thisHTML);
        }
    });

    // console.log(mdReadyText);

    // trim the <p></p> so the latex doesnt render as a new paragraph

    // if blockMath is false, we know we arent using it as in a bubble, so we can ignore the paragraphs
    if (useBlockMath === true || !inParagraph) {
        mdReadyText = mdReadyText.slice(3, mdReadyText.length - 5);
        return <span key={index} className="amymarkdown" dangerouslySetInnerHTML={{ __html: mdReadyText }} />;
    } else {
        return (
            <span
                key={index}
                className="amymarkdown"
                style={{ margin: "20px 0", display: "block" }}
                dangerouslySetInnerHTML={{ __html: mdReadyText }}
            />
        );
    }
}
