import { useState, useEffect, useCallback } from 'react'

// Limits to prevent localStorage from growing unbounded
const STORAGE_LIMITS = {
  timetables: 50,
  exams: 30,
  fees: 100,
  homework: 50,
  books: 100,
  events: 50,
  behaviors: 100,
  routes: 20,
  healthRecords: 100
}

export function useNewFeatures(user, token, apiCall, loadDashboardData, modal) {
  const [timetables, setTimetables] = useState([])
  const [exams, setExams] = useState([])
  const [fees, setFees] = useState([])
  const [homework, setHomework] = useState([])
  const [books, setBooks] = useState([])
  const [events, setEvents] = useState([])
  const [behaviors, setBehaviors] = useState([])
  const [routes, setRoutes] = useState([])
  const [healthRecords, setHealthRecords] = useState([])

  // Helper to safely store with limits
  const safeSetStorage = useCallback((key, data) => {
    try {
      const limit = STORAGE_LIMITS[key] || 100
      const limitedData = data.slice(-limit) // Keep only most recent items
      localStorage.setItem(key, JSON.stringify(limitedData))
      return limitedData
    } catch (error) {
      console.error(`Error storing ${key}:`, error)
      // If storage is full, clear old data
      if (error.name === 'QuotaExceededError') {
        const limitedData = data.slice(-Math.floor(limit / 2))
        localStorage.setItem(key, JSON.stringify(limitedData))
        return limitedData
      }
      return data
    }
  }, [])

  const loadAllData = useCallback(() => {
    try {
      // Load from localStorage with limits
      const stored = {
        timetables: JSON.parse(localStorage.getItem('timetables') || '[]').slice(-STORAGE_LIMITS.timetables),
        exams: JSON.parse(localStorage.getItem('exams') || '[]').slice(-STORAGE_LIMITS.exams),
        fees: JSON.parse(localStorage.getItem('fees') || '[]').slice(-STORAGE_LIMITS.fees),
        homework: JSON.parse(localStorage.getItem('homework') || '[]').slice(-STORAGE_LIMITS.homework),
        books: JSON.parse(localStorage.getItem('books') || '[]').slice(-STORAGE_LIMITS.books),
        events: JSON.parse(localStorage.getItem('events') || '[]').slice(-STORAGE_LIMITS.events),
        behaviors: JSON.parse(localStorage.getItem('behaviors') || '[]').slice(-STORAGE_LIMITS.behaviors),
        routes: JSON.parse(localStorage.getItem('routes') || '[]').slice(-STORAGE_LIMITS.routes),
        healthRecords: JSON.parse(localStorage.getItem('healthRecords') || '[]').slice(-STORAGE_LIMITS.healthRecords)
      }
      setTimetables(stored.timetables)
      setExams(stored.exams)
      setFees(stored.fees)
      setHomework(stored.homework)
      setBooks(stored.books)
      setEvents(stored.events)
      setBehaviors(stored.behaviors)
      setRoutes(stored.routes)
      setHealthRecords(stored.healthRecords)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }, [])

  useEffect(() => {
    if (user && token && user.role === 'school_admin') {
      loadAllData()
    }
  }, [user, token, loadAllData])



  const handleTimetableSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    modal?.showLoading('Saving timetable...')
    const newData = { ...form, _id: form._id || Date.now().toString() }
    let updated
    if (form._id) {
      updated = timetables.map(t => t._id === form._id ? newData : t)
    } else {
      updated = [...timetables, newData]
    }
    const limited = safeSetStorage('timetables', updated)
    setTimetables(limited)
    modal?.showSuccess('Timetable Saved', 'Timetable updated successfully!')
    setShowModal(false)
  }

  const handleTimetableDelete = async (id) => {
    modal?.showLoading('Deleting period...')
    const updated = timetables.filter(t => t._id !== id)
    safeSetStorage('timetables', updated)
    setTimetables(updated)
    modal?.showSuccess('Period Deleted', 'Period deleted successfully!')
  }

  const handleExamSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    modal?.showLoading('Saving exam...')
    const newData = { ...form, _id: form._id || Date.now().toString(), grades: form.grades || [] }
    let updated
    if (form._id) {
      updated = exams.map(ex => ex._id === form._id ? newData : ex)
    } else {
      updated = [...exams, newData]
    }
    const limited = safeSetStorage('exams', updated)
    setExams(limited)
    modal?.showSuccess('Exam Saved', 'Exam saved successfully!')
    setShowModal(false)
  }

  const handleGradeSubmit = async (e, gradeForm, setShowGradeModal) => {
    e.preventDefault()
    modal?.showLoading('Adding grade...')
    const updated = exams.map(ex => {
      if (ex._id === gradeForm.examId) {
        return { ...ex, grades: [...(ex.grades || []), gradeForm] }
      }
      return ex
    })
    const limited = safeSetStorage('exams', updated)
    setExams(limited)
    modal?.showSuccess('Grade Added', 'Grade added successfully!')
    setShowGradeModal(false)
  }

  const handleFeeSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    modal?.showLoading('Adding fee...')
    const newData = { ...form, _id: Date.now().toString(), paid: 0 }
    const updated = [...fees, newData]
    const limited = safeSetStorage('fees', updated)
    setFees(limited)
    modal?.showSuccess('Fee Added', 'Fee added successfully!')
    setShowModal(false)
  }

  const handlePayment = async (e, paymentForm, setShowPaymentModal) => {
    e.preventDefault()
    modal?.showLoading('Recording payment...')
    const updated = fees.map(f => f.studentId === paymentForm.studentId ? { ...f, paid: (f.paid || 0) + parseFloat(paymentForm.amount) } : f)
    const limited = safeSetStorage('fees', updated)
    setFees(limited)
    modal?.showSuccess('Payment Recorded', 'Payment recorded successfully!')
    setShowPaymentModal(false)
  }

  const handleHomeworkSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    modal?.showLoading('Assigning homework...')
    const newData = { ...form, _id: Date.now().toString(), submissions: [] }
    const updated = [...homework, newData]
    const limited = safeSetStorage('homework', updated)
    setHomework(limited)
    modal?.showSuccess('Homework Assigned', 'Homework assigned successfully!')
    setShowModal(false)
  }

  const handleBookSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    modal?.showLoading('Adding book...')
    const newData = { ...form, _id: Date.now().toString(), issuedTo: [] }
    const updated = [...books, newData]
    const limited = safeSetStorage('books', updated)
    setBooks(limited)
    modal?.showSuccess('Book Added', 'Book added successfully!')
    setShowModal(false)
  }

  const handleIssueBook = async (e, issueForm, setShowIssueModal) => {
    e.preventDefault()
    modal?.showLoading('Issuing book...')
    const updated = books.map(b => {
      if (b._id === issueForm.bookId) {
        return { ...b, available: b.available - 1, issuedTo: [...(b.issuedTo || []), { ...issueForm, issuedDate: new Date().toISOString() }] }
      }
      return b
    })
    const limited = safeSetStorage('books', updated)
    setBooks(limited)
    modal?.showSuccess('Book Issued', 'Book issued successfully!')
    setShowIssueModal(false)
  }

  const handleReturnBook = async (bookId, studentId) => {
    modal?.showLoading('Returning book...')
    const updated = books.map(b => {
      if (b._id === bookId) {
        return { ...b, available: b.available + 1, issuedTo: (b.issuedTo || []).filter(i => i.studentId !== studentId) }
      }
      return b
    })
    const limited = safeSetStorage('books', updated)
    setBooks(limited)
    modal?.showSuccess('Book Returned', 'Book returned successfully!')
  }

  const handleEventSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    modal?.showLoading('Saving event...')
    const newData = { ...form, _id: form._id || Date.now().toString() }
    let updated
    if (form._id) {
      updated = events.map(ev => ev._id === form._id ? newData : ev)
    } else {
      updated = [...events, newData]
    }
    const limited = safeSetStorage('events', updated)
    setEvents(limited)
    modal?.showSuccess('Event Saved', 'Event saved successfully!')
    setShowModal(false)
  }

  const handleEventDelete = async (id) => {
    modal?.showLoading('Deleting event...')
    const updated = events.filter(e => e._id !== id)
    safeSetStorage('events', updated)
    setEvents(updated)
    modal?.showSuccess('Event Deleted', 'Event deleted successfully!')
  }

  const handleBehaviorSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    modal?.showLoading('Recording behavior...')
    const newData = { ...form, _id: Date.now().toString() }
    const updated = [...behaviors, newData]
    const limited = safeSetStorage('behaviors', updated)
    setBehaviors(limited)
    modal?.showSuccess('Behavior Recorded', 'Behavior recorded successfully!')
    setShowModal(false)
  }

  const handleRouteSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    modal?.showLoading('Adding route...')
    const newData = { ...form, _id: Date.now().toString() }
    const updated = [...routes, newData]
    const limited = safeSetStorage('routes', updated)
    setRoutes(limited)
    modal?.showSuccess('Route Added', 'Route added successfully!')
    setShowModal(false)
  }

  const handleAssignRoute = async (e, assignForm, setShowAssignModal) => {
    e.preventDefault()
    modal?.showLoading('Assigning route...')
    modal?.showSuccess('Route Assigned', 'Student assigned to route!')
    setShowAssignModal(false)
    loadDashboardData()
  }

  const handleHealthSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    modal?.showLoading('Saving health record...')
    const newData = { ...form, _id: form._id || Date.now().toString() }
    let updated
    if (form._id) {
      updated = healthRecords.map(h => h._id === form._id ? newData : h)
    } else {
      updated = [...healthRecords, newData]
    }
    const limited = safeSetStorage('healthRecords', updated)
    setHealthRecords(limited)
    modal?.showSuccess('Health Record Saved', 'Health record saved successfully!')
    setShowModal(false)
  }

  return {
    timetables, exams, fees, homework, books, events, behaviors, routes, healthRecords,
    handleTimetableSubmit, handleTimetableDelete,
    handleExamSubmit, handleGradeSubmit,
    handleFeeSubmit, handlePayment,
    handleHomeworkSubmit,
    handleBookSubmit, handleIssueBook, handleReturnBook,
    handleEventSubmit, handleEventDelete,
    handleBehaviorSubmit,
    handleRouteSubmit, handleAssignRoute,
    handleHealthSubmit
  }
}
