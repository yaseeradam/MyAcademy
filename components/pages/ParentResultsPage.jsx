'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Award, Users } from 'lucide-react'

export default function ParentResultsPage({ apiCall }) {
  const [students, setStudents] = useState([])
  const [reportCards, setReportCards] = useState([])
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadResults = async () => {
      try {
        const data = await apiCall('parent/results')
        setStudents(data.students || [])
        setReportCards(data.reportCards || [])
        setCertificates(data.certificates || [])
      } catch (error) {
        console.error('Error loading results:', error)
      } finally {
        setLoading(false)
      }
    }
    loadResults()
  }, [apiCall])

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId)
    return student ? `${student.firstName} ${student.lastName}` : 'Student'
  }

  if (loading) {
    return (
      <Card className="border-slate-200/80 bg-white/80">
        <CardContent className="p-8 text-center text-slate-500">
          Loading results...
        </CardContent>
      </Card>
    )
  }

  if (reportCards.length === 0 && certificates.length === 0) {
    return (
      <Card className="border-slate-200/80 bg-white/80">
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-700">No results yet.</p>
          <p className="text-sm text-slate-500 mt-1">Your child's results and certificates will appear here when issued.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Results</h2>
        <p className="text-sm text-slate-500 mt-1">Previous report cards and certificates</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200/80 bg-white/80">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-500" />
              Report Cards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reportCards.length === 0 && (
              <p className="text-sm text-slate-500">No report cards yet.</p>
            )}
            {reportCards.map((card) => (
              <div key={card.id} className="flex items-center justify-between border border-slate-200/80 bg-white rounded-lg px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-slate-900">{getStudentName(card.studentId)}</div>
                  <div className="text-xs text-slate-500">
                    {card.className || 'Class'} • {card.term || 'Term'} • {card.academicYear || ''}
                  </div>
                </div>
                <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                  {new Date(card.issuedAt || card.createdAt || Date.now()).toLocaleDateString()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/80">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Certificates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {certificates.length === 0 && (
              <p className="text-sm text-slate-500">No certificates yet.</p>
            )}
            {certificates.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between border border-amber-200/70 bg-amber-50/60 rounded-lg px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-slate-900">{getStudentName(cert.studentId)}</div>
                  <div className="text-xs text-slate-500 capitalize">
                    {cert.type || 'Certificate'}
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                  {new Date(cert.issuedAt || cert.createdAt || Date.now()).toLocaleDateString()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
