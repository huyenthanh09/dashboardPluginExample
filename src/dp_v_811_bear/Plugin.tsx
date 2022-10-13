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
    dashboardAttributeFilterToAttributeFilter,
    IDashboardAttributeFilterProps,
    changeAttributeFilterSelection,
    changeDateFilterSelection,
    changeFilterContextSelection,
    clearDateFilterSelection,
    CustomDashboardWidgetComponent,
    resetAttributeFilterSelection,
    selectFilterContextAttributeFilterByDisplayForm,
    useDashboardSelector,
    useDispatchDashboardCommand,
    ICustomWidget,
    useCustomWidgetInsightDataView,
    useParentFilters,
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
import { AttributeFilter, AttributeFilterButton, useAttributeFilterController } from "@gooddata/sdk-ui-filters";

import entryPoint from "../dp_v_811_bear_entry";

import React from "react";
import { areObjRefsEqual, filterAttributeElements, idRef, newNegativeAttributeFilter, newRelativeDateFilter, uriRef } from "@gooddata/sdk-model";
import { max } from "lodash";

/*
 * Component to render 'myCustomWidget'. If you create custom widget instance and also pass extra data,
 * then that data will be available in
 */
function MyCustomWidget(_props: IDashboardWidgetProps): JSX.Element {
    return <div>Hello from custom widget</div>;
}

function CustomAttributeFilter1(props: IDashboardAttributeFilterProps): JSX.Element {
    const { filter, onFilterChanged } = props;
    const attributeFilter = dashboardAttributeFilterToAttributeFilter(filter);
    const {
        isLoadingInitialElementsPage,
        elements,
        workingSelectionElements,
        isWorkingSelectionInverted,
        onSelect,
        onApply,
    } = useAttributeFilterController({
        filter: attributeFilter,
        onApply: (newFilter, isInverted) =>
            onFilterChanged({
                attributeFilter: {
                    ...filter.attributeFilter,
                    attributeElements: filterAttributeElements(newFilter),
                    negativeSelection: isInverted,
                },
            }),
    });

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 55,
                margin: "0 10px",
                fontSize: 12,
            }}
        >
            {isLoadingInitialElementsPage && "Loading..."}
            {elements.map((element) => {
                const isSelected =
                    (!isWorkingSelectionInverted && workingSelectionElements.includes(element)) ||
                    (isWorkingSelectionInverted && !workingSelectionElements.includes(element));
                return (
                    <div
                        style={{
                            backgroundColor: isSelected ? "yellow" : "white",
                            fontWeight: isSelected ? "bold" : "normal",
                            margin: 10,
                            border: "1px solid #000",
                            borderRadius: 5,
                            padding: 10,
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            const newSelection = workingSelectionElements.includes(element)
                                ? workingSelectionElements.filter((e) => e !== element)
                                : workingSelectionElements.concat([element]);
                            onSelect(newSelection, isWorkingSelectionInverted);
                            onApply();
                        }}
                        key={element.uri}
                    >
                        {element.title}
                    </div>
                );
            })}
        </div>
    );
}

const CustomDropdownActions = (props: IAttributeFilterDropdownActionsProps) => {
    const { onApplyButtonClick, onCancelButtonClick, isApplyDisabled=false } = props;
    return (
        <div
            style={{
                borderTop: "1px solid black",
                display: "flex",
                padding: 10,
                margin: 0,
                justifyContent: "right",
                background: "yellow",
            }}
        >
            <button style={{ border: "1px solid red", margin:"0 10px 0 0"}} onClick={onCancelButtonClick}  disabled={isApplyDisabled}>
                Custom Close button
            </button>
            <button style={{ border: "1px solid red" }} onClick={onApplyButtonClick}  disabled={isApplyDisabled}>
                Custom Apply button
            </button>
        </div>
    );
};

const CustomElementsSelectActionsComponent: React.VFC<IAttributeFilterElementsActionsProps> = (props) => {
    const { onChange, onToggle, totalItemsCount, isVisible } = props;

    if (!isVisible) {
        return null;
    }

    return (
        <div
            style={{
                background: "pink",
                width: "100%",
                paddingLeft: 10,
            }}
        >
            <button onClick={() => onChange(true)}>all</button>
            <button onClick={() => onChange(false)}>none</button>
            <button onClick={() => onToggle()}>toggle</button>
            <span style={{ paddingLeft: 10 }}>({totalItemsCount})</span>
        </div>
    );
};

const CustomDropdownButton = (props: IAttributeFilterDropdownButtonProps) => {
    const { title, onClick, selectedItemsCount, subtitle, icon, isDraggable } = props;

    return (
        <button draggable={isDraggable} style={{ border: "1px solid black", width:'300px' }} onClick={onClick}>
            {title} - ({subtitle}) - ({selectedItemsCount} {icon})
        </button>
    );
};

const CustomElementsSearchBar = (props: IAttributeFilterElementsSearchBarProps) => {
    const { onSearch, searchString } = props;

    return (
        <div
            style={{
                borderBottom: "1px solid black",
                padding: 10,
                margin: "0 0 5px",
                background: "cyan",
            }}
        >
            Search attribute values:{" "}
            <input
                style={{ width: "100%" }}
                onChange={(e) => onSearch(e.target.value)}
                value={searchString}
            />
        </div>
    );
};

const CustomElementsSelectItem = (props: IAttributeFilterElementsSelectItemProps) => {
    const { isSelected, item, onDeselect, onSelect } = props;

    return (
        <div
            style={{
                borderBottom: "3px solid #fff",
                padding: "0 10px",
                background: "cyan",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                height: "28px",
                margin: "0px 10px",
                cursor: "pointer",
            }}
            onClick={() => {
                if (isSelected) {
                    onDeselect();
                } else {
                    onSelect();
                }
            }}
        >
            <div>{item.title}</div>
            <div>{isSelected ? "✔" : ""}</div>
        </div>
    );
};

const CustomStatusBar = (props: IAttributeFilterStatusBarProps) => {
    const { selectedItems, isInverted } = props;
    return (
        <div
            style={{
                border: "2px solid black",
                display: "flex",
                margin: 0,
                justifyContent: "left",
                background: "cyan",
                alignItems: "center",
                padding: 10,
            }}
        >
            <div>
                {isInverted && selectedItems.length === 0 ? "All" : ""}
                {!isInverted && selectedItems.length === 0 ? "None" : ""}
                {isInverted && selectedItems.length > 0 ? "All except:" : ""}{" "}
                <b>{selectedItems.map((item: { title: any; }) => item.title).join(", ")}</b>
            </div>
        </div>
    );
};

function CustomAttributeFilter2(props: IDashboardAttributeFilterProps): JSX.Element {
    const { filter, onFilterChanged } = props;
    const attributeFilter = dashboardAttributeFilterToAttributeFilter(filter);
    const { parentFilters, parentFilterOverAttribute } = useParentFilters(filter);

    return (
        <div className="s-attribute-filter">
            <AttributeFilterButton
                filter={attributeFilter}
                onApply={(newFilter, isInverted) =>
                    onFilterChanged({
                        attributeFilter: {
                            ...filter.attributeFilter,
                            attributeElements: filterAttributeElements(newFilter),
                            negativeSelection: isInverted,
                        },
                    })
                }
                fullscreenOnMobile={true}
                DropdownActionsComponent={CustomDropdownActions}
                 DropdownButtonComponent={CustomDropdownButton}
                 ElementsSearchBarComponent={CustomElementsSearchBar}//{EmptyElementsSearchBar}//{CustomElementsSearchBar}
                 ElementsSelectItemComponent={CustomElementsSelectItem}
                 ElementsSelectActionsComponent={CustomElementsSelectActionsComponent}
                StatusBarComponent={CustomStatusBar}
                parentFilters={parentFilters} 
                parentFilterOverAttribute={parentFilterOverAttribute}
            />
        </div>
    );
}

function CustomAttributeFilter3(props: IDashboardAttributeFilterProps): JSX.Element {
    const { filter, onFilterChanged } = props;
    const attributeFilter = dashboardAttributeFilterToAttributeFilter(filter);
    const { parentFilters, parentFilterOverAttribute } = useParentFilters(filter);

    return (
        <div className="s-attribute-filter">
            <AttributeFilter
                filter={attributeFilter}
                onApply={(newFilter, isInverted) =>
                    onFilterChanged({
                        attributeFilter: {
                            ...filter.attributeFilter,
                            attributeElements: filterAttributeElements(newFilter),
                            negativeSelection: isInverted,
                        },
                    })
                }
                titleWithSelection={true}
                fullscreenOnMobile={true}
                parentFilters={parentFilters} 
                parentFilterOverAttribute={parentFilterOverAttribute}
            />
        </div>
    );
}

const ChangeDashboardFilter: CustomDashboardWidgetComponent = () => {
    /**
     * Creating necessary commands to dispatch filter selection change related commands.
     */
    const changeAttributeFilterSelectionCmd = useDispatchDashboardCommand(changeAttributeFilterSelection);
    const resetAttributeFilter = useDispatchDashboardCommand(resetAttributeFilterSelection);
    const changeDateFilterSelectionCmd = useDispatchDashboardCommand(changeDateFilterSelection);
    const resetDateFilter = useDispatchDashboardCommand(clearDateFilterSelection);
    const changeFilterContextSelectionCmd = useDispatchDashboardCommand(changeFilterContextSelection);

    /**
     * Select the attribute filter's local identifier from the filter's display form.
     */
    const StageNameFilterLocalId = useDashboardSelector(
        selectFilterContextAttributeFilterByDisplayForm(idRef("label.stage.name.stagename")),
    )?.attributeFilter.localIdentifier;

    const changeStageNameFilterSelection = () => {
        StageNameFilterLocalId &&
            changeAttributeFilterSelectionCmd(
                StageNameFilterLocalId,
                {
                    uris: ["/gdc/md/ugvw8nyopbuvin5byygmbvlgx3ucz5r7/obj/1095/elements?id=966644"],//discovery
                },
                "IN",
            );
    };

    const resetStageNameFilterSelection = () => {
        StageNameFilterLocalId && resetAttributeFilter(StageNameFilterLocalId);
    };

    const changeDashboardDateFilterSelection = () => {
        changeDateFilterSelectionCmd("relative", "GDC.time.year", -3, 0);
    };

    const resetDashboardDateFilter = () => {
        resetDateFilter();
    };

    const changeMultipleFilters = () => {
        // set the restaurant category filter and date filter using a single command
        changeFilterContextSelectionCmd([
            newNegativeAttributeFilter(idRef("label.owner.id.name"), {
                uris: ["/gdc/md/ugvw8nyopbuvin5byygmbvlgx3ucz5r7/obj/1025/elements?id=1229"],//cory
            }),
            newRelativeDateFilter(idRef("closed.dataset.dt"), "GDC.time.year", -10, 0),
        ]);
    };

    return (
        <div>
            <button onClick={changeStageNameFilterSelection}>
                Change StageName selection
            </button>
            <button onClick={resetStageNameFilterSelection}>Reset Stagename filter</button>
            <button onClick={changeDashboardDateFilterSelection}>Change date filter selection</button>
            <button onClick={resetDashboardDateFilter}>Clear date filter selection</button>
            <button onClick={changeMultipleFilters}>Change multiple filters at once</button>
        </div>
    );
};

const insightRef = idRef("aadpNSgqd1zb");
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
                    //tickFormatter={simpleCurrencyFormatter.format}
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

export class Plugin extends DashboardPluginV1 {
    public readonly author = entryPoint.author;
    public readonly displayName = entryPoint.displayName;
    public readonly version = entryPoint.version;
    public readonly minEngineVersion = entryPoint.minEngineVersion;
    public readonly maxEngineVersion = entryPoint.maxEngineVersion;

    public onPluginLoaded(_ctx: DashboardContext, _parameters?: string): Promise<void> | void {

    }

    public register(
        ctx: DashboardContext,
        customize: IDashboardCustomizer,
        handlers: IDashboardEventHandling,
    ): void {
        customize.filters().attribute().withCustomProvider((filter) => {
            // Use case, when we want to render different filter for specific display form
            // Note: replace this only with attributes with two or three elements
            // as it renders them right in the filter bar
            if (
                areObjRefsEqual(
                    filter.attributeFilter.displayForm,
                    uriRef("/gdc/md/"+ ctx.workspace +"/obj/1028"),//sale-rep
                )
            ) {
                return CustomAttributeFilter2;
            }
            else if (
                areObjRefsEqual(
                    filter.attributeFilter.displayForm,
                    uriRef("/gdc/md/"+ ctx.workspace +"/obj/1805"),//stage name
                )
            ){
                return CustomAttributeFilter2;
            }
            //return CustomAttributeFilter3;
            
        });

            //customize.filterBar().setRenderingMode("hidden");


         customize.customWidgets().addCustomWidget("changeFilter", ChangeDashboardFilter);
         customize.customWidgets().addCustomWidget("myWidgetWithFilters2", customWidgetUsingInsightExecution);
        customize.customWidgets().addCustomWidget("myCustomWidget", MyCustomWidget);
        customize.layout().customizeFluidLayout((_layout, customizer) => {
            customizer.addSection(
                0,
                newDashboardSection(
                    "Section Added By Plugin",
                    newDashboardItem(newCustomWidget("myWidget1", "myCustomWidget"), {
                        xl: {
                            // all 12 columns of the grid will be 'allocated' for this this new item
                            gridWidth: 12,
                            // minimum height since the custom widget now has just some one-liner text
                            gridHeight: 1,
                        },
                    }),
                    newDashboardItem(newCustomWidget("myWidget2", "changeFilter"), {
                        xl: {
                            // all 12 columns of the grid will be 'allocated' for this this new item
                            gridWidth: 12,
                            // minimum height since the custom widget now has just some one-liner text
                            gridHeight: 5,
                        },
                    }),
                    newDashboardItem(
                        newCustomWidget("myWidget3", "myWidgetWithFilters2", {
                            // specify which date data set to used when applying the date filter to this widget
                            // if not specified, the date filter is ignored
                            dateDataSet: idRef("snapshot.dataset.dt"),
                            // specify which attribute filters to ignore for this widget
                            // if empty or not specified, all attribute filters are used
                            ignoreDashboardFilters: [
                                {
                                    type: "attributeFilterReference",
                                    displayForm: idRef("label.stage.name.stagename"),
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
        handlers.addEventHandler("GDC.DASH/EVT.INITIALIZED", (evt) => {
            // eslint-disable-next-line no-console
            console.log("### Dashboard initialized", evt);
        });
    }

    public onPluginUnload(_ctx: DashboardContext): Promise<void> | void {

    }
}
