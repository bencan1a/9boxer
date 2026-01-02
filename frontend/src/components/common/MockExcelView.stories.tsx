import type { Meta, StoryObj } from "@storybook/react-vite";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

/**
 * MockExcelView - A visual representation of an Excel spreadsheet
 * Used for documentation screenshots showing what exported data looks like.
 * This is not a real component, just a story for screenshot generation.
 */
const MockExcelView = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Mock spreadsheet colors
  const colors = {
    header: isDark ? "#217346" : "#217346",
    headerText: "#ffffff",
    cell: isDark ? "#1e1e1e" : "#ffffff",
    cellText: isDark ? "#ffffff" : "#000000",
    border: isDark ? "#3c3c3c" : "#d4d4d4",
    selectedColumn: isDark ? "#264f36" : "#e2efda",
    rowHeader: isDark ? "#2d2d2d" : "#f3f3f3",
  };

  // Column headers - original Excel columns + 4 9Boxer columns
  const columns = [
    { key: "A", name: "Employee ID", width: 100, is9Boxer: false },
    { key: "B", name: "Name", width: 150, is9Boxer: false },
    { key: "C", name: "Title", width: 180, is9Boxer: false },
    { key: "D", name: "Department", width: 120, is9Boxer: false },
    { key: "E", name: "Performance", width: 100, is9Boxer: false },
    { key: "F", name: "Potential", width: 100, is9Boxer: false },
    { key: "G", name: "9B_Position", width: 100, is9Boxer: true },
    { key: "H", name: "9B_Modified", width: 100, is9Boxer: true },
    { key: "I", name: "9B_OriginalPos", width: 110, is9Boxer: true },
    { key: "J", name: "9B_Notes", width: 150, is9Boxer: true },
  ];

  // Mock data rows
  const rows = [
    {
      id: "E001",
      name: "Alice Johnson",
      title: "Senior Engineer",
      dept: "Engineering",
      perf: "High",
      pot: "High",
      pos: "9",
      mod: "Yes",
      orig: "5",
      notes: "Moved to Stars",
    },
    {
      id: "E002",
      name: "Bob Smith",
      title: "Product Manager",
      dept: "Product",
      perf: "Medium",
      pot: "High",
      pos: "8",
      mod: "No",
      orig: "",
      notes: "",
    },
    {
      id: "E003",
      name: "Carol White",
      title: "Data Scientist",
      dept: "Analytics",
      perf: "High",
      pot: "Medium",
      pos: "6",
      mod: "Yes",
      orig: "3",
      notes: "Promoted",
    },
  ];

  const cellStyle = (is9Boxer: boolean) => ({
    padding: "4px 8px",
    borderRight: `1px solid ${colors.border}`,
    borderBottom: `1px solid ${colors.border}`,
    backgroundColor: is9Boxer ? colors.selectedColumn : colors.cell,
    color: colors.cellText,
    fontSize: "12px",
    fontFamily: "Calibri, Arial, sans-serif",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  });

  return (
    <Box
      sx={{
        width: "fit-content",
        border: `1px solid ${colors.border}`,
        borderRadius: 1,
        overflow: "hidden",
        fontFamily: "Calibri, Arial, sans-serif",
        backgroundColor: colors.cell,
      }}
    >
      {/* Column letter headers (A, B, C...) */}
      <Box sx={{ display: "flex" }}>
        <Box
          sx={{
            width: 40,
            height: 24,
            backgroundColor: colors.rowHeader,
            borderRight: `1px solid ${colors.border}`,
            borderBottom: `1px solid ${colors.border}`,
          }}
        />
        {columns.map((col) => (
          <Box
            key={col.key}
            sx={{
              width: col.width,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: col.is9Boxer ? colors.header : colors.rowHeader,
              color: col.is9Boxer ? colors.headerText : colors.cellText,
              borderRight: `1px solid ${colors.border}`,
              borderBottom: `1px solid ${colors.border}`,
              fontSize: "11px",
              fontWeight: col.is9Boxer ? 600 : 400,
            }}
          >
            {col.key}
          </Box>
        ))}
      </Box>

      {/* Header row with column names */}
      <Box sx={{ display: "flex" }}>
        <Box
          sx={{
            width: 40,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.rowHeader,
            borderRight: `1px solid ${colors.border}`,
            borderBottom: `1px solid ${colors.border}`,
            fontSize: "11px",
          }}
        >
          1
        </Box>
        {columns.map((col) => (
          <Box
            key={col.key}
            sx={{
              width: col.width,
              height: 28,
              ...cellStyle(col.is9Boxer),
              fontWeight: 600,
              backgroundColor: col.is9Boxer ? colors.header : colors.rowHeader,
              color: col.is9Boxer ? colors.headerText : colors.cellText,
            }}
          >
            {col.name}
          </Box>
        ))}
      </Box>

      {/* Data rows */}
      {rows.map((row, idx) => (
        <Box key={row.id} sx={{ display: "flex" }}>
          <Box
            sx={{
              width: 40,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.rowHeader,
              borderRight: `1px solid ${colors.border}`,
              borderBottom: `1px solid ${colors.border}`,
              fontSize: "11px",
            }}
          >
            {idx + 2}
          </Box>
          <Box sx={{ ...cellStyle(false), width: columns[0].width }}>
            {row.id}
          </Box>
          <Box sx={{ ...cellStyle(false), width: columns[1].width }}>
            {row.name}
          </Box>
          <Box sx={{ ...cellStyle(false), width: columns[2].width }}>
            {row.title}
          </Box>
          <Box sx={{ ...cellStyle(false), width: columns[3].width }}>
            {row.dept}
          </Box>
          <Box sx={{ ...cellStyle(false), width: columns[4].width }}>
            {row.perf}
          </Box>
          <Box sx={{ ...cellStyle(false), width: columns[5].width }}>
            {row.pot}
          </Box>
          <Box sx={{ ...cellStyle(true), width: columns[6].width }}>
            {row.pos}
          </Box>
          <Box sx={{ ...cellStyle(true), width: columns[7].width }}>
            {row.mod}
          </Box>
          <Box sx={{ ...cellStyle(true), width: columns[8].width }}>
            {row.orig}
          </Box>
          <Box sx={{ ...cellStyle(true), width: columns[9].width }}>
            {row.notes}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

const meta: Meta<typeof MockExcelView> = {
  title: "App/Common/MockExcelView",
  component: MockExcelView,
  tags: ["screenshot"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof MockExcelView>;

/**
 * Shows exported Excel file with 9Boxer columns highlighted.
 * The 4 columns added by 9Boxer (9B_Position, 9B_Modified, 9B_OriginalPos, 9B_Notes)
 * are shown with green headers to indicate they were added during export.
 */
export const ExportedColumns: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "exported-excel-columns" },
  },
};
