// (C) 2021 GoodData Corporation
import {
    DashboardContext,
    DashboardPluginV1,
    IDashboardCustomizer,
    IDashboardEventHandling,
    IDashboardWidgetProps,
    newDashboardSection,
    newDashboardItem,
    newCustomWidget,
    DashboardEventBody,
    useDashboardEventDispatch,
    ICustomDashboardEvent,
    CustomDashboardWidgetComponent,
    ICustomWidget,
    useCustomWidgetExecutionDataView,
    useCustomWidgetInsightDataView,
    changeAttributeFilterSelection,
    changeDateFilterSelection,
    clearDateFilterSelection,
    resetAttributeFilterSelection,
    selectFilterContextAttributeFilterByDisplayForm,
    useDashboardSelector,
    useDispatchDashboardCommand,
} from "@gooddata/sdk-ui-dashboard";
import {
    Legend,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { BarChart } from "@gooddata/sdk-ui-charts";

import entryPoint from "../dp_bear_v_89_alpha_new_entry";
import {gaugeFactory} from "./Gauge";
import {isUsableForGauge} from "./utils/gaugeUtils";

import React from "react";
import { IMeasure, IMeasureDefinition, newMeasure, idRef, IAttribute, newAttribute, insightTags, uriRef } from "@gooddata/sdk-model";
import { max } from "lodash";

/*
 * Component to render 'myCustomWidget'. If you create custom widget instance and also pass extra data,
 * then that data will be available in
 */

const $TotalSales: IMeasure<IMeasureDefinition> = newMeasure(idRef("aaeb7jTCfexV", "measure"));
const LocationResort: IAttribute = newAttribute("label.product.id.name");

function MyCustomWidget(_props: IDashboardWidgetProps): JSX.Element {
    return <div>Hello from custom widget</div>;
}

type MyCustomEvent = ICustomDashboardEvent<{ greeting: string }>;
const TestWidget: React.FC = () => {
    const dispatch = useDashboardEventDispatch();
    return (
        <button
            type="button"
            onClick={() => {
                // trigger the custom event
                const event: DashboardEventBody<MyCustomEvent> = {
                    // custom event names must start with `CUSTOM/EVT` prefix
                    type: "CUSTOM/EVT/MY_EVENT",
                    payload: {
                        greeting: "hello",
                    },
                };
                dispatch(event);
            }}
        >
            Trigger custom event
        </button>
    );
};

const BarChartExample: React.FC = () => {
    return (
        <div style={{height: "100%"}} >
            <BarChart measures={[$TotalSales]} viewBy={LocationResort} />
        </div>
    );
};

const insightRef = idRef("aacbIUISb607");
const customWidgetUsingInsightExecution: CustomDashboardWidgetComponent = ({ widget, LoadingComponent, ErrorComponent }) => {
    const dataViewTask = useCustomWidgetInsightDataView({
        widget: widget as ICustomWidget,
        insight: insightRef,
    });

    if (dataViewTask.status === "pending" || dataViewTask.status === "loading") {
        return <LoadingComponent />;
    }

    if (dataViewTask.status === "error") {
        return <ErrorComponent message={dataViewTask.error.message ?? "Unknown error"} />;
    }

    const data = dataViewTask.result
        .data()
        .slices()
        .toArray()
        .map((slice) => {
            const rawTotalSales = slice.dataPoints()[0].rawValue;
            const rawFranchisedSales = slice.dataPoints()[1].rawValue;
            return {
                title: slice.descriptor.sliceTitles()[0],
                totalSales: rawTotalSales ? parseFloat(rawTotalSales.toString()) : 0,
                franchisedSales: rawFranchisedSales ? parseFloat(rawFranchisedSales.toString()) : 0,
            };
        });

    const maxValue = max(data.map((i) => max([i.totalSales, i.franchisedSales])))!;

    return (
        <ResponsiveContainer height={240} width="90%">
            <RadarChart data={data}>
                <PolarGrid color="#94a1ad" />
                <PolarAngleAxis dataKey="title" color="#94a1ad" />
                <PolarRadiusAxis
                    angle={90}
                    color="#94a1ad"
                    domain={[0, maxValue]}
                    tickFormatter={simpleCurrencyFormatter.format}
                />
                <Radar name="bop" dataKey="totalSales" stroke="#14b2e2" fill="#14b2e2" fillOpacity={0.6} />
                <Radar
                    name="eop"
                    dataKey="franchisedSales"
                    stroke="#00c18e"
                    fill="#00c18e"
                    fillOpacity={0.6}
                />
                <Tooltip />
                <Legend />
            </RadarChart>
        </ResponsiveContainer>
    );
};

const simpleCurrencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits: 3,
});
const product: IAttribute = newAttribute("label.product.id.name");
const bop: IMeasure<IMeasureDefinition> = newMeasure(idRef("aaeb7jTCfexV", "measure"));
const eop: IMeasure<IMeasureDefinition> = newMeasure(idRef("aazb6kroa3iC", "measure"));
const MyCustomWidgetWithFilters: CustomDashboardWidgetComponent = ({ widget, LoadingComponent, ErrorComponent }) => {
    const dataViewTask = useCustomWidgetExecutionDataView({
        widget: widget as ICustomWidget,
        execution: {
            seriesBy: [bop, eop],
            slicesBy: [product],
        },
    });

    if (dataViewTask.status === "pending" || dataViewTask.status === "loading") {
        return <LoadingComponent />;
    }

    if (dataViewTask.status === "error") {
        return <ErrorComponent message={dataViewTask.error.message ?? "Unknown error"} />;
    }

    const data = dataViewTask.result
        .data()
        .slices()
        .toArray()
        .map((slice) => {
            const rawTotalSales = slice.dataPoints()[0].rawValue;
            const rawFranchisedSales = slice.dataPoints()[1].rawValue;
            return {
                title: slice.descriptor.sliceTitles()[0],
                totalSales: rawTotalSales ? parseFloat(rawTotalSales.toString()) : 0,
                franchisedSales: rawFranchisedSales ? parseFloat(rawFranchisedSales.toString()) : 0,
            };
        });

    const maxValue = max(data.map((i) => max([i.totalSales, i.franchisedSales])))!;

    return (
        <ResponsiveContainer height={240} width="90%">
            <RadarChart data={data}>
                <PolarGrid color="#94a1ad" />
                <PolarAngleAxis dataKey="title" color="#94a1ad" />
                <PolarRadiusAxis
                    angle={90}
                    color="#94a1ad"
                    domain={[0, maxValue]}
                    tickFormatter={simpleCurrencyFormatter.format}
                />
                <Radar
                    name="Total Sales"
                    dataKey="totalSales"
                    stroke="#14b2e2"
                    fill="#14b2e2"
                    fillOpacity={0.6}
                />
                <Radar
                    name="Franchised Sales"
                    dataKey="franchisedSales"
                    stroke="#00c18e"
                    fill="#00c18e"
                    fillOpacity={0.6}
                />
                <Tooltip />
                <Legend />
            </RadarChart>
        </ResponsiveContainer>
    );
};

const changeFilterDashboard: CustomDashboardWidgetComponent = () => {
    /**
     * Creating necessary commands to dispatch filter selection change related commands.
     */
    const changeAttributeFilterSelectionCmd = useDispatchDashboardCommand(changeAttributeFilterSelection);
    const resetAttributeFilter = useDispatchDashboardCommand(resetAttributeFilterSelection);
    const changeDateFilterSelectionCmd = useDispatchDashboardCommand(changeDateFilterSelection);
    const resetDateFilter = useDispatchDashboardCommand(clearDateFilterSelection);

    /**
     * Select the attribute filter's local identifier from the filter's display form.
     */
    const ProductFilterLocalId = useDashboardSelector(
        selectFilterContextAttributeFilterByDisplayForm(
            uriRef("/gdc/md/ryfz7w64063fkotl5mr0yv5ikpijt8s4/obj/952"),
        ),
    )?.attributeFilter.localIdentifier;

    const changeProductFilterSelection = () => {
        ProductFilterLocalId &&
            changeAttributeFilterSelectionCmd(
                ProductFilterLocalId,
                {
                    //explore, phoenix
                    uris: [
                        "/gdc/md/ryfz7w64063fkotl5mr0yv5ikpijt8s4/obj/949/elements?id=169655",
                        "/gdc/md/ryfz7w64063fkotl5mr0yv5ikpijt8s4/obj/949/elements?id=964771",
                    ],
                },
                "IN",
            );
    };

    const resetProductFilterSelection = () => {
        ProductFilterLocalId && resetAttributeFilter(ProductFilterLocalId);
    };

    const changeDashboardDateFilterSelection = () => {
        changeDateFilterSelectionCmd("relative", "GDC.time.date", -99, 0);
    };

    const resetDashboardDateFilter = () => {
        resetDateFilter();
    };

    return (
        <div>
            <button onClick={changeProductFilterSelection}>Change Product selection</button>
            <button onClick={resetProductFilterSelection}>Reset Product filter</button>
            <button onClick={changeDashboardDateFilterSelection}>Change date filter selection</button>
            <button onClick={resetDashboardDateFilter}>Clear date filter selection</button>
        </div>
    );
};


export class Plugin extends DashboardPluginV1 {
    public readonly author = entryPoint.author;
    public readonly displayName = entryPoint.displayName;
    public readonly version = entryPoint.version;
    public readonly minEngineVersion = entryPoint.minEngineVersion;
    public readonly maxEngineVersion = entryPoint.maxEngineVersion;

    /**
     * Tags define by plugin to be replaced.
     */
     public tags: string[] = ["gauge"];

     /**
     * Defines gauge chart min/max values label visibility.
     */
    public showLabels: boolean = true;
   

    public onPluginLoaded(_ctx: DashboardContext, _parameters?: string): Promise<void> | void {
        /*
         * This will be called when the plugin is loaded in context of some dashboard and before
         * the register() method.
         *
         * If the link between the dashboard and this plugin is parameterized, then all the parameters will
         * be included in the parameters string.
         *
         * The parameters are useful to modify plugin behavior in context of particular dashboard.
         *
         * Note: it is safe to delete this stub if your plugin does not need any specific initialization.
         */
    }

    public register(
        _ctx: DashboardContext,
        customize: IDashboardCustomizer,
        handlers: IDashboardEventHandling,
    ): void {
        //set mode of filter bar, last definition will win
        customize.filterBar().setRenderingMode("hidden");
        customize.filterBar().setRenderingMode("default");

        customize.customWidgets().addCustomWidget("myCustomWidget", MyCustomWidget);
        customize.customWidgets().addCustomWidget("barchart", BarChartExample);
        customize.customWidgets().addCustomWidget("test", TestWidget);
        customize.customWidgets().addCustomWidget("myWidgetWithFilters", MyCustomWidgetWithFilters);
        customize.customWidgets().addCustomWidget("myWidgetWithFilters2", customWidgetUsingInsightExecution);
        customize.customWidgets().addCustomWidget("myWidgetChangeFilters", changeFilterDashboard);

        customize.insightWidgets().withCustomProvider((insight) => {
            /**
             * If at least one tag from plugin parameters (or `gauge` tag) is present in the tags of the insight
             * and the insight is suitable to be used, replace this insight with GaugeAdapter component.
             */
            if (
                insightTags(insight).some((insightTag) =>
                    this.tags.includes(insightTag)
                ) &&
                isUsableForGauge(insight)
            ) {
                return gaugeFactory({showLabels: this.showLabels});
            }
            /**
             * If undefined is returned, nothing happens and original component stays in place.
             */
            return undefined;
        });

        customize.layout().customizeFluidLayout((_layout, customizer) => {
            customizer.addSection(0,
                newDashboardSection(
                    "Custom widget: 1. uses date snapshot and ignore Sale rep attribute filter. 2. ignore date, rele rep and account. 3. uses date created and all filters",
                    newDashboardItem(
                        newCustomWidget("myWidget1", "myWidgetWithFilters", {
                            // specify which date data set to used when applying the date filter to this widget
                            // if not specified, the date filter is ignored
                            dateDataSet: idRef("snapshot.dataset.dt"),
                            // specify which attribute filters to ignore for this widget
                            // if empty or not specified, all attribute filters are used
                            ignoreDashboardFilters: [
                                {
                                    type: "attributeFilterReference",
                                    displayForm: idRef("label.owner.id"),
                                },
                            ],
                        }),
                        {
                            xl: {gridWidth: 6,gridHeight: 12,},
                        },
                    ),
                    newDashboardItem(
                        newCustomWidget("myWidget2", "myWidgetWithFilters", {
                            //dateDataSet: idRef("created.dataset.dt"), // ignore date filter
                            ignoreDashboardFilters: [
                                {
                                    type: "attributeFilterReference",
                                    displayForm: idRef("label.owner.id"),//sale rep (owner display form)
                                },
                                {
                                    type: "attributeFilterReference",
                                    displayForm: idRef("label.account.id.name"), //account (default display form)
                                },
                            ],
                        }),
                        {
                            xl: {gridWidth: 6,gridHeight: 12,},
                        },
                    ),
                    
                ),
                
            );
        });
        //add widget to section 0
        customize.layout().customizeFluidLayout((_layout, customizer) => {
            customizer.addItem(0, -1, 
                newDashboardItem(
                    newCustomWidget("myWidget3", "myWidgetWithFilters2", {
                        dateDataSet: idRef("created.dataset.dt"), 
                    }),
                    {
                        xl: {gridWidth: 6,gridHeight: 12,},
                    },
            ),
                
            );
        });

        customize.layout().customizeFluidLayout((_layout, customizer) => {
            customizer.addSection(1,
                newDashboardSection(
                    "Change dashboard filters",
                    newDashboardItem(
                        newCustomWidget("myWidgetToChangeFilters", "myWidgetChangeFilters"),
                        {
                            xl: {gridWidth: 12,gridHeight: 5,},
                        },
                    ),
                    
                ),
                
            );
        });     

        customize.layout().customizeFluidLayout((_layout, customizer) => {
            customizer.addSection(2, {
                items: [
                    {
                        size: { xl: { gridWidth: 8, gridHeight: 30 } },
                        type: "IDashboardLayoutItem",
                        widget: {
                            // this custom type must match the type used in the addCustomWidget call
                            customType: "barchart",
                            identifier: "foo_3",
                            ref: idRef("foo_3"),
                            type: "customWidget",
                            uri: "foo_3/chart",
                        },
                    },
                    {
                        size: { xl: { gridWidth: 4 } },
                        type: "IDashboardLayoutItem",
                        widget: {
                            // this custom type must match the type used in the addCustomWidget call
                            customType: "test",
                            identifier: "foo_3",
                            ref: idRef("foo_3"),
                            type: "customWidget",
                            uri: "foo_3/chart",
                        },
                    },
                ],
                type: "IDashboardLayoutSection",
                header: {
                    title: "Hi from plugin",
                    description: "This section is created by old way",
                },
            });
        });

        handlers.addEventHandler("GDC.DASH/EVT.INITIALIZED", (evt) => {
            // eslint-disable-next-line no-console
            console.log("### Dashboard initialized", evt);
        });
        handlers.addCustomEventHandler({
            eval: (e) => e.type === "CUSTOM/EVT/MY_EVENT",
            handler: (e: MyCustomEvent) => {
                console.log("Custom event received", e.payload?.greeting);
            },
        });

        handlers.addEventHandler("GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.SELECTION_CHANGED", (evt) => {
            console.log("### date filter changed: ", evt);
        });

        handlers.addEventHandler("GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.SELECTION_CHANGED", (evt) => {
            console.log("### attribute filter changed: ", evt);
        });

        handlers.addEventHandler("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED", (evt) => {
            console.log("### filter context changed: ", evt);
        });

        handlers.addEventHandler("GDC.DASH/EVT.DEINITIALIZED", (evt) => {
            console.log("### De-initialized dasboard event: ", evt);
        });

        handlers.addEventHandler("GDC.DASH/EVT.SAVED", (evt) => {
            console.log("### save event change: ", evt);
        });

        handlers.addEventHandler("GDC.DASH/EVT.COPY_SAVED", (evt) => {
            console.log("### copy save event change: ", evt);
        });

        handlers.addEventHandler("GDC.DASH/EVT.SHARING.CHANGED", (evt) => {
            console.log("### Sharing permission change: ", evt);
        });

    }
    

    public onPluginUnload(_ctx: DashboardContext): Promise<void> | void {
        /*
         * This will be called when user navigates away from the dashboard enhanced by the plugin. At this point,
         * your code may do additional teardown and cleanup.
         *
         * Note: it is safe to delete this stub if your plugin does not need to do anything extra during unload.
         */
    }
}
