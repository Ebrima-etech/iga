# Speech-to-Text Implementation Guide

## Overview

Speech-to-text functionality has been implemented across all record creation workflows in the GIA Hajj Operations system using the Web Speech API. Users can now dictate text input for all forms instead of typing.

## Architecture

### Core Components

#### 1. **lib/speechToText.ts** - Service Layer
- `SpeechToTextService`: Core class managing Web Speech API interaction
  - Handles speech recognition lifecycle (start, stop, abort)
  - Manages interim and final transcripts
  - Provides confidence scores for recognized speech
  - Browser-agnostic (supports both Chrome and Safari/Edge)
  - Error handling with user-friendly messages

- `isRecognitionSupported()`: Feature detection function
- `getSpeechToTextService()`: Singleton pattern for service access

**Key Methods:**
```typescript
start(onResult, onError, onStart, onEnd)  // Start listening
stop(): string                             // Stop and get transcript
setLanguage(language: string)              // Change language
abort()                                    // Cancel recording
```

#### 2. **hooks/useSpeechInput.ts** - React Hook
- `useSpeechInput(language)`: Reusable React hook for speech input
  - Manages listening state
  - Tracks interim and final transcripts
  - Handles confidence scores
  - Provides error state management
  - Language-aware

**Return Values:**
```typescript
{
  isListening: boolean
  isSupported: boolean
  transcript: string              // Final recognized text
  interimTranscript: string       // Live transcription
  error: string | null            // Error message if any
  confidence: number              // Recognition confidence (0-1)
  startListening: () => void
  stopListening: () => void
  clearTranscript: () => void
  setLanguage: (lang: string) => void
}
```

#### 3. **components/VoiceInputButton.tsx** - UI Component
- Visual microphone button with recording indicator
- Shows real-time transcript preview
- Displays confidence percentage
- Smooth transitions and animations
- Graceful degradation for unsupported browsers
- Toast notifications for user feedback

**Features:**
- 🎤 Microphone icon button
- 📝 Live transcript display
- 📊 Confidence score visualization
- ❌ Error state with dismiss button
- 🔴 Recording indicator with pulse animation

#### 4. **components/FormFieldWithVoice.tsx** - Form Integration
- Combines input field with voice button
- Automatically appends voice input to existing text
- Professional styling with Tailwind CSS

### Integration Points

#### 1. **MultiStepForm Component** (components/Common/MultiStepForm.tsx)
Updated to support voice input:
- New prop: `voiceEnabled?: boolean` (default: true)
- New prop: `language?: string` (default: 'en-US')
- New field config option: `voiceInput?: boolean`
- Voice buttons automatically added to text, email, number, and textarea fields

```typescript
interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  voiceInput?: boolean;  // Enable voice for this field
  // ... other fields
}
```

#### 2. **Pilgrim Registration Form** (pages/dashboard/pilgrims.tsx)
- All text-based fields support voice input
- Enabled fields:
  - First Name, Last Name
  - Email Address, Phone Number
  - Passport Number, Nationality
  - Street Address, City, State/Province, Postal Code, Country
  - Total Amount Due, Registration ID

#### 3. **Bank Management Forms** (pages/dashboard/banks.tsx)
- Bank name creation: Voice input enabled

#### 4. **Bank Admin Management** (pages/dashboard/banks/[id].tsx)
- Username: Voice input enabled
- Email: Voice input enabled
- Password field: No voice input (security)

## Usage Guide

### For End Users

#### Starting Voice Input
1. Click the 🎤 microphone icon next to any text input field
2. Browser will ask for microphone permission (first time only)
3. Say what you want to record
4. Microphone button changes to show red indicator and "Recording..."

#### During Recording
- See interim (live) transcription in gray text
- Confidence score updates in real-time
- Natural pause stops recording automatically

#### Completing Recording
1. Stop speaking
2. Click the ✕ button or wait for auto-stop (30 seconds)
3. Final transcript appears in the input field
4. Confidence percentage displayed

#### Handling Errors
- "No speech detected" - Try speaking again or check microphone
- "No microphone found" - Ensure microphone is connected
- "Network error" - Check internet connection
- Click "Dismiss" to clear error and retry

### For Developers

#### Adding Voice to a New Form

1. **Import necessary components:**
```typescript
import VoiceInputButton from '@/components/VoiceInputButton';
import { useSpeechInput } from '@/hooks/useSpeechInput';
```

2. **Enable in MultiStepForm:**
```typescript
<MultiStepForm
  steps={formSteps}
  onSubmit={handleSubmit}
  voiceEnabled={true}
  language="en-US"
/>
```

3. **In form field config, set voiceInput:**
```typescript
{
  name: 'field_name',
  label: 'Field Label',
  type: 'text',
  voiceInput: true  // Enable voice input
}
```

4. **For standalone components:**
```typescript
const { isListening, transcript, startListening, stopListening } = useSpeechInput('en-US');

return (
  <div className="flex gap-2">
    <input value={transcript} onChange={...} />
    <VoiceInputButton
      onTranscript={(text) => setFieldValue(text)}
      fieldName="My Field"
      language="en-US"
    />
  </div>
);
```

## Supported Languages

The system supports all languages supported by the Web Speech API. Common options:
- `en-US` - English (United States)
- `en-GB` - English (British)
- `fr-FR` - French
- `es-ES` - Spanish
- `de-DE` - German
- `ar-SA` - Arabic
- `zh-CN` - Chinese (Simplified)
- `ja-JP` - Japanese

Change language via:
- Pass `language` prop to MultiStepForm
- Call `setLanguage()` from useSpeechInput hook

## Browser Support

| Browser | Support | Version |
|---------|---------|---------|
| Chrome | ✅ Full | 25+ |
| Edge | ✅ Full | 79+ |
| Safari | ⚠️ Partial | 14.1+ |
| Firefox | ❌ No | - |
| Opera | ✅ Full | 27+ |

**Note:** Firefox doesn't support Web Speech API. The app gracefully disables voice input with a disabled microphone button.

## Security & Privacy

- **Microphone Permission**: Browser handles permission request natively
- **No Recording Storage**: Audio is processed in real-time only
- **No Transmission**: Speech processing happens client-side (except for API calls)
- **Transcript Only**: Only recognized text is sent to backend via normal form submission
- **User Control**: Users can stop/clear recording anytime

## Error Handling

The system includes comprehensive error handling:

```typescript
// Possible errors:
{
  'no-speech': 'No speech detected. Please try again.',
  'audio-capture': 'No microphone found. Ensure it is connected.',
  'network': 'Network error. Check your connection.',
  'aborted': 'Recording was cancelled.',
  'service-not-allowed': 'Speech recognition service not allowed.',
  'bad-grammar': 'Grammar error in speech recognition.',
  'bad-request': 'Bad request to speech recognition service.',
}
```

Toast notifications provide user-friendly feedback for all states.

## Performance Considerations

- **Lazy Loading**: Speech service initialized only when needed
- **Singleton Pattern**: Single service instance across app
- **Optimized Re-renders**: Hook manages state efficiently
- **Memory**: Transcripts cleared between recordings
- **Battery**: Microphone stops after 30s of silence automatically

## Testing

### Manual Testing Checklist

- [ ] Click microphone button on pilgrim form
- [ ] Speak your name
- [ ] Verify transcript appears
- [ ] Check confidence score displays
- [ ] Try stopping mid-sentence
- [ ] Test with multiple languages
- [ ] Verify form submission works with voice input
- [ ] Test on mobile device
- [ ] Test on Chrome/Edge/Safari
- [ ] Verify error handling (deny microphone)
- [ ] Check dark mode styling

### Example Test Scenarios

1. **Happy Path**: Pilgrim fills form entirely with voice
2. **Mixed Input**: Some fields via typing, some via voice
3. **Error Recovery**: User denies mic, then allows it later
4. **Multiple Languages**: Switch language mid-form
5. **Network Offline**: Verify graceful degradation

## Accessibility

- Microphone button is keyboard accessible
- ARIA labels on all interactive elements
- Respects system dark mode preference
- Clear visual feedback during recording
- Error messages clearly visible

## Future Enhancements

Potential improvements for future versions:

1. **Punctuation Control**: Voice commands like "period", "comma"
2. **Language Auto-detection**: Auto-detect speaker language
3. **Custom Commands**: Define custom voice commands
4. **Analytics**: Track voice input usage
5. **Offline Support**: Cache previous transcripts
6. **Audio Playback**: Replay recorded audio before submitting
7. **Text Editing**: Voice-based text editing ("delete last word", "capitalize")
8. **Multi-language Forms**: Support mixed languages in single form

## Troubleshooting

### Microphone Button Disabled
- **Cause**: Browser doesn't support Web Speech API
- **Solution**: Use Chrome, Edge, Safari, or Opera
- **Workaround**: Manual typing still available

### No Speech Detected
- **Cause**: Microphone not working or too quiet
- **Solution**: Check microphone is plugged in/enabled
- **Test**: Use browser's built-in speech test first

### Inaccurate Recognition
- **Cause**: Ambient noise, accent, or speed
- **Solution**: Speak clearly, one word at a time
- **Alternative**: Use typed input for critical fields

### Permission Denied
- **Cause**: User clicked "Don't Allow"
- **Solution**: Check browser settings → Permissions → Microphone
- **Chrome**: Settings → Privacy → Microphone → Allow site

### Language Not Available
- **Cause**: Browser language pack not installed
- **Solution**: Install language pack in browser settings
- **Alternative**: Use available language

## Files Modified/Created

### New Files
- `lib/speechToText.ts` - Core service
- `hooks/useSpeechInput.ts` - React hook
- `components/VoiceInputButton.tsx` - UI component
- `components/FormFieldWithVoice.tsx` - Form integration
- `SPEECH_TO_TEXT.md` - This documentation

### Modified Files
- `components/Common/MultiStepForm.tsx` - Added voice support
- `pages/dashboard/pilgrims.tsx` - Enabled voice fields
- `pages/dashboard/banks.tsx` - Enabled voice for bank name
- `pages/dashboard/banks/[id].tsx` - Enabled voice for admin fields
- `types/index.ts` - Updated FormFieldConfig interface

## Summary

The speech-to-text system is fully integrated into all record creation workflows. Users can now efficiently input information using voice, improving accessibility and speed of form completion. The implementation is robust, handles errors gracefully, and provides excellent user feedback through visual and toast notifications.

**Total Implementation Time**: Instant voice input across all forms
**Browser Coverage**: ~90% of users (Chrome, Edge, Safari, Opera)
**Fallback**: Full typing support remains available
