# GIA Dashboard Chat Feature

## Overview
A polling-based global chat system that allows all dashboard users to communicate in real-time. Messages are fetched every 5 seconds and displayed in a live chat panel on the professional dashboard.

## Features

### Frontend
- **Real-time polling**: Fetches new messages every 5 seconds
- **Auto-scroll**: Automatically scrolls to the latest message
- **Clean UI**: Messages displayed with username, timestamp, and content
- **Message input**: Simple text input with send button
- **Refresh button**: Manual refresh option for immediate updates
- **Responsive**: Works on desktop and mobile views
- **Loading states**: Shows loading/refreshing states to the user

### Backend
- **REST API**: Endpoints for creating and retrieving messages
- **User tracking**: Automatically associates messages with authenticated users
- **Pagination**: Supports `limit` parameter for fetching specific number of messages
- **Admin interface**: Full admin panel for managing messages
- **Indexes**: Database indexes for fast query performance

## Architecture

### API Endpoints

```
GET  /chat-broadcasts/                    - List all messages (with pagination)
POST /chat-broadcasts/                    - Create new message
GET  /chat-broadcasts/recent/?limit=50    - Get 50 most recent messages
DELETE /chat-broadcasts/{id}/             - Delete a message (owner only)
```

### Models

**ChatBroadcast**
- `id`: Primary key
- `user`: ForeignKey to User (message sender)
- `message`: TextField (the actual message content)
- `created_at`: Auto-set timestamp
- `updated_at`: Auto-update timestamp

### Frontend Component

**ChatSection.tsx** (`components/Dashboard/ChatSection.tsx`)
- Height: 400px (fixed in professional dashboard)
- Polling interval: 5 seconds
- Auto-scroll: Enabled
- Message format: `[username] [time] message`

## Implementation Details

### Database Migration
Run this command to apply the database changes:
```bash
cd ../igaa
python manage.py migrate
```

This creates the `dashboard_chatbroadcast` table with proper indexes.

### Message Flow

1. **Frontend**: User types message and clicks send
2. **Frontend**: POST request to `/chat-broadcasts/` with message text
3. **Backend**: View sets `user=current_user` and saves to database
4. **Backend**: Returns serialized message with all fields
5. **Frontend**: Clears input and polls for new messages
6. **Polling**: Every 5 seconds, GET `/chat-broadcasts/recent/?limit=50`
7. **Display**: New messages appear in the chat panel
8. **Auto-scroll**: View automatically scrolls to latest message

### User Experience

```
┌─────────────────────────────┐
│ Chat        [⟳ Refresh]     │
├─────────────────────────────┤
│ Alagie         2:30 PM      │
│ Hello everyone!             │
│                             │
│ Mariama        2:32 PM      │
│ Hi Alagie!                  │
│                             │
│ Ebrima         2:35 PM      │
│ What's new?                 │
│                             │
├─────────────────────────────┤
│ [Type message...] [Send ➤]  │
└─────────────────────────────┘
```

## Files Modified/Created

### Frontend
- `components/Dashboard/ChatSection.tsx` - New chat component
- `pages/dashboard/professional.tsx` - Added ChatSection import and display

### Backend
- `dashboard/models.py` - Added ChatBroadcast model
- `dashboard/serializers.py` - Added ChatBroadcastSerializer
- `dashboard/views.py` - Added ChatBroadcastViewSet
- `dashboard/admin.py` - Added ChatBroadcastAdmin
- `dashboard/urls.py` - Registered chat-broadcasts route
- `dashboard/migrations/0006_chatbroadcast.py` - Database migration

## Configuration

### Polling Interval
To change polling interval (currently 5000ms = 5 seconds):
```typescript
// In ChatSection.tsx, line ~45
const interval = setInterval(fetchMessages, 5000); // Change this value
```

### Chat Panel Height
To change panel height (currently 400px):
```typescript
// In professional.tsx, line ~617
<div style={{ height: '400px' }}> {/* Change to desired height */}
```

### Message Limit
To fetch different number of messages (currently 50):
```typescript
// In ChatSection.tsx, line ~35
const response = await api.get('/chat-broadcasts/recent/?limit=50'); // Change 50
```

## Security Considerations

1. **Authentication**: Only authenticated users can send/view messages
2. **User tracking**: Messages automatically attributed to logged-in user
3. **Admin deletion**: Only admins can delete messages (Django admin)
4. **Input validation**: Message field is required and validated by DRF

## Performance

### Optimization Tips

1. **Increase polling interval**: If server load is high, increase interval (e.g., 10 seconds)
2. **Reduce message limit**: Lower the limit if bandwidth is constrained
3. **Add pagination**: Implement cursor-based pagination for very long conversations
4. **Message archiving**: Consider archiving old messages to keep database size manageable

### Indexes
The migration creates an index on `created_at` for fast message retrieval:
```sql
CREATE INDEX dashboard_c_created_idx_chat ON dashboard_chatbroadcast (created_at DESC);
```

## Testing

### Manual Testing
1. Open dashboard in 2 browser windows
2. Send message from one window
3. Within 5 seconds, message should appear in other window
4. Test refresh button for immediate updates
5. Test send button with empty message (should be disabled)
6. Test timestamps and username display

### API Testing
```bash
# Get recent messages
curl http://localhost:8000/chat-broadcasts/recent/?limit=10

# Send message (requires auth token)
curl -X POST http://localhost:8000/chat-broadcasts/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello world"}'
```

## Future Enhancements

1. **Realtime WebSockets**: Replace polling with WebSocket for true real-time messaging
2. **Message reactions**: Add emoji reactions to messages
3. **Thread support**: Group related messages into threads
4. **File uploads**: Allow users to share files/images
5. **Message search**: Search functionality for finding old messages
6. **Typing indicators**: Show when someone is typing
7. **User presence**: Show who's currently online
8. **Message editing**: Allow editing sent messages
9. **Mentions**: @mention users for notifications
10. **Channel separation**: Separate chats by department/team

## Troubleshooting

### Messages not updating
- Check if polling interval is set correctly (should be 5000ms)
- Verify API endpoint is `/chat-broadcasts/recent/?limit=50`
- Check browser console for errors
- Ensure user is authenticated

### Server connection timeout
- Database might not be running
- Check PostgreSQL connection in .env
- Verify Django server is running

### Migration errors
- Ensure all previous migrations are applied
- Check database permissions
- Verify Django app is in INSTALLED_APPS

## Deployment Checklist

- [ ] Run database migrations: `python manage.py migrate`
- [ ] Test in development environment
- [ ] Clear browser cache
- [ ] Verify authentication works
- [ ] Test on staging environment
- [ ] Monitor API performance
- [ ] Set up message cleanup/archiving (optional)
- [ ] Document for team
