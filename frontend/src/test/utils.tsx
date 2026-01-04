/* eslint-disable react-refresh/only-export-components */
// This is a test utility file that intentionally exports both components and helper functions

import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getTheme } from "../theme/theme";
import { I18nTestWrapper } from "./i18nTestUtils";
import { GridZoomProvider } from "../contexts/GridZoomContext";

// Create a default theme for testing (light mode)
const theme = getTheme("light");

// Custom render function that includes providers
interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  return (
    <I18nTestWrapper>
      <ThemeProvider theme={theme}>
        <GridZoomProvider>
          <CssBaseline />
          {children}
        </GridZoomProvider>
      </ThemeProvider>
    </I18nTestWrapper>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllTheProviders, ...options }),
  };
};

// Re-export everything from React Testing Library
export * from "@testing-library/react";
export { customRender as render };
