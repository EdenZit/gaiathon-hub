'use client';

import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { toast } from 'react-hot-toast';

// Common security questions
const SECURITY_QUESTIONS = [
  'What was the name of your first pet?',
  'In what city were you born?',
  'What is your mother\'s maiden name?',
  'What high school did you attend?',
  'What was the make of your first car?',
  'What is your favorite movie?',
  'What is the name of your favorite childhood teacher?',
  'What is your favorite book?',
  'What is the name of the street you grew up on?',
  'What was your childhood nickname?',
];

export function SecurityQuestionForm() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [isCustomQuestion, setIsCustomQuestion] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use custom question if selected
      const questionToSave = isCustomQuestion ? customQuestion : question;
      
      if (!questionToSave || !answer || !currentPassword) {
        toast.error('All fields are required');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/users/security-question', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionToSave,
          answer,
          currentPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update security question');
      }

      toast.success('Security question updated successfully');
      
      // Clear form
      setAnswer('');
      setCurrentPassword('');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred while updating security question');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Security Question</h2>
      <p className="text-gray-600 mb-6">
        Set up a security question to help recover your account if you forget your password.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Security Question
          </label>
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="customQuestion"
              checked={isCustomQuestion}
              onChange={(e) => setIsCustomQuestion(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="customQuestion" className="ml-2 block text-sm text-gray-700">
              Use custom question
            </label>
          </div>
          
          {isCustomQuestion ? (
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Enter your custom security question"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          ) : (
            <select
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a security question</option>
              {SECURITY_QUESTIONS.map((q, index) => (
                <option key={index} value={q}>
                  {q}
                </option>
              ))}
            </select>
          )}
        </div>
        
        <div>
          <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
            Answer
          </label>
          <input
            id="answer"
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Remember this answer exactly as you enter it. It is case-insensitive.
          </p>
        </div>
        
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Current Password <span className="text-gray-500">(for security question update)</span>
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              type={showPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              ) : (
                <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              )}
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            For security, please enter your current password to save changes.
          </p>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Security Question'}
          </button>
        </div>
      </form>
    </div>
  );
} 