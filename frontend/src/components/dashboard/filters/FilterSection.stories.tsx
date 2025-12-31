import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FilterSection } from "./FilterSection";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";

const meta: Meta<typeof FilterSection> = {
  title: "Dashboard/FilterSection",
  component: FilterSection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    title: {
      control: "text",
      description: "Section title displayed in the header",
    },
    count: {
      control: { type: "number", min: 0, max: 99 },
      description: "Number of active filters (shows badge if > 0)",
    },
    expanded: {
      control: "boolean",
      description: "Whether the section is expanded",
    },
    onToggle: {
      action: "toggled",
      description: "Callback when section is toggled",
    },
    testId: {
      control: "text",
      description: "Test ID for testing",
    },
  },
};

export default meta;
type Story = StoryObj<typeof FilterSection>;

/**
 * Default collapsed state with no active filters
 */
export const DefaultCollapsed: Story = {
  args: {
    title: "Job Levels",
    count: 0,
    expanded: false,
    testId: "filter-section-job-levels",
    children: (
      <FormGroup>
        <FormControlLabel control={<Checkbox size="small" />} label="Entry" />
        <FormControlLabel control={<Checkbox size="small" />} label="Mid" />
        <FormControlLabel control={<Checkbox size="small" />} label="Senior" />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label="Principal"
        />
      </FormGroup>
    ),
  },
};

/**
 * Expanded section showing filter options
 */
export const Expanded: Story = {
  args: {
    title: "Locations",
    count: 0,
    expanded: true,
    testId: "filter-section-locations",
    children: (
      <FormGroup>
        <FormControlLabel
          control={<Checkbox size="small" />}
          label="New York"
        />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label="San Francisco"
        />
        <FormControlLabel control={<Checkbox size="small" />} label="London" />
        <FormControlLabel control={<Checkbox size="small" />} label="Tokyo" />
      </FormGroup>
    ),
  },
};

/**
 * Section with active filters showing count badge
 */
export const WithCountBadge: Story = {
  args: {
    title: "Job Functions",
    count: 3,
    expanded: true,
    testId: "filter-section-job-functions",
    children: (
      <FormGroup>
        <FormControlLabel
          control={<Checkbox size="small" checked />}
          label="Engineering"
        />
        <FormControlLabel
          control={<Checkbox size="small" checked />}
          label="Product"
        />
        <FormControlLabel
          control={<Checkbox size="small" checked />}
          label="Design"
        />
        <FormControlLabel control={<Checkbox size="small" />} label="Sales" />
        <FormControlLabel
          control={<Checkbox size="small" />}
          label="Marketing"
        />
      </FormGroup>
    ),
  },
};

/**
 * Interactive section with state management
 * Demonstrates typical usage with toggleable expansion
 */
const InteractiveExample = () => {
  const [expanded, setExpanded] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const options = ["Option 1", "Option 2", "Option 3", "Option 4"];

  const handleToggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  return (
    <div style={{ width: 280 }}>
      <FilterSection
        title="Interactive Section"
        count={selectedOptions.length}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        testId="filter-section-interactive"
      >
        <FormGroup>
          {options.map((option) => (
            <FormControlLabel
              key={option}
              control={
                <Checkbox
                  size="small"
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleToggleOption(option)}
                />
              }
              label={option}
            />
          ))}
        </FormGroup>
      </FilterSection>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveExample />,
};

/**
 * Section with custom content (buttons instead of checkboxes)
 */
export const CustomContent: Story = {
  args: {
    title: "Exclusions",
    count: 5,
    expanded: true,
    testId: "filter-section-exclusions",
    children: (
      <div>
        <Button variant="outlined" size="small" fullWidth>
          Manage Exclusions
        </Button>
      </div>
    ),
  },
};

/**
 * Multiple sections stacked together
 * Shows how sections look in the actual FilterDrawer context
 */
const MultipleStackedExample = () => {
  const [expandedSections, setExpandedSections] = useState({
    levels: true,
    functions: false,
    locations: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div style={{ width: 280 }}>
      <FilterSection
        title="Job Levels"
        count={2}
        expanded={expandedSections.levels}
        onToggle={() => toggleSection("levels")}
        testId="filter-section-levels"
      >
        <FormGroup>
          <FormControlLabel
            control={<Checkbox size="small" checked />}
            label="Senior"
          />
          <FormControlLabel
            control={<Checkbox size="small" checked />}
            label="Mid"
          />
          <FormControlLabel control={<Checkbox size="small" />} label="Entry" />
        </FormGroup>
      </FilterSection>

      <FilterSection
        title="Job Functions"
        count={0}
        expanded={expandedSections.functions}
        onToggle={() => toggleSection("functions")}
        testId="filter-section-functions"
      >
        <FormGroup>
          <FormControlLabel
            control={<Checkbox size="small" />}
            label="Engineering"
          />
          <FormControlLabel
            control={<Checkbox size="small" />}
            label="Product"
          />
          <FormControlLabel
            control={<Checkbox size="small" />}
            label="Design"
          />
        </FormGroup>
      </FilterSection>

      <FilterSection
        title="Locations"
        count={1}
        expanded={expandedSections.locations}
        onToggle={() => toggleSection("locations")}
        testId="filter-section-locations"
      >
        <FormGroup>
          <FormControlLabel
            control={<Checkbox size="small" checked />}
            label="New York"
          />
          <FormControlLabel
            control={<Checkbox size="small" />}
            label="San Francisco"
          />
        </FormGroup>
      </FilterSection>
    </div>
  );
};

export const MultipleStacked: Story = {
  render: () => <MultipleStackedExample />,
};
