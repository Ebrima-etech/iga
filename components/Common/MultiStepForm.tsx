import React, { useState, useEffect } from 'react';
import Card from './Card';
import ProfessionalButton from './ProfessionalButton';
import FormField from './FormField';
import VoiceInputButton from '../VoiceInputButton';
import { BiChevronLeft, BiChevronRight, BiSave } from 'react-icons/bi';

interface Step {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldConfig[];
}

interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  validation?: (value: any) => string | null;
  voiceInput?: boolean;
}

interface MultiStepFormProps {
  steps: Step[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onSaveDraft?: (data: Record<string, any>, stepIndex: number) => Promise<void>;
  draftData?: Record<string, any>;
  title?: string;
  showProgressBar?: boolean;
  inline?: boolean;
  voiceEnabled?: boolean;
  language?: string;
}

export default function MultiStepForm({
  steps,
  onSubmit,
  onSaveDraft,
  draftData = {},
  title,
  showProgressBar = true,
  inline = false,
  voiceEnabled = true,
  language = 'en-US',
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>(draftData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  // Log formData changes to debug
  useEffect(() => {
    console.log('📊 formData state changed:', formData);
  }, [formData]);

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleInputChange = (name: string, value: any) => {
    console.log('📝 handleInputChange called with:', { name, value });
    console.log('📝 Current formData before update:', formData);
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      console.log('📝 formData updated to:', updated);
      return updated;
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    step.fields.forEach((field) => {
      const value = formData[field.name];

      // Check required
      if (field.required && (!value || value.toString().trim() === '')) {
        newErrors[field.name] = `${field.label} is required`;
        isValid = false;
      }

      // Custom validation
      if (value && field.validation) {
        const error = field.validation(value);
        if (error) {
          newErrors[field.name] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handlePrevious = async () => {
    if (onSaveDraft && !isFirstStep) {
      setSavingDraft(true);
      await onSaveDraft(formData, currentStep - 1);
      setSavingDraft(false);
    }
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (onSaveDraft && !isLastStep) {
      setSavingDraft(true);
      await onSaveDraft(formData, currentStep + 1);
      setSavingDraft(false);
    }

    setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({});
      setCurrentStep(0);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      setSavingDraft(true);
      await onSaveDraft(formData, currentStep);
      setSavingDraft(false);
    }
  };

  const content = (
    <form onSubmit={handleSubmit} className={inline ? '' : ''}>
      {/* Step Header */}
      {title && !inline && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {showProgressBar && !inline && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{step.title}</h3>
            <span className="text-sm text-gray-600">
              {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          {step.description && (
            <p className="text-sm text-gray-600 mt-2">{step.description}</p>
          )}
        </div>
      )}

      {/* Form Fields */}
      <div className={inline ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
        {step.fields.map((field) => (
          <FormField
            key={field.name}
            label={field.label}
            required={field.required}
            error={errors[field.name]}
          >
            {field.type === 'select' ? (
              <select
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition"
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <div className="space-y-2">
                <textarea
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition resize-none"
                />
                {voiceEnabled && (field.voiceInput !== false) && (
                  <VoiceInputButton
                    onTranscript={(text) => handleInputChange(field.name, text)}
                    language={language}
                    fieldName={field.label}
                  />
                )}
              </div>
            ) : (
              <div className="flex gap-2 items-start">
                <input
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition"
                />
                {voiceEnabled && (field.voiceInput !== false) && ['text', 'email', 'number'].includes(field.type) && (
                  <VoiceInputButton
                    onTranscript={(text) => handleInputChange(field.name, text)}
                    language={language}
                    fieldName={field.label}
                  />
                )}
              </div>
            )}
          </FormField>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
        <ProfessionalButton
          type="button"
          variant="secondary"
          size="md"
          onClick={handlePrevious}
          disabled={isFirstStep || loading || savingDraft}
          icon={<BiChevronLeft size={18} />}
        >
          Previous
        </ProfessionalButton>

        {onSaveDraft && (
          <ProfessionalButton
            type="button"
            variant="secondary"
            size="md"
            onClick={handleSaveDraft}
            loading={savingDraft}
            icon={<BiSave size={18} />}
          >
            Save Draft
          </ProfessionalButton>
        )}

        <div className="flex-1"></div>

        {isLastStep ? (
          <ProfessionalButton
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={loading}
          >
            Submit
          </ProfessionalButton>
        ) : (
          <ProfessionalButton
            type="button"
            variant="primary"
            size="md"
            onClick={handleNext}
            disabled={loading || savingDraft}
            icon={<BiChevronRight size={18} />}
          >
            Next
          </ProfessionalButton>
        )}
      </div>
    </form>
  );

  if (inline) {
    return <div className="bg-white rounded-xl border border-gray-100 p-8">{content}</div>;
  }

  return (
    <Card padding="lg" shadow="lg">
      {content}
    </Card>
  );
}
