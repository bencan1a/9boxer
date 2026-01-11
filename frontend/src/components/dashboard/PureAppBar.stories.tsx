/**
 * Storybook stories for AppBar components
 */

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { PureAppBar } from "./PureAppBar";

const meta = {
  title: "App/Dashboard/AppBar",
  component: PureAppBar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    fileName: {
      control: "text",
      description: "Current file name",
    },
    changeCount: {
      control: { type: "number", min: 0, max: 20 },
      description: "Number of unsaved changes",
    },
    hasActiveFilters: {
      control: "boolean",
      description: "Whether filters are active",
    },
    isFilterDisabled: {
      control: "boolean",
      description: "Whether filter button is disabled",
    },
    isExporting: {
      control: "boolean",
      description: "Whether export is in progress",
    },
  },
  args: {
    // Default args for all stories
    onImportClick: fn(),
    onLoadSampleClick: fn(),
    onExportClick: fn(),
    onFilterClick: fn(),
    onSettingsClick: fn(),
    onUserGuideClick: fn(),
    onAboutClick: fn(),
  },
} satisfies Meta<typeof PureAppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Empty state - No file loaded
 */
export const EmptyState: Story = {
  args: {
    fileName: undefined,
    changeCount: 0,
    hasActiveFilters: false,
    filterTooltip: "Filter employees",
    isFilterDisabled: true,
  },
};

/**
 * File loaded - No changes
 */
export const FileLoaded: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "view-controls-simplified-appbar" },
  },
  args: {
    fileName: "employees.xlsx",
    changeCount: 0,
    hasActiveFilters: false,
    filterTooltip: "Filter employees",
    isFilterDisabled: false,
  },
};

/**
 * File loaded with unsaved changes
 */
export const WithChanges: Story = {
  args: {
    fileName: "employees.xlsx",
    changeCount: 3,
    hasActiveFilters: false,
    filterTooltip: "Filter employees",
    isFilterDisabled: false,
  },
};

/**
 * File loaded with many changes
 */
export const ManyChanges: Story = {
  args: {
    fileName: "team_performance_review_2024.xlsx",
    changeCount: 15,
    hasActiveFilters: false,
    filterTooltip: "Filter employees",
    isFilterDisabled: false,
  },
};

/**
 * With active filters
 */
export const WithActiveFilters: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "filters-active-chips" },
  },
  args: {
    fileName: "employees.xlsx",
    changeCount: 5,
    hasActiveFilters: true,
    filterTooltip:
      "Active filters:\nLevels: Senior, Manager\nFunctions: Engineering, Product\nLocations: San Francisco, New York",
    isFilterDisabled: false,
  },
};

/**
 * Exporting in progress
 */
export const Exporting: Story = {
  args: {
    fileName: "employees.xlsx",
    changeCount: 8,
    hasActiveFilters: false,
    filterTooltip: "Filter employees",
    isFilterDisabled: false,
    isExporting: true,
  },
};

/**
 * Long file name
 */
export const LongFileName: Story = {
  args: {
    fileName:
      "Q4_2024_Performance_Review_and_Talent_Assessment_Master_File_v3_final.xlsx",
    changeCount: 12,
    hasActiveFilters: true,
    filterTooltip: "Active filters:\nLevels: Executive\nExcluded: 5 employees",
    isFilterDisabled: false,
  },
};

/**
 * File menu open state
 */
export const FileMenuOpen: Story = {
  args: {
    fileName: "employees.xlsx",
    changeCount: 3,
    hasActiveFilters: false,
    filterTooltip: "Filter employees",
    isFilterDisabled: false,
    isFileMenuOpen: true,
  },
};

/**
 * Help menu open state
 */
export const HelpMenuOpen: Story = {
  args: {
    fileName: "employees.xlsx",
    changeCount: 0,
    hasActiveFilters: false,
    filterTooltip: "Filter employees",
    isFilterDisabled: false,
    isHelpMenuOpen: true,
  },
};
