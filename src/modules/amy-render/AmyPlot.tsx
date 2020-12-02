import * as React from "react";
import { AmyRenderFuncs } from "./latexUtils";

export interface IProps {
    data: string;
    renderFuncs: AmyRenderFuncs;
}

export default function AmyPlot(props: IProps) {
    const { renderFuncs, data } = props;
    const [plot, setPlot] = React.useState<JSX.Element>();

    React.useEffect(() => {
        const funcName: string = data.split("(")[0];
        const dataJson = JSON.parse(data.slice(funcName.length + 1, data.length - 1));
        const plotElem = renderFuncs.plot("myChart", dataJson.data, dataJson.layout);
        console.log(renderFuncs.plot, plotElem);
        setPlot(plotElem);
    }, [data, renderFuncs]);

    if (plot) {
        return plot;
    } else {
        return <span>Loading...</span>;
    }
}
