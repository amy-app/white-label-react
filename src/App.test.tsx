import { render, screen } from "@testing-library/react";
import marked from "marked";
import React from "react";
import { BlockMath, InlineMath } from "react-katex";
import Plot from "react-plotly.js";
import AmyRender from "./modules/amy-render/AmyRender";
import { AmyRenderFuncs } from "./modules/amy-render/latexUtils";

// NOT WORKING

test("renders learn react link", () => {
    const text = `## Header\n\nthis is a test $[\\frac{1}{2}]$ g[plot({"data" : [{"x": [1,1], "y": [2,2]}]})]g`;
    const config = { color: "black" };
    const renderFuncs: AmyRenderFuncs = {
        latex: {
            inline: (key: string, text: string) => <InlineMath key={key} math={text} />,
            block: (key: string, text: string) => <BlockMath key={key} math={text} />,
        },
        plot: (name: string, data: any, layout: any) => <Plot key={name} data={data} layout={layout} />,
        markdown: marked,
    };

    render(<AmyRender text={text} config={config} renderFuncs={renderFuncs} />);
    const linkElement = screen.getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
});
