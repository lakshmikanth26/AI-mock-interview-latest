import React from 'react'

function UpgradePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Upgrade Your Plan</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Plan */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Current Plan: Free</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>5 interviews per month</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>Basic AI feedback</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>Standard question bank</span>
            </div>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Pro Plan</h2>
          <div className="text-2xl font-bold mb-4">$9.99/month</div>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-blue-200 mr-2">✓</span>
              <span>Unlimited interviews</span>
            </div>
            <div className="flex items-center">
              <span className="text-blue-200 mr-2">✓</span>
              <span>Advanced AI feedback</span>
            </div>
            <div className="flex items-center">
              <span className="text-blue-200 mr-2">✓</span>
              <span>Custom question sets</span>
            </div>
            <div className="flex items-center">
              <span className="text-blue-200 mr-2">✓</span>
              <span>Detailed analytics</span>
            </div>
            <div className="flex items-center">
              <span className="text-blue-200 mr-2">✓</span>
              <span>Priority support</span>
            </div>
          </div>
          
          <button className="w-full mt-6 bg-white text-blue-600 font-semibold py-3 rounded-lg hover:bg-blue-50 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
      
      <div className="mt-6">
        <a 
          href="/dashboard" 
          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Back to Dashboard
        </a>
      </div>
    </div>
  )
}

export default UpgradePage
