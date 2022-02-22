// (C) 2021 GoodData Corporation
import React from "react";
import {
    CustomDashboardInsightComponent,
    // selectLocale,
    // useDashboardSelector,
    useInsightWidgetDataView,
} from "@gooddata/sdk-ui-dashboard";
import { getGaugeValues } from "./utils/gaugeUtils";
//import GaugeChart from "react-gauge-chart";

interface IGaugeParameters {
    showLabels: boolean;
    format?: "%" | "#";
}

export const gaugeFactory = (parameters: IGaugeParameters): CustomDashboardInsightComponent => {
    return (props) => {
        const {
            ErrorComponent: GaugeError,
            LoadingComponent: GaugeLoading,
            widget,
            insight,
        } = props;

        // get the current user's locale to format the numbers properly
      //  const locale = useDashboardSelector(selectLocale);

        // load the data for the insight
        const { result, error, status } = useInsightWidgetDataView({
            insightWidget: widget,
        });

        if (status === "loading" || status === "pending") {
            return <GaugeLoading />;
        }

        if (status === "error") {
            return <GaugeError message={error?.message ?? "Unknown error"} />;
        }

        // once the data is loaded, convert it to values the Gauge visualization can understand
        const { gaugeResult, gaugeError } = getGaugeValues(result!, insight);

        if (gaugeError || !gaugeResult) {
            return <GaugeError message={gaugeError?.message ?? "Unknown error"} />;
        }

        return (
            <Gauge
                max={gaugeResult.max}
                value={gaugeResult.value}
                format={parameters.format || "%"}
                //locale={locale}
                showLabels={parameters.showLabels}
            />
        )
    }
}

export const Gauge: React.FC<{
    max: number;
    value: number;
    format?: "%" | "#";
    showLabels?: boolean;
    locale?: string;
}> = ({ max, value, format = "#", showLabels = false}) => {
    const percent = value / max;
    const valueR= value;
    const maxR= max;

    return (
        <div style={{ padding: "1rem" }}>
           {
               <p>Custom widget (return first data point in the orginal insight): value: {valueR} | max: {maxR} | percant: {percent}</p>
           }
            {showLabels && (
                <svg viewBox="0 0 250 25">
                    <text x="15%" y="20">
                        {format === "#" ? "0" : "0%"}
                    </text>
                    <text x="75%" y="20">
                        {format === "#" ? max : "100%"}
                    </text>
                </svg>
            )}
        </div>
    );
};
