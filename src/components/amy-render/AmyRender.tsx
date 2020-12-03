import "katex/dist/katex.min.css";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import sanitizeHtml from "sanitize-html";
import { AmyDiagram } from "./AmyDiagram";
import AmyPlot from "./AmyPlot";
import {
    AmyRenderConfig,
    AmyRenderFuncs,
    getInstructionSections,
    hasSymetricBrackets,
    InstructionSection,
} from "./latexUtils";
import "./markdownStyle.css";

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
        const openClosing: InstructionSection[] = getInstructionSections(latexifiedText);

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
 * @param {InstructionSection[]} text
 * @returns {JSX.Element[]}
 */
function mergeLatexTextIPositions(
    text: string,
    index: number,
    config: AmyRenderConfig,
    renderers: AmyRenderFuncs,
): JSX.Element {
    let mdReadyText = text;
    const openClosing = getInstructionSections(text);
    const { color, useBlockMath, ignoreGraphs } = config;
    const inParagraph = ignoreGraphs !== true;

    openClosing.forEach((value, index) => {
        if (value.type === "latex") {
            mdReadyText = mdReadyText.replace(`$[${value.text}]$`, `$[[nonMarkdown_${index}]]$`);
        }
    });

    mdReadyText = sanitizeHtml(renderers.markdown(mdReadyText));

    openClosing.forEach((value, index) => {
        if (value.type === "latex") {
            let thisHTML: string = "";
            const colorCode = color ? `\\color{${color}}` : "";
            const renderFunc = useBlockMath ? renderers.latex.block : renderers.latex.inline;
            thisHTML = ReactDOMServer.renderToString(renderFunc(index.toString(), colorCode + value.text));

            mdReadyText = mdReadyText.replace(`$[[nonMarkdown_${index}]]$`, thisHTML);
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
