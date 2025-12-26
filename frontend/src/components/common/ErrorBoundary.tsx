/**
 * Error boundary component to catch React rendering errors
 */

import { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useTranslation } from "react-i18next";
import { logger } from "../../utils/logger";

interface Props {
  children: ReactNode;
  t?: (key: string) => string;
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

      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            bgcolor: "background.default",
            padding: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 600,
              padding: 4,
              textAlign: "center",
              bgcolor: "background.paper",
            }}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: 60,
                color: "error.main",
                mb: 2,
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
                  mt: 3,
                  p: 2,
                  bgcolor: "action.hover",
                  borderRadius: 1,
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
              sx={{ mt: 3 }}
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

// Wrapper component that provides the translation function to the class component
export function ErrorBoundary({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return <ErrorBoundaryClass t={t}>{children}</ErrorBoundaryClass>;
}
