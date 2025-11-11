'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  AlertTriangle,
  Crown,
  Users,
  HardDrive,
  Zap,
  Loader2
} from 'lucide-react'

function BillingDashboard({ currentUser, school }) {
  const [subscription, setSubscription] = useState(null)
  const [payments, setPayments] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentProvider, setPaymentProvider] = useState(null)
  const [stripe, setStripe] = useState(null)
  const [elements, setElements] = useState(null)

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      const [subscriptionRes, paymentsRes, plansRes] = await Promise.all([
        fetch('/api/school/subscription'),
        fetch('/api/payments'),
        fetch('/api/subscription-plans')
      ])

      if (subscriptionRes.ok) {
        const subData = await subscriptionRes.json()
        setSubscription(subData.subscription)
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPayments(paymentsData.payments)
      }

      if (plansRes.ok) {
        const plansData = await plansRes.json()
        setPlans(plansData.plans)
      }
    } catch (error) {
      console.error('Error loading billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (plan) => {
    setSelectedPlan(plan)
    setShowUpgradeDialog(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'expired':
        return 'text-red-600 bg-red-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'cancelled':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const formatCurrency = (amount, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount)
  }

  const getDaysUntilExpiry = () => {
    if (!subscription?.subscriptionEndDate) return 0
    const endDate = new Date(subscription.subscriptionEndDate)
    const today = new Date()
    const diffTime = endDate - today
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getUsagePercentage = (current, max) => {
    return Math.min((current / max) * 100, 100)
  }

  // Payment processing functions
  const processStripePayment = async () => {
    if (!selectedPlan) return

    setProcessingPayment(true)
    setPaymentProvider('stripe')

    try {
      toast.info('Redirecting to Stripe payment page...')

      // Create payment intent and get redirect URL
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: selectedPlan.price,
          currency: selectedPlan.currency,
          planId: selectedPlan.id,
          provider: 'stripe'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { authorizationUrl } = await response.json()

      // Redirect to Stripe checkout
      window.location.href = authorizationUrl

    } catch (error) {
      console.error('Stripe payment error:', error)
      toast.error(error.message || 'Payment initialization failed. Please try again.')
      setProcessingPayment(false)
      setPaymentProvider(null)
    }
  }

  const processPaystackPayment = async () => {
    if (!selectedPlan) return

    setProcessingPayment(true)
    setPaymentProvider('paystack')

    try {
      toast.info('Redirecting to Paystack payment page...')

      // Create payment intent
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: selectedPlan.price,
          currency: selectedPlan.currency,
          planId: selectedPlan.id,
          provider: 'paystack'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to initialize payment')
      }

      const { authorizationUrl } = await response.json()

      // Redirect to Paystack payment page
      window.location.href = authorizationUrl

    } catch (error) {
      console.error('Paystack payment error:', error)
      toast.error(error.message || 'Payment initialization failed. Please try again.')
      setProcessingPayment(false)
      setPaymentProvider(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show default data if no subscription exists
  const displaySubscription = subscription || {
    planName: 'Free Trial',
    subscriptionStatus: 'trial',
    subscriptionEndDate: null,
    planPrice: 0,
    currency: 'usd',
    maxUsers: 10,
    currentUsers: 0,
    maxStorage: 100,
    currentStorage: 0,
    totalFeatures: 5,
    featuresUsed: 0
  }

  const displayPlans = plans.length > 0 ? plans : [
    {
      id: '1',
      name: 'Basic',
      description: 'Perfect for small schools',
      price: 29.99,
      currency: 'usd',
      duration: 1,
      maxUsers: 50,
      maxStorage: 1000,
      features: ['Up to 50 users', '1GB storage', 'Basic features', 'Email support']
    },
    {
      id: '2',
      name: 'Professional',
      description: 'For growing schools',
      price: 79.99,
      currency: 'usd',
      duration: 1,
      maxUsers: 200,
      maxStorage: 5000,
      features: ['Up to 200 users', '5GB storage', 'All features', 'Priority support']
    },
    {
      id: '3',
      name: 'Enterprise',
      description: 'For large institutions',
      price: 199.99,
      currency: 'usd',
      duration: 1,
      maxUsers: 1000,
      maxStorage: 20000,
      features: ['Unlimited users', '20GB storage', 'All features', '24/7 support', 'Custom integrations']
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Billing & Subscription</h2>
        {subscription?.subscriptionStatus === 'expired' && (
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your subscription has expired. Renew now to continue using all features.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Subscription Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <Crown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displaySubscription.planName}
            </div>
            <Badge className={`mt-2 ${getStatusColor(displaySubscription.subscriptionStatus)}`}>
              {displaySubscription.subscriptionStatus}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displaySubscription.subscriptionEndDate
                ? new Date(displaySubscription.subscriptionEndDate).toLocaleDateString()
                : 'N/A'
              }
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {getDaysUntilExpiry() > 0
                ? `${getDaysUntilExpiry()} days remaining`
                : 'Expired'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displaySubscription.planPrice
                ? formatCurrency(displaySubscription.planPrice, displaySubscription.currency)
                : '$0.00'
              }
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {displaySubscription.subscriptionStatus === 'active' ? 'Active subscription' : 'No active subscription'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Stats */}
      <Card>
          <CardHeader>
            <CardTitle>Usage Overview</CardTitle>
            <CardDescription>Track your current usage against plan limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Users
                  </span>
                  <span>{displaySubscription.currentUsers}/{displaySubscription.maxUsers}</span>
                </div>
                <Progress value={getUsagePercentage(displaySubscription.currentUsers, displaySubscription.maxUsers)} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center">
                    <HardDrive className="h-4 w-4 mr-2" />
                    Storage
                  </span>
                  <span>{displaySubscription.currentStorage}MB/{displaySubscription.maxStorage}MB</span>
                </div>
                <Progress value={getUsagePercentage(displaySubscription.currentStorage, displaySubscription.maxStorage)} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Features
                  </span>
                  <span>{displaySubscription.featuresUsed}/{displaySubscription.totalFeatures}</span>
                </div>
                <Progress value={getUsagePercentage(displaySubscription.featuresUsed, displaySubscription.totalFeatures)} />
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPlans.map((plan) => (
              <Card key={plan.id} className={`relative ${
                subscription?.subscriptionPlanId === plan.id ? 'border-blue-500' : ''
              }`}>
                {subscription?.subscriptionPlanId === plan.id && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500">Current Plan</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {subscription?.subscriptionPlanId === plan.id && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-3xl font-bold">
                    {formatCurrency(plan.price, plan.currency)}
                    <span className="text-sm font-normal text-gray-600">/{plan.duration} month{plan.duration > 1 ? 's' : ''}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Max Users: {plan.maxUsers}</div>
                    <div>Storage: {plan.maxStorage}MB</div>
                  </div>
                  {subscription?.subscriptionPlanId !== plan.id && (
                    <Button
                      className="w-full mt-4"
                      onClick={() => handleUpgrade(plan)}
                    >
                      {subscription ? 'Upgrade' : 'Subscribe'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View all your payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{payment.planName}</TableCell>
                      <TableCell>
                        {formatCurrency(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getPaymentStatusIcon(payment.status)}
                          <span className="capitalize">{payment.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {payment.provider}
                      </TableCell>
                      <TableCell>
                        {payment.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {payments.length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No payment history yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Subscription</DialogTitle>
            <DialogDescription>
              Upgrade to {selectedPlan?.name} plan
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">{selectedPlan.name}</h3>
                <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                <div className="text-2xl font-bold mt-2">
                  {formatCurrency(selectedPlan.price, selectedPlan.currency)}
                  <span className="text-sm font-normal">/{selectedPlan.duration} month{selectedPlan.duration > 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  className="flex-1"
                  onClick={processStripePayment}
                  disabled={processingPayment}
                >
                  {processingPayment && paymentProvider === 'stripe' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Pay with Card (Stripe)'
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={processPaystackPayment}
                  disabled={processingPayment}
                >
                  {processingPayment && paymentProvider === 'paystack' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Pay with Paystack'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BillingDashboard
