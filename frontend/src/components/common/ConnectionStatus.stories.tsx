import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ConnectionStatus } from './ConnectionStatus';

// Mock the useConnectionStatus hook for Storybook
const mockConnectionStatus = {
  status: 'connected' as const,
  retryCount: 0,
  manualRetry: fn(),
};

// Create a wrapper component that accepts props for the mock
const ConnectionStatusWrapper = ({
  status = 'connected',
  retryCount = 0,
}: {
  status?: 'connected' | 'reconnecting' | 'disconnected';
  retryCount?: number;
}) => {
  // Mock the hook at component level
  const originalHook = require('../../hooks/useConnectionStatus').useConnectionStatus;

  // Override for this specific story
  require('../../hooks/useConnectionStatus').useConnectionStatus = () => ({
    status,
    retryCount,
    manualRetry: fn(),
  });

  const component = <ConnectionStatus />;

  // Restore original hook
  require('../../hooks/useConnectionStatus').useConnectionStatus = originalHook;

  return component;
};

const meta: Meta<typeof ConnectionStatusWrapper> = {
  title: 'Common/ConnectionStatus',
  component: ConnectionStatusWrapper,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Displays the backend connection status in the top-right corner. ' +
          'Shows green when connected, yellow when reconnecting, and red when disconnected. ' +
          'Includes a retry button when disconnected.',
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['connected', 'reconnecting', 'disconnected'],
      description: 'Current connection status',
    },
    retryCount: {
      control: { type: 'number', min: 0, max: 10 },
      description: 'Number of retry attempts (shown when reconnecting)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConnectionStatusWrapper>;

/**
 * Connected state - green chip indicator.
 * Shows when the backend is healthy and responding.
 */
export const Connected: Story = {
  args: {
    status: 'connected',
    retryCount: 0,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The default healthy state. Shows a green chip with a checkmark emoji ' +
          'and "Connected" label. No retry button is shown.',
      },
    },
  },
};

/**
 * Reconnecting state - yellow chip with retry count.
 * Shows when the app is attempting to reconnect to the backend.
 */
export const Reconnecting: Story = {
  args: {
    status: 'reconnecting',
    retryCount: 3,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shown during automatic reconnection attempts. The chip is yellow and displays ' +
          'the retry count. This appears when the backend becomes temporarily unavailable.',
      },
    },
  },
};

/**
 * Disconnected state - red chip with manual retry button.
 * Shows when the backend connection is lost and automatic retries have failed.
 */
export const Disconnected: Story = {
  args: {
    status: 'disconnected',
    retryCount: 0,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shown when the connection is lost and automatic reconnection has failed. ' +
          'The chip is red and includes a manual retry button (refresh icon) that users ' +
          'can click to attempt reconnection.',
      },
    },
  },
};

/**
 * Reconnecting without count - shows just the status.
 * Initial reconnection attempt before retry counter starts.
 */
export const ReconnectingInitial: Story = {
  args: {
    status: 'reconnecting',
    retryCount: 0,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The first reconnection attempt, before the retry counter increments. ' +
          'Shows "Reconnecting..." without a count.',
      },
    },
  },
};
