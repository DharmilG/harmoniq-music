import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function PaymentModal({ items, total, onClose, onSuccess }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingName: ''
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [errors, setErrors] = useState({})  

  // Load user data and Paytm config on mount
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }))
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required'
    if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required'
    if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required'
    if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required'
    if (!formData.billingName.trim()) newErrors.billingName = 'Billing name is required'

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Card number validation (basic)
    const cardRegex = /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/
    if (formData.cardNumber && !cardRegex.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Please enter a valid card number'
    }

    // CVV validation
    const cvvRegex = /^\d{3,4}$/
    if (formData.cvv && !cvvRegex.test(formData.cvv)) {
      newErrors.cvv = 'Please enter a valid CVV'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsProcessing(true)
    
    try {
      await simulatePayment()
    } catch (error) {
      console.error('Payment error:', error)
      setIsProcessing(false)
      alert('Payment failed. Please try again.')
    }
  }

  const simulatePayment = async () => {
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setIsCompleted(true)
      
      // Call success callback after a delay
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)
    }, 3000)
  }

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  if (isCompleted) {
    return (
      <div className="card" style={{
        textAlign: 'center',
        maxWidth: '500px',
        margin: '0 auto',
        background: 'var(--gradient-glass)',
        border: '1px solid rgba(34, 197, 94, 0.3)'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: 'var(--space-lg)',
          color: 'var(--success)'
        }}>
          ✓
        </div>
        <h3>Payment Successful!</h3>
        <p className="small" style={{ marginBottom: 'var(--space-lg)' }}>
          Thank you for your purchase. Your order has been processed and you will receive a confirmation email shortly.
        </p>
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          padding: 'var(--space-md)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-lg)'
        }}>
          <p className="small" style={{ margin: 0 }}>
            <strong>Order Total:</strong> ${total.toFixed(2)}<br/>
            <strong>Order ID:</strong> #{Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{
      maxWidth: '800px',
      margin: '0 auto',
      background: 'var(--gradient-glass)',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-lg)'
      }}>
        <h3>Complete Your Purchase</h3>
        <button 
          className="btn"
          onClick={onClose}
          style={{ padding: 'var(--space-xs)' }}
        >
          ×
        </button>
      </div>

      {/* Order Summary */}
      <div style={{
        background: 'rgba(139, 92, 246, 0.1)',
        padding: 'var(--space-md)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--space-lg)'
      }}>
        <h4 style={{ margin: '0 0 var(--space-sm) 0' }}>Order Summary</h4>
        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
          {items.map(item => (
            <div key={item.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: 'var(--space-xs) 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span className="small">{item.name} × {item.qty}</span>
              <span className="small">${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 'bold',
          marginTop: 'var(--space-sm)',
          paddingTop: 'var(--space-sm)',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-lg)'
        }}>
          {/* Personal Information */}
          <div>
            <h4 style={{ margin: '0 0 var(--space-md) 0', color: 'var(--accent-primary)' }}>Personal Information</h4>
            
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label htmlFor="name" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="btn"
                style={{
                  width: '100%',
                  background: 'var(--surface-elevated)',
                  border: errors.name ? '1px solid var(--error)' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-sm) var(--space-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
              {errors.name && <span className="small" style={{ color: 'var(--error)' }}>{errors.name}</span>}
            </div>

            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label htmlFor="email" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="btn"
                style={{
                  width: '100%',
                  background: 'var(--surface-elevated)',
                  border: errors.email ? '1px solid var(--error)' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-sm) var(--space-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
              {errors.email && <span className="small" style={{ color: 'var(--error)' }}>{errors.email}</span>}
            </div>

            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label htmlFor="phone" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="btn"
                style={{
                  width: '100%',
                  background: 'var(--surface-elevated)',
                  border: errors.phone ? '1px solid var(--error)' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-sm) var(--space-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
              {errors.phone && <span className="small" style={{ color: 'var(--error)' }}>{errors.phone}</span>}
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <h4 style={{ margin: '0 0 var(--space-md) 0', color: 'var(--accent-primary)' }}>Billing Address</h4>
            
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label htmlFor="address" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                Street Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="btn"
                style={{
                  width: '100%',
                  background: 'var(--surface-elevated)',
                  border: errors.address ? '1px solid var(--error)' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-sm) var(--space-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
              {errors.address && <span className="small" style={{ color: 'var(--error)' }}>{errors.address}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <div>
                <label htmlFor="city" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="btn"
                  style={{
                    width: '100%',
                    background: 'var(--surface-elevated)',
                    border: errors.city ? '1px solid var(--error)' : '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-sm) var(--space-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
                {errors.city && <span className="small" style={{ color: 'var(--error)' }}>{errors.city}</span>}
              </div>

              <div>
                <label htmlFor="state" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                  State *
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="btn"
                  style={{
                    width: '100%',
                    background: 'var(--surface-elevated)',
                    border: errors.state ? '1px solid var(--error)' : '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-sm) var(--space-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
                {errors.state && <span className="small" style={{ color: 'var(--error)' }}>{errors.state}</span>}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label htmlFor="zipCode" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                ZIP Code *
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="btn"
                style={{
                  width: '100%',
                  background: 'var(--surface-elevated)',
                  border: errors.zipCode ? '1px solid var(--error)' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-sm) var(--space-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
              {errors.zipCode && <span className="small" style={{ color: 'var(--error)' }}>{errors.zipCode}</span>}
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h4 style={{ margin: '0 0 var(--space-md) 0', color: 'var(--accent-primary)' }}>Payment Information (Test Mode)</h4>
          
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label htmlFor="billingName" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
              Name on Card *
            </label>
            <input
              type="text"
              id="billingName"
              name="billingName"
              value={formData.billingName}
              onChange={handleInputChange}
              className="btn"
              style={{
                width: '100%',
                background: 'var(--surface-elevated)',
                border: errors.billingName ? '1px solid var(--error)' : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-sm) var(--space-md)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            />
            {errors.billingName && <span className="small" style={{ color: 'var(--error)' }}>{errors.billingName}</span>}
          </div>

          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label htmlFor="cardNumber" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
              Card Number *
            </label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={(e) => {
                const formatted = formatCardNumber(e.target.value)
                setFormData(prev => ({ ...prev, cardNumber: formatted }))
              }}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              className="btn"
              style={{
                width: '100%',
                background: 'var(--surface-elevated)',
                border: errors.cardNumber ? '1px solid var(--error)' : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-sm) var(--space-md)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            />
            {errors.cardNumber && <span className="small" style={{ color: 'var(--error)' }}>{errors.cardNumber}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
            <div>
              <label htmlFor="expiryDate" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                Expiry Date *
              </label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={(e) => {
                  const formatted = formatExpiryDate(e.target.value)
                  setFormData(prev => ({ ...prev, expiryDate: formatted }))
                }}
                placeholder="MM/YY"
                maxLength="5"
                className="btn"
                style={{
                  width: '100%',
                  background: 'var(--surface-elevated)',
                  border: errors.expiryDate ? '1px solid var(--error)' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-sm) var(--space-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
              {errors.expiryDate && <span className="small" style={{ color: 'var(--error)' }}>{errors.expiryDate}</span>}
            </div>

            <div>
              <label htmlFor="cvv" className="small" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                CVV *
              </label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                placeholder="123"
                maxLength="4"
                className="btn"
                style={{
                  width: '100%',
                  background: 'var(--surface-elevated)',
                  border: errors.cvv ? '1px solid var(--error)' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-sm) var(--space-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
              {errors.cvv && <span className="small" style={{ color: 'var(--error)' }}>{errors.cvv}</span>}
            </div>
          </div>
        </div>

        <div className="actions">
          <button
            type="submit"
            className="btn primary"
            disabled={isProcessing}
            style={{ minWidth: '150px' }}
          >
            {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
          </button>
          <button
            type="button"
            className="btn"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
