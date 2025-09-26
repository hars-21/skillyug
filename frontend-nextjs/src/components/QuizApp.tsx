'use client';

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const QuizApp = () => {
  const [answers, setAnswers] = useState({
    q1: null as number | null,
    q2: null as number | null,
    q3: 50,
    q4: null as number | null,
    q5: null as number | null,
    q6: null as number | null,
    q7: [] as number[],
  });

  const handleRadioChange = (question: string, value: number) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers(prev => ({ ...prev, q3: parseInt(e.target.value) }));
  };

  const handleCheckboxChange = (index: number) => {
    setAnswers(prev => {
      const current = [...prev.q7];
      const position = current.indexOf(index);
      
      if (position === -1) {
        return { ...prev, q7: [...current, index] };
      } else {
        return { ...prev, q7: current.filter(i => i !== index) };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted answers:', answers);
    // Add your submission logic here (API call, validation, etc.)
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 font-display">
      <div className="flex flex-col min-h-screen">
        {/* Back Button */}
        <div className="p-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
        
        <main className="flex-1 py-10">
          <div className="max-w-2xl mx-auto px-4">
            <form onSubmit={handleSubmit}>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Welcome to the Quiz
                </h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                  Answer the following questions to test your knowledge.
                </p>
              </div>
              
              <div className="space-y-12">
                {/* Question 1 */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/20 p-6">
                  <h3 className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                    Question 1: Choose the correct shape
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-4">
                    {['Circle', 'Square', 'Triangle'].map((shape, index) => (
                      <label 
                        key={index}
                        className={`flex-1 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600 p-4 text-center ${answers.q1 === index ? 'border-primary bg-primary/10 ring-2 ring-primary' : ''}`}
                      >
                        {shape}
                        <input 
                          className="sr-only" 
                          name="shape-question" 
                          type="radio"
                          checked={answers.q1 === index}
                          onChange={() => handleRadioChange('q1', index)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Question 2 */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/20 p-6">
                  <h3 className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                    Question 2: Select the color
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-5 justify-center">
                    {[
                      { color: 'bg-red-500', label: 'Red' },
                      { color: 'bg-green-500', label: 'Green' },
                      { color: 'bg-blue-500', label: 'Blue' }
                    ].map((item, index) => (
                      <label 
                        key={index}
                        className={`relative h-12 w-12 cursor-pointer rounded-full border border-gray-300 dark:border-gray-600 ${item.color} ${answers.q2 === index ? 'ring-4 ring-primary ring-offset-2 ring-offset-background-light dark:ring-offset-background-dark' : ''}`}
                      >
                        <input 
                          className="sr-only" 
                          name="color-question" 
                          type="radio"
                          checked={answers.q2 === index}
                          onChange={() => handleRadioChange('q2', index)}
                        />
                        <span className="sr-only">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Question 3 */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/20 p-6">
                  <h3 className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                    Question 3: Rate your understanding
                  </h3>
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Understanding Level</p>
                      <p className="text-sm font-medium text-primary">{answers.q3}</p>
                    </div>
                    <input 
                      className="slider-thumb mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 dark:bg-gray-700" 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={answers.q3}
                      onChange={handleSliderChange}
                    />
                  </div>
                </div>
                
                {/* Question 4 */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/20 p-6">
                  <h3 className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                    Question 4: Choose the correct option
                  </h3>
                  <div className="mt-4 space-y-3">
                    {['Option A', 'Option B', 'Option C'].map((option, index) => (
                      <label 
                        key={index}
                        className={`flex cursor-pointer items-center gap-4 rounded-lg border border-gray-300 dark:border-gray-600 p-4 ${answers.q4 === index ? 'border-primary bg-primary/10 ring-2 ring-primary' : ''}`}
                      >
                        <input 
                          className="h-4 w-4 border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" 
                          name="option-question" 
                          type="radio"
                          checked={answers.q4 === index}
                          onChange={() => handleRadioChange('q4', index)}
                        />
                        <span className="text-sm font-medium">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Question 5 */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/20 p-6">
                  <h3 className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                    Question 5: Select the image that matches
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {[1, 2, 3].map((item, index) => (
                      <label key={index} className="group relative cursor-pointer">
                        <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200">
                          <div className="h-full w-full flex items-center justify-center text-gray-500">
                            Image {index + 1}
                          </div>
                        </div>
                        <input 
                          className="sr-only" 
                          name="image-question" 
                          type="radio"
                          checked={answers.q5 === index}
                          onChange={() => handleRadioChange('q5', index)}
                        />
                        <div className={`absolute inset-0 rounded-lg ring-4 ring-primary ring-offset-2 ring-offset-background-light dark:ring-offset-background-dark opacity-0 ${answers.q5 === index ? 'opacity-100' : ''}`}></div>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Question 6 */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/20 p-6">
                  <h3 className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                    Question 6: True or False
                  </h3>
                  <div className="mt-4 flex gap-4">
                    {['True', 'False'].map((option, index) => (
                      <label 
                        key={index}
                        className={`flex flex-1 cursor-pointer items-center justify-center gap-4 rounded-lg border border-gray-300 dark:border-gray-600 p-4 ${answers.q6 === index ? 'border-primary bg-primary/10 ring-2 ring-primary' : ''}`}
                      >
                        <input 
                          className="h-4 w-4 border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" 
                          name="tf-question" 
                          type="radio"
                          checked={answers.q6 === index}
                          onChange={() => handleRadioChange('q6', index)}
                        />
                        <span className="text-sm font-medium">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Question 7 */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/20 p-6">
                  <h3 className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                    Question 7: Select the correct answer
                  </h3>
                  <div className="mt-4 space-y-3">
                    {['Answer 1', 'Answer 2', 'Answer 3'].map((answer, index) => (
                      <label key={index} className="flex items-center gap-3">
                        <input 
                          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" 
                          type="checkbox"
                          checked={answers.q7.includes(index)}
                          onChange={() => handleCheckboxChange(index)}
                        />
                        <span className="text-sm font-medium">{answer}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-center pt-6">
                  <button 
                    type="submit"
                    className="w-full max-w-xs rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary/80"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
      
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 9999px;
          background-color: #137fec;
          cursor: pointer;
          margin-top: -6px;
        }
      `}</style>
    </div>
  );
};

export default QuizApp;
