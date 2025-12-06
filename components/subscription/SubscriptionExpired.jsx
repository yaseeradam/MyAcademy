'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ShieldAlert, Sparkles, Zap, GraduationCap, CreditCard, BarChart3, Users, HardDrive } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import PaystackPop from '@paystack/inline-js'

export default function SubscriptionExpired({ school, user }) {
  const [plans, setPlans] = useState([])
  const [selectedInterval, setSelectedInterval] = useState('termly') // Default to Termly (3 months)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetch('/api/subscription-plans')
      .then(res => res.json())
      .then(data => setPlans(data.plans))
  }, [])

  const selectedPlan = plans.find(p => p.interval === selectedInterval)

  const handleRenew = async () => {
    if (!selectedPlan) return
    setProcessing(true)
    try {
      // 1. Initialize on Backend
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ planId: selectedPlan.id, interval: selectedPlan.interval, provider: 'paystack' })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payment initialization failed')

      // 2. Open Paystack Popup
      const paystack = new PaystackPop()
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY, // Ensure this env var exists
        email: user.email,
        amount: data.amount, // Ensure backend returns amount if needed, or rely on access_code
        ref: data.reference,
        onSuccess: async (transaction) => {
            // 3. Verify on Backend immediately after success
            setProcessing(true) // Keep loading
            try {
                const verifyRes = await fetch(`/api/payments/verify?reference=${transaction.reference}`)
                const verifyData = await verifyRes.json()
                
                if (verifyData.success) {
                    toast.success('Subscription renewed successfully!')
                    window.location.reload() // Reload to unlock
                } else {
                    toast.error('Payment verification failed. Please contact support.')
                    setProcessing(false)
                }
            } catch (err) {
                console.error(err)
                toast.error('Error verifying payment')
                setProcessing(false)
            }
        },
        onCancel: () => {
            setProcessing(false)
            toast.info('Payment cancelled')
        }
      })

    } catch (error) {
      toast.error(error.message)
      setProcessing(false)
    }
  }

  // Value Proposition Features (More promising copy)
  const features = [
    { icon: GraduationCap, text: "Automated Result Compilation & Report Cards" },
    { icon: CreditCard, text: "Digital Fee Management & Online Collections" },
    { icon: Users, text: "Parent, Teacher & Student Portals" },
    { icon: BarChart3, text: "Advanced Performance Analytics & Insights" },
    { icon: Zap, text: "Real-time Attendance & Behavior Tracking" },
    { icon: HardDrive, text: "Unlimited Cloud Storage & Backup" }
  ]

  const intervals = [
    { id: 'monthly', label: 'Monthly', price: '₦15,000', save: null },
    { id: 'termly', label: 'Termly (3 Mo)', price: '₦40,000', save: 'Save 11%' },
    { id: 'yearly', label: 'Yearly', price: '₦150,000', save: 'Save 17%' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Left Side: Value Prop */}
            <div className="p-8 md:p-10 bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="h-10 w-10 bg-red-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <ShieldAlert className="h-6 w-6 text-red-400" />
                        </div>
                        <span className="font-semibold text-red-200 tracking-wide uppercase text-xs">Subscription Expired</span>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                        Restore Access to Your <span className="text-blue-400">Digital School.</span>
                    </h1>
                    <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                        Don't let admin tasks slow you down. Renew your subscription to keep your school running smoothly with our premium tools.
                    </p>

                    <div className="space-y-4">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-start space-x-3">
                                <f.icon className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                                <span className="text-slate-200 font-medium">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 relative z-10">
                    <p className="text-xs text-slate-500">Trusted by over 500+ schools in Nigeria</p>
                </div>
            </div>

            {/* Right Side: Pricing & Action */}
            <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
                    <p className="text-gray-500">Flexible options to suit your budget.</p>
                </div>

                {/* Interval Toggle */}
                <div className="bg-gray-100 p-1 rounded-xl flex justify-between mb-8">
                    {intervals.map((int) => (
                        <button
                            key={int.id}
                            onClick={() => setSelectedInterval(int.id)}
                            className={cn(
                                "flex-1 py-2 px-2 rounded-lg text-sm font-semibold transition-all duration-200 relative",
                                selectedInterval === int.id 
                                ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" 
                                : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            {int.label}
                            {int.save && (
                                <span className="absolute -top-3 right-0 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm hidden md:block">
                                    {int.save}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Selected Plan Details */}
                <div key={selectedInterval} className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                   <div className="flex items-center justify-center items-baseline space-x-2">
                        <span className="text-5xl font-extrabold text-blue-600 tracking-tight">
                            {intervals.find(i => i.id === selectedInterval)?.price}
                        </span>
                        <span className="text-gray-500 font-medium">
                            /{selectedInterval === 'monthly' ? 'mo' : selectedInterval === 'termly' ? '3mo' : 'yr'}
                        </span>
                   </div>
                   {selectedInterval === 'yearly' && (
                       <p className="text-green-600 font-medium mt-2 bg-green-50 inline-block px-3 py-1 rounded-full text-sm animate-in zoom-in duration-300">
                           Best Value! You save ₦30,000
                       </p>
                   )}
                   {selectedInterval === 'termly' && (
                       <p className="text-blue-600 font-medium mt-2 bg-blue-50 inline-block px-3 py-1 rounded-full text-sm animate-in zoom-in duration-300">
                           Most Popular Choice
                       </p>
                   )}
                </div>

                <Button 
                    size="lg"
                    className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 hover:shadow-2xl transition-all transform hover:-translate-y-1"
                    onClick={handleRenew}
                    disabled={processing || !selectedPlan}
                >
                    {processing ? (
                        <>Processing Payment...</>
                    ) : (
                        `Pay ${intervals.find(i => i.id === selectedInterval)?.price} Securely`
                    )}
                </Button>
                
                <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-2">
                    <ShieldAlert className="h-3 w-3" />
                    Secured by Paystack. Cancel anytime.
                </p>
            </div>
        </div>
      </div>
    </div>
  )
}
