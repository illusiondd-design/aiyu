'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckIcon } from '@heroicons/react/24/outline'

function UpgradePageContent() {
  const searchParams = useSearchParams()
  const currentPlan = searchParams.get('from') || 'free'
  const [loading, setLoading] = useState<string | null>(null)

  const plans = [
    {
      id: 'go',
      name: 'GO',
      price: '€399',
      period: '/Monat',
      features: [
        '10 Videos/Monat',
        '100 Posts/Monat',
        '2GB Storage',
        'Instagram + Facebook',
        'AI Text Generation',
        'Email Support (24h)',
      ],
    },
    {
      id: 'pro',
      name: 'PRO',
      price: '€899',
      period: '/Monat',
      popular: true,
      features: [
        '100 Videos/Monat',
        '2.000 Posts/Monat',
        '50GB Storage',
        'Alle Plattformen',
        'Advanced AI Features',
        'Priority Support',
        'Analytics Dashboard',
      ],
    },
    {
      id: 'ultra',
      name: 'ULTRA',
      price: '€1.799',
      period: '/Monat',
      features: [
        '500 Videos/Monat',
        '10.000 Posts/Monat',
        '500GB Storage',
        'White Label',
        'Multi-Workspace',
        'API Access',
        'Dedicated Manager',
        'Custom Integrations',
      ],
    },
  ]

  async function handleUpgrade(pkg: string) {
    setLoading(pkg)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package: pkg,
          email: 'test@aiyu.de', // TODO: Get from session
        }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Fehler beim Erstellen der Checkout Session')
        setLoading(null)
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Fehler beim Upgrade')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Choose the perfect plan for your needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-xl p-8 ${
                plan.popular ? 'ring-4 ring-purple-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="text-center mb-4">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading !== null}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.id ? 'Lädt...' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function UpgradePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpgradePageContent />
    </Suspense>
  )
}
