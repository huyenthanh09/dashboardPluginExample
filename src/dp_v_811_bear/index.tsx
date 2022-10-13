// (C) 2021 GoodData Corporation
import { IDashboardPluginContract_V1 } from "@gooddata/sdk-ui-dashboard";
import { Plugin } from "./Plugin";

import "@gooddata/sdk-ui-filters/styles/css/main.css";
import "@gooddata/sdk-ui-kit/styles/css/main.css";

/**
 * Wraps the plugin and reexports it as a default export. This makes its subsequent loading easier.
 * Do not change this file.
 */
const PluginFactory: () => IDashboardPluginContract_V1 = () => {
    return new Plugin();
};

export default PluginFactory;
