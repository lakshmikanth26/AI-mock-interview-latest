import React from 'react'

function HowItWorksPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">How It Works</h1>
      
      <div className="max-w-4xl">
        <p className="text-gray-600 mb-8 text-lg">
          AI Mock Interview helps you practice job interviews with AI-powered feedback to improve your performance.
        </p>

        <div className="space-y-8">
          {/* Step 1 */}
          <div className="flex items-start space-x-4">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Create Your Interview</h3>
              <p className="text-gray-600">
                Enter your job position, description, and years of experience. Our AI will generate 
                relevant interview questions tailored to your profile.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-4">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Practice Your Answers</h3>
              <p className="text-gray-600">
                Answer each question by typing your response or using voice recording. 
                Take your time to provide thoughtful, detailed answers.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-4">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Get AI Feedback</h3>
              <p className="text-gray-600">
                Receive detailed feedback on your answers, including ratings and suggestions 
                for improvement. Learn what works and what to focus on.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-4">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Improve & Repeat</h3>
              <p className="text-gray-600">
                Use the feedback to refine your answers and practice regularly. 
                Track your progress over multiple interview sessions.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-green-800 mb-2">Key Features</h3>
          <ul className="grid md:grid-cols-2 gap-2 text-green-700">
            <li>• AI-powered question generation</li>
            <li>• Voice and text recording</li>
            <li>• Detailed feedback and ratings</li>
            <li>• Progress tracking</li>
            <li>• Industry-specific questions</li>
            <li>• Practice anytime, anywhere</li>
          </ul>
        </div>

        <div className="mt-8 flex space-x-4">
          <a 
            href="/dashboard" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Practicing Now
          </a>
          <a 
            href="/dashboard" 
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}

export default HowItWorksPage
