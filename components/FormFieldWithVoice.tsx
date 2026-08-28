'use client';

import { useState } from 'react';
import Input from './Common/Input';
import VoiceInputButton from './VoiceInputButton';
import FormField from './Common/FormField';

interface FormFieldWithVoiceProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  language?: string;
  fieldName?: string;
}

export default function FormFieldWithVoice({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  language = 'en-US',
  fieldName,
}: FormFieldWithVoiceProps) {
  const [voiceValue, setVoiceValue] = useState('');

  const handleVoiceTranscript = (transcript: string) => {
    setVoiceValue(transcript);
    // Append to existing value or replace
    const newValue = value ? `${value} ${transcript}` : transcript;
    onChange(newValue);
  };

  return (
    <FormField label={label}>
      <div className="flex gap-2 items-start">
        <Input
          type={type}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setVoiceValue('');
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="flex-1"
        />
        <VoiceInputButton
          onTranscript={handleVoiceTranscript}
          language={language}
          fieldName={fieldName || label}
        />
      </div>
    </FormField>
  );
}
