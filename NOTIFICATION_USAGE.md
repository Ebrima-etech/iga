# Notification System Guide

## Overview

The GIA Dashboard now includes a comprehensive notification system that allows users to be notified about important events and updates.

## Setup

### 1. Wrap Your App with NotificationProvider

In `pages/_app.tsx`, wrap your app with the `NotificationProvider`:

```tsx
import { NotificationProvider } from '@/lib/notificationContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NotificationProvider>
      <Component {...pageProps} />
    </NotificationProvider>
  );
}
```

### 2. Add NotificationCenter to Header

In your Header or Navigation component, add the `NotificationCenter`:

```tsx
import NotificationCenter from '@/components/Common/NotificationCenter';

export default function Header() {
  return (
    <div className="flex items-center gap-4">
      {/* Other header content */}
      <NotificationCenter />
    </div>
  );
}
```

## Usage

### Basic Example

Use the `useNotification` hook in any component:

```tsx
import { useNotification } from '@/lib/notificationContext';

export default function MyComponent() {
  const { addNotification } = useNotification();

  const handleSuccess = () => {
    addNotification({
      type: 'success',
      title: 'Success!',
      message: 'Your payment has been recorded successfully.',
    });
  };

  return <button onClick={handleSuccess}>Record Payment</button>;
}
```

### Notification Types

#### Success
```tsx
addNotification({
  type: 'success',
  title: 'Success',
  message: 'Operation completed successfully',
});
```

#### Error
```tsx
addNotification({
  type: 'error',
  title: 'Error',
  message: 'Something went wrong. Please try again.',
});
```

#### Warning
```tsx
addNotification({
  type: 'warning',
  title: 'Warning',
  message: 'This action cannot be undone.',
});
```

#### Info
```tsx
addNotification({
  type: 'info',
  title: 'Information',
  message: 'New update available',
});
```

### With Action Button

Add an optional action button to notifications:

```tsx
addNotification({
  type: 'info',
  title: 'New Receipt',
  message: 'A new receipt has been generated',
  action: {
    label: 'View Receipt',
    onClick: () => {
      // Handle action
      router.push('/receipts/123');
    },
  },
});
```

## Common Use Cases

### Payment Recorded
```tsx
const { addNotification } = useNotification();

const handleRecordPayment = async () => {
  try {
    await api.post('/payments/', paymentData);
    addNotification({
      type: 'success',
      title: 'Payment Recorded',
      message: `Payment of ${amount} has been recorded for ${pilgrimName}`,
    });
  } catch (error) {
    addNotification({
      type: 'error',
      title: 'Recording Failed',
      message: error.message,
    });
  }
};
```

### Receipt Generated
```tsx
addNotification({
  type: 'success',
  title: 'Receipt Generated',
  message: 'Payment receipt has been generated and opened',
  action: {
    label: 'Download',
    onClick: downloadReceipt,
  },
});
```

### Data Sync Status
```tsx
addNotification({
  type: 'info',
  title: 'Syncing Data',
  message: 'Synchronizing payment data with server...',
});
```

### Validation Error
```tsx
addNotification({
  type: 'warning',
  title: 'Validation Required',
  message: 'Please fill in all required fields',
});
```

## API Reference

### useNotification Hook

```tsx
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification(notification): void;
  removeNotification(id: string): void;
  markAsRead(id: string): void;
  markAllAsRead(): void;
  clearAllNotifications(): void;
}
```

### Notification Object

```tsx
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

## Features

- ✅ Bell icon with unread count badge
- ✅ Dropdown notification center
- ✅ Mark notifications as read
- ✅ Mark all as read
- ✅ Dismiss individual notifications
- ✅ Relative timestamps (e.g., "2m ago")
- ✅ Color-coded notification types
- ✅ Optional action buttons
- ✅ Auto-close on outside click
- ✅ Scrollable notification list

## Styling

Notifications are styled with Tailwind CSS and use color-coded borders:

- **Success**: Emerald border and background
- **Error**: Red border and background
- **Warning**: Amber border and background
- **Info**: Blue border and background

## Best Practices

1. **Be Concise**: Keep titles and messages short
2. **Be Specific**: Tell users exactly what happened
3. **Provide Actions**: When relevant, add action buttons for next steps
4. **Use Appropriate Types**: Match the notification type to the event
5. **Don't Spam**: Avoid creating too many notifications in quick succession

## Example: Complete Payment Flow

```tsx
const handleRecordPayment = async () => {
  try {
    // Start operation
    addNotification({
      type: 'info',
      title: 'Processing',
      message: 'Recording payment...',
    });

    // Call API
    const result = await api.post('/payments/', paymentData);

    // Success
    addNotification({
      type: 'success',
      title: 'Payment Recorded',
      message: `Payment of D${result.amount} recorded successfully`,
      action: {
        label: 'View Receipt',
        onClick: () => viewReceipt(result.id),
      },
    });

  } catch (error) {
    // Error
    addNotification({
      type: 'error',
      title: 'Recording Failed',
      message: error.response?.data?.detail || 'Failed to record payment',
    });
  }
};
```
