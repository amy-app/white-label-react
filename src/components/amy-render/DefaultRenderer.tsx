import marked from "marked";
import React from "react";
import { BlockMath, InlineMath } from "react-katex";
import Plot from "react-plotly.js";
import AmyRender from "./AmyRender";
import { AmyRenderFuncs } from "./latexUtils";

const renderFuncs: AmyRenderFuncs = {
    latex: {
        inline: (key: string, text: string) => <InlineMath key={key} math={text} />,
        block: (key: string, text: string) => <BlockMath key={key} math={text} />,
    },
    plot: (name: string, data: any, layout: any) => <Plot key={name} data={data} layout={layout} />,
    markdown: marked,
};

export function InstructionRender(props: { text: string }) {
    return <AmyRender text={props.text} config={{ color: "black" }} renderFuncs={renderFuncs} />;
}

export function ExpressionRender(props: { text: string }) {
    return <AmyRender text={props.text} config={{ color: "black", useBlockMath: true }} renderFuncs={renderFuncs} />;
}
