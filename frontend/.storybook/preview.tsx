import type { Preview } from "@storybook/react-vite";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { I18nextProvider } from "react-i18next";
import { getTheme } from "../src/theme/theme";
import i18n from "../src/i18n/config";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = getTheme(context.globals.theme || "light");
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <I18nextProvider i18n={i18n}>
            <Story />
          </I18nextProvider>
        </ThemeProvider>
      );
    },
  ],
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme for components",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
