import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import AmyRender from "./AmyRender";
import { AmyRenderConfig, AmyRenderFuncs } from "./latexUtils";

export interface Props {
    data: string;
    svgCode: string;
    config: AmyRenderConfig;
    renderFuncs: AmyRenderFuncs;
}

export function AmyDiagram(props: Props) {
    let amySvgDiagramRef: HTMLDivElement;
    const [svgContainerDimensions, setSvgContainerDimensions] = useState<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>();
    // console.log(`Rendering AmyDIagram`);

    useEffect(() => {
        window.addEventListener("resize", updateDimensions);

        updateDimensions();

        return () => {
            return window.removeEventListener("resize", updateDimensions);
        };
    });

    function updateDimensions(): void {
        // save the current svg containher dimensions
        const svgContainer = ReactDOM.findDOMNode(amySvgDiagramRef) as any;
        if (svgContainer) {
            // console.log(`updateDimensions found amySVG_diagram and is updating the dimensions`);
            const obj: { x: number; y: number; width: number; height: number } = svgContainer.getBoundingClientRect(); // outputs <h3> coordinates

            if (svgContainerDimensions) {
                if (
                    obj.x !== (svgContainerDimensions.x || -1) ||
                    obj.y !== (svgContainerDimensions.y || -1) ||
                    obj.width !== svgContainerDimensions.width ||
                    obj.height !== svgContainerDimensions.height
                ) {
                    setSvgContainerDimensions({ x: obj.x, y: obj.y, width: obj.width, height: obj.height });
                }
            } else {
                setSvgContainerDimensions({ x: obj.x, y: obj.y, width: obj.width, height: obj.height });
            }
        }
    }

    let rawCode = atob(props.svgCode);
    rawCode = rawCode.replace(/stroke-width="1"/g, `stroke-width="3"`);
    rawCode = rawCode.replace(/stroke-width="2"/g, `stroke-width="3"`);

    rawCode = rawCode.replace(/#aaaaaa/g, `rgba(0,0,0,0.25)`);
    rawCode = rawCode.replace(/#AAAAAA/g, `rgba(0,0,0,0.25)`);

    // we need to invert all our colors, so when we invert later for the black -> white the colors look original
    rawCode = rawCode.replace(/#F24C4C/g, `#6EDCDD`); // red
    rawCode = rawCode.replace(/#f24c4c/g, `#6EDCDD`); // red
    rawCode = rawCode.replace(/#F99F3D/g, `#4fb7e4`); // orange
    rawCode = rawCode.replace(/#f99f3d/g, `#4fb7e4`); // orange
    rawCode = rawCode.replace(/#DDD200/g, `#8c96f0`); // yellow
    rawCode = rawCode.replace(/#ddd200/g, `#8c96f0`); // yellow
    rawCode = rawCode.replace(/#4BE261/g, `#cfa5d7`); // green
    rawCode = rawCode.replace(/#4be261/g, `#cfa5d7`); // green
    rawCode = rawCode.replace(/#50B6EF/g, `#d7ab80`); // blue
    rawCode = rawCode.replace(/#50b6ef/g, `#d7ab80`); // blue
    rawCode = rawCode.replace(/#AC6DE8/g, `#bcccae`); // indigo / purple
    rawCode = rawCode.replace(/#ac6de8/g, `#bcccae`); // indigo / purple
    rawCode = rawCode.replace(/#E46DE8/g, `#a5caad`); // violet
    rawCode = rawCode.replace(/#e46de8/g, `#a5caad`); // violet
    rawCode = rawCode.replace(/#99561A/g, `#bad8ef`); // brown
    rawCode = rawCode.replace(/#99561a/g, `#bad8ef`); // brown

    const SVGsrc = "data:image/svg+xml;base64," + btoa(rawCode);

    let labelsObj: any[] = [];
    let svgScale = 1;
    let margins = { top: 0, bottom: 0, left: 0, right: 0 };
    try {
        const dataJson = JSON.parse(props.data);
        if (!dataJson.format.scale || !dataJson.labels) {
            console.error("Parsing error in Diagram JSON: Missing scale or labels \n");
        } else {
            if (dataJson.format.margins) {
                margins = dataJson.format.margins;
            }
            if (dataJson.format.scale) {
                svgScale = dataJson.format.scale;
            }
            if (dataJson.labels) {
                labelsObj = dataJson.labels;
            }
        }
    } catch (e) {
        console.error("Parsing error in Diagram JSON: \n" + e.message);
    }

    // console.log(svgContainerDimensions, labelsObj);

    const labelElems: JSX.Element[] = [];
    const dimens = svgContainerDimensions;
    if (dimens && dimens.width !== undefined && dimens?.height !== undefined) {
        labelsObj.forEach((label, index) => {
            const posX = label.x * dimens.width + 30;
            const posY = label.y * dimens.height - 22;
            labelElems.push(
                <span
                    style={{
                        top: 0,
                        left: 0,
                        position: "absolute",
                        transform: `translate(${posX}px, ${posY}px)`,
                    }}
                    key={index}
                >
                    <AmyRender
                        renderFuncs={props.renderFuncs}
                        config={{ color: "white" ? "white" : "black" }}
                        text={`$[${labelsObj[index].val}]$`}
                    />
                </span>,
            );
        });
    }

    let svgStyle: any = { backgroundColor: "white" };
    if (props.config.color === "white") {
        svgStyle = {
            filter: "invert(100%) brightness(230%)",
        };
    }

    return (
        <div>
            <div
                style={{
                    position: "relative",
                    paddingTop: margins.top,
                    paddingBottom: margins.bottom,
                    paddingLeft: margins.left,
                    paddingRight: margins.right,
                    width: 800 * svgScale + margins.left + margins.right,
                }}
                ref={(el) => {
                    if (el) {
                        amySvgDiagramRef = el;
                    }
                }}
            >
                <img
                    alt="AmyDiagram"
                    onLoad={() => updateDimensions()}
                    src={SVGsrc}
                    width={800 * svgScale}
                    style={svgStyle}
                />
                {labelElems}
            </div>
        </div>
    );
}
