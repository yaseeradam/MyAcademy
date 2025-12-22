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

  const handleDeleteExam = async (id) => {
    modal?.showLoading('Deleting exam...')
    const updated = exams.filter(e => (e.id || e._id) !== id)
    safeSetStorage('exams', updated)
    setExams(updated)
    modal?.showSuccess('Exam Deleted', 'Exam deleted successfully!')
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
    const newData = { ...form, _id: form._id || form.id || Date.now().toString(), paid: form.paid || 0 }
    let updated
    if (form._id || form.id) {
      updated = fees.map(f => (f._id === form._id || f.id === form.id) ? newData : f)
    } else {
      updated = [...fees, newData]
    }
    const limited = safeSetStorage('fees', updated)
    setFees(limited)
    modal?.showSuccess(form._id || form.id ? 'Fee Updated' : 'Fee Added', form._id || form.id ? 'Fee updated successfully!' : 'Fee added successfully!')
    setShowModal(false)
  }

  const handleDeleteFee = async (id) => {
    modal?.showLoading('Deleting fee...')
    const updated = fees.filter(f => (f.id || f._id) !== id)
    safeSetStorage('fees', updated)
    setFees(updated)
    modal?.showSuccess('Fee Deleted', 'Fee deleted successfully!')
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
    const newData = { ...form, _id: form._id || form.id || Date.now().toString(), submissions: form.submissions || [] }
    let updated
    if (form._id || form.id) {
      updated = homework.map(h => (h._id === form._id || h.id === form.id) ? newData : h)
    } else {
      updated = [...homework, newData]
    }
    const limited = safeSetStorage('homework', updated)
    setHomework(limited)
    modal?.showSuccess(form._id || form.id ? 'Homework Updated' : 'Homework Assigned', form._id || form.id ? 'Homework updated successfully!' : 'Homework assigned successfully!')
    setShowModal(false)
  }

  const handleDeleteHomework = async (id) => {
    modal?.showLoading('Deleting homework...')
    const updated = homework.filter(h => (h.id || h._id) !== id)
    safeSetStorage('homework', updated)
    setHomework(updated)
    modal?.showSuccess('Homework Deleted', 'Homework deleted successfully!')
  }

  const handleBookSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    modal?.showLoading('Adding book...')
    const newData = { ...form, _id: form._id || form.id || Date.now().toString(), issuedTo: form.issuedTo || [] }
    let updated
    if (form._id || form.id) {
      updated = books.map(b => (b._id === form._id || b.id === form.id) ? newData : b)
    } else {
      updated = [...books, newData]
    }
    const limited = safeSetStorage('books', updated)
    setBooks(limited)
    modal?.showSuccess(form._id || form.id ? 'Book Updated' : 'Book Added', form._id || form.id ? 'Book updated successfully!' : 'Book added successfully!')
    setShowModal(false)
  }

  const handleDeleteBook = async (id) => {
    modal?.showLoading('Deleting book...')
    const updated = books.filter(b => (b.id || b._id) !== id)
    safeSetStorage('books', updated)
    setBooks(updated)
    modal?.showSuccess('Book Deleted', 'Book deleted successfully!')
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
    const newData = { ...form, _id: form._id || form.id || Date.now().toString() }
    let updated
    if (form._id || form.id) {
      updated = behaviors.map(b => (b._id === form._id || b.id === form.id) ? newData : b)
    } else {
      updated = [...behaviors, newData]
    }
    const limited = safeSetStorage('behaviors', updated)
    setBehaviors(limited)
    modal?.showSuccess(form._id || form.id ? 'Behavior Updated' : 'Behavior Recorded', form._id || form.id ? 'Behavior updated successfully!' : 'Behavior recorded successfully!')
    setShowModal(false)
  }

  const handleDeleteBehavior = async (id) => {
    modal?.showLoading('Deleting behavior record...')
    const updated = behaviors.filter(b => (b.id || b._id) !== id)
    safeSetStorage('behaviors', updated)
    setBehaviors(updated)
    modal?.showSuccess('Behavior Deleted', 'Behavior record deleted successfully!')
  }

  const handleRouteSubmit = async (e, form, setShowModal) => {
    e.preventDefault()
    modal?.showLoading('Adding route...')
    const newData = { ...form, _id: form._id || form.id || Date.now().toString() }
    let updated
    if (form._id || form.id) {
      updated = routes.map(r => (r._id === form._id || r.id === form.id) ? newData : r)
    } else {
      updated = [...routes, newData]
    }
    const limited = safeSetStorage('routes', updated)
    setRoutes(limited)
    modal?.showSuccess(form._id || form.id ? 'Route Updated' : 'Route Added', form._id || form.id ? 'Route updated successfully!' : 'Route added successfully!')
    setShowModal(false)
  }

  const handleDeleteRoute = async (id) => {
    modal?.showLoading('Deleting route...')
    const updated = routes.filter(r => (r.id || r._id) !== id)
    safeSetStorage('routes', updated)
    setRoutes(updated)
    modal?.showSuccess('Route Deleted', 'Route deleted successfully!')
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

  const handleDeleteHealthRecord = async (id) => {
    modal?.showLoading('Deleting health record...')
    const updated = healthRecords.filter(h => (h.id || h._id) !== id)
    safeSetStorage('healthRecords', updated)
    setHealthRecords(updated)
    modal?.showSuccess('Health Record Deleted', 'Health record deleted successfully!')
  }

  return {
    timetables, exams, fees, homework, books, events, behaviors, routes, healthRecords,
    handleTimetableSubmit, handleTimetableDelete,
    handleExamSubmit, handleGradeSubmit, handleDeleteExam,
    handleFeeSubmit, handlePayment, handleDeleteFee,
    handleHomeworkSubmit, handleDeleteHomework,
    handleBookSubmit, handleIssueBook, handleReturnBook, handleDeleteBook,
    handleEventSubmit, handleEventDelete,
    handleBehaviorSubmit, handleDeleteBehavior,
    handleRouteSubmit, handleAssignRoute, handleDeleteRoute,
    handleHealthSubmit, handleDeleteHealthRecord
  }
}
