import { useState } from 'react';
import Layout from '@/components/Layout';
import SpeechInput from '@/components/Common/SpeechInput';
import TextToSpeech from '@/components/Common/TextToSpeech';
import Button from '@/components/Common/Button';

export default function SpeechDemoPage() {
  const [results, setResults] = useState<Array<{ text: string; time: string }>>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [ttsText, setTtsText] = useState('Welcome to the Hajj Operations Management System. This is a test of the text-to-speech feature.');

  const handleTextReceived = (text: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults((prev) => [{ text, time: timestamp }, ...prev]);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🎤 Speech-to-Text Pilot</h1>
          <p className="text-gray-600 mt-1">Test the speech recognition feature before integrating it into forms</p>
        </div>

        {/* Main Demo Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Side */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Speak Now</h2>

            {/* Language Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
                <option value="it-IT">Italian</option>
                <option value="pt-BR">Portuguese (Brazil)</option>
                <option value="ja-JP">Japanese</option>
                <option value="zh-CN">Chinese (Simplified)</option>
              </select>
            </div>

            {/* Speech Input Component */}
            <SpeechInput
              language={selectedLanguage}
              placeholder="Click to start speaking..."
              onTextReceived={handleTextReceived}
            />
          </div>

          {/* Results Side */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Transcription History</h2>
              {results.length > 0 && (
                <Button size="sm" variant="secondary" onClick={clearResults}>
                  Clear
                </Button>
              )}
            </div>

            {results.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.map((result, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">{result.time}</p>
                    <p className="text-gray-900">{result.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No transcriptions yet. Start speaking to see results here!</p>
              </div>
            )}
          </div>
        </div>

        {/* Feature Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-semibold text-blue-900 mb-2">✓ How It Works</p>
            <p className="text-sm text-blue-700">Uses your browser's built-in Web Speech API to convert spoken words to text in real-time.</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-green-900 mb-2">🌍 Multi-Language</p>
            <p className="text-sm text-green-700">Supports 9+ languages. Select from the dropdown to switch languages instantly.</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="font-semibold text-purple-900 mb-2">🔒 Privacy</p>
            <p className="text-sm text-purple-700">No data sent to external servers. Processing happens entirely in your browser.</p>
          </div>
        </div>

        {/* Text-to-Speech Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🔊 Text-to-Speech (Read Aloud)</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Side */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Enter Text to Speak:
              </label>
              <textarea
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                placeholder="Type something here and click 'Speak' to hear it..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none h-32"
              />
            </div>

            {/* TTS Component */}
            <div>
              <TextToSpeech text={ttsText} />
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h2>
          <p className="text-gray-600 mb-4">After testing, we can integrate into:</p>
          <ul className="space-y-2 text-gray-700">
            <li>✓ <strong>Speech-to-Text:</strong> Pilgrim Registration (name, email, address, phone) | Manual Payment Submission (amount, reference, pilgrim ID)</li>
            <li>✓ <strong>Text-to-Speech:</strong> Confirmation messages | Form validation feedback | Payment receipt reading | Instructions narration</li>
            <li>✓ All text input fields across the system</li>
          </ul>
        </div>

        {/* Browser Support Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-700">
            <strong>Browser Support:</strong> Works best in Chrome, Microsoft Edge, and Safari. Firefox has limited support.
          </p>
        </div>
      </div>
    </Layout>
  );
}
