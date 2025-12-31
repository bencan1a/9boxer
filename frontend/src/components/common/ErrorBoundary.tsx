/**
 * Error boundary component to catch React rendering errors
 */

import { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { useTheme, Theme } from "@mui/material/styles";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useTranslation } from "react-i18next";
import { logger } from "../../utils/logger";

interface Props {
  children: ReactNode;
  t?: (key: string) => string;
  theme?: Theme;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("Uncaught error", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      const t = this.props.t || ((key: string) => key);
      const theme = this.props.theme;

      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            bgcolor: "background.default",
            padding: (theme?.tokens.spacing.lg ?? 24) / 8, // Convert 24px to 3
          }}
          data-testid="error-boundary"
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: theme?.tokens.dimensions.errorBoundary.maxWidth ?? 600,
              padding: (theme?.tokens.spacing.xl ?? 32) / 8, // Convert 32px to 4
              textAlign: "center",
              bgcolor: "background.paper",
            }}
            data-testid="error-boundary-content"
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: theme?.tokens.dimensions.errorBoundary.iconSize ?? 60,
                color: "error.main",
                mb: (theme?.tokens.spacing.md ?? 16) / 8, // Convert 16px to 2
              }}
            />
            <Typography variant="h4" gutterBottom>
              {t("common.errorBoundary.title")}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {t("common.errorBoundary.message")}
            </Typography>

            {this.state.error && (
              <Box
                sx={{
                  mt: (theme?.tokens.spacing.lg ?? 24) / 8, // Convert 24px to 3
                  p: (theme?.tokens.spacing.md ?? 16) / 8, // Convert 16px to 2
                  bgcolor: "action.hover",
                  borderRadius: theme?.tokens.radius.sm ?? 4, // 4px radius
                  textAlign: "left",
                }}
              >
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontFamily: "monospace",
                    color: "text.primary",
                  }}
                >
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReset}
              sx={{ mt: (theme?.tokens.spacing.lg ?? 24) / 8 }} // Convert 24px to 3
              data-testid="error-boundary-reset-button"
            >
              {t("common.errorBoundary.returnHome")}
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Wrapper component that provides the translation function and theme to the class component
export function ErrorBoundary({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <ErrorBoundaryClass t={t} theme={theme}>
      {children}
    </ErrorBoundaryClass>
  );
}
