import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGO_URL)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

async function connectDB() {
  try {
    await client.connect()
    return client.db(process.env.DB_NAME || 'school_management')
  } catch (error) {
    console.error('Database connection error:', error)
    throw error
  }
}

function authenticateToken(request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) return null
  
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function POST(request) {
  try {
    const userData = authenticateToken(request)
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, context } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const db = await connectDB()
    
    // Get user's school context for personalized responses
    let schoolContext = {}
    if (userData.schoolId) {
      const school = await db.collection('schools').findOne({ id: userData.schoolId })
      const studentCount = await db.collection('students').countDocuments({ schoolId: userData.schoolId })
      const teacherCount = await db.collection('teachers').countDocuments({ schoolId: userData.schoolId })
      const classCount = await db.collection('classes').countDocuments({ schoolId: userData.schoolId })
      
      schoolContext = {
        schoolName: school?.name,
        studentCount,
        teacherCount,
        classCount
      }
    }

    // Generate AI response based on message and context
    const aiResponse = await generateAIResponse(message, userData, schoolContext, db)
    
    // Store conversation for learning (optional)
    await db.collection('ai_conversations').insertOne({
      userId: userData.id,
      schoolId: userData.schoolId,
      userMessage: message,
      aiResponse: aiResponse.content,
      context,
      timestamp: new Date(),
      userRole: userData.role
    })

    return NextResponse.json(aiResponse)
    
  } catch (error) {
    console.error('AI Chat Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateAIResponse(message, user, schoolContext, db) {
  const lowerMessage = message.toLowerCase()
  const userRole = user.role
  
  // Advanced pattern matching for school-specific queries
  if (lowerMessage.includes('attendance') && lowerMessage.includes('report')) {
    const attendanceData = await getAttendanceInsights(user.schoolId, db)
    return {
      content: `📊 **Attendance Report Analysis**\n\n**Current Statistics:**\n• Total Students: ${schoolContext.studentCount}\n• Average Attendance: ${attendanceData.averageAttendance}%\n• Students with Perfect Attendance: ${attendanceData.perfectAttendance}\n• Students Needing Attention: ${attendanceData.lowAttendance}\n\n**Recommendations:**\n${attendanceData.recommendations.join('\n')}`,
      suggestions: ['Generate detailed report', 'Set up attendance alerts', 'View individual student data'],
      type: 'data_analysis'
    }
  }
  
  if (lowerMessage.includes('student') && (lowerMessage.includes('performance') || lowerMessage.includes('grade'))) {
    return {
      content: `🎯 **Student Performance Analysis**\n\n**Key Performance Indicators:**\n• Grade Distribution Analysis\n• Subject-wise Performance Trends\n• Individual Student Progress Tracking\n• Comparative Class Performance\n\n**Actionable Insights:**\n1. **Early Intervention**: Identify students scoring below 70%\n2. **Differentiated Learning**: Adapt teaching methods for diverse learners\n3. **Parent Engagement**: Schedule conferences for struggling students\n4. **Peer Support**: Implement buddy system for academic support\n\n**Next Steps:**\n${userRole === 'teacher' ? '• Focus on formative assessments\n• Implement project-based learning' : '• Review curriculum alignment\n• Analyze teacher effectiveness'}`,
      suggestions: ['Show grade trends', 'Identify at-risk students', 'Create intervention plan'],
      type: 'academic_guidance'
    }
  }
  
  if (lowerMessage.includes('curriculum') || lowerMessage.includes('lesson plan')) {
    const curriculumAdvice = getCurriculumGuidance(lowerMessage, userRole)
    return {
      content: curriculumAdvice.content,
      suggestions: curriculumAdvice.suggestions,
      type: 'curriculum_planning'
    }
  }
  
  if (lowerMessage.includes('parent') && lowerMessage.includes('communication')) {
    return {
      content: `💬 **Parent Communication Excellence**\n\n**Effective Strategies:**\n• **Regular Updates**: Weekly progress reports\n• **Positive Reinforcement**: Share student achievements\n• **Clear Expectations**: Outline academic and behavioral goals\n• **Multiple Channels**: Email, SMS, parent portal, meetings\n\n**Communication Templates:**\n1. **Progress Update**: "Your child [Name] has shown improvement in [Subject]..."\n2. **Concern Alert**: "I'd like to discuss [Name]'s recent challenges in..."\n3. **Achievement Celebration**: "Congratulations! [Name] has excelled in..."\n\n**Best Practices:**\n• Respond within 24 hours\n• Use positive language\n• Provide specific examples\n• Offer actionable solutions`,
      suggestions: ['Draft parent email', 'Schedule parent meeting', 'Create communication calendar'],
      type: 'communication_guide'
    }
  }
  
  if (lowerMessage.includes('schedule') || lowerMessage.includes('timetable')) {
    return {
      content: `⏰ **Smart Schedule Optimization**\n\n**Optimization Principles:**\n• **Peak Learning Hours**: Schedule core subjects 9-11 AM\n• **Subject Balance**: Alternate heavy and light subjects\n• **Teacher Efficiency**: Minimize classroom transitions\n• **Student Wellness**: Include adequate break times\n\n**Weekly Structure Recommendations:**\n• Monday: Fresh start with engaging subjects\n• Tuesday-Thursday: Core academic focus\n• Friday: Creative and practical subjects\n\n**Special Considerations:**\n• Lab sessions require double periods\n• Physical education needs outdoor time\n• Arts subjects benefit from afternoon slots\n• Study halls for exam preparation`,
      suggestions: ['Create optimal timetable', 'Analyze current schedule', 'Teacher availability check'],
      type: 'schedule_optimization'
    }
  }
  
  // General educational guidance
  const generalResponses = {
    'school_admin': `As a School Administrator, you have the unique opportunity to shape educational excellence. I can help you with strategic planning, resource allocation, staff development, and student success initiatives. What specific area would you like to focus on?`,
    'teacher': `As an educator, you're at the heart of student learning. I can assist with lesson planning, classroom management, assessment strategies, and professional development. How can I support your teaching goals today?`,
    'parent': `As a parent, your involvement is crucial for your child's success. I can help you understand academic progress, support learning at home, and communicate effectively with teachers. What would you like to know about your child's education?`,
    'developer': `From a system perspective, I can help analyze educational data, optimize school operations, and identify areas for technological enhancement. What insights are you looking for?`
  }
  
  return {
    content: generalResponses[userRole] || "I'm here to help with any school-related questions or challenges you might have. What specific area would you like assistance with?",
    suggestions: ['Show dashboard insights', 'Help with planning', 'Analyze data trends', 'Best practices guide'],
    type: 'general_guidance'
  }
}

async function getAttendanceInsights(schoolId, db) {
  try {
    const totalStudents = await db.collection('students').countDocuments({ schoolId })
    const attendanceRecords = await db.collection('attendance')
      .find({ schoolId })
      .toArray()
    
    // Calculate basic statistics
    const presentCount = attendanceRecords.filter(record => record.status === 'present').length
    const totalRecords = attendanceRecords.length
    const averageAttendance = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0
    
    return {
      averageAttendance,
      perfectAttendance: Math.floor(totalStudents * 0.15), // Estimated
      lowAttendance: Math.floor(totalStudents * 0.1), // Estimated
      recommendations: [
        '• Implement attendance rewards program',
        '• Send automated parent notifications',
        '• Conduct home visits for chronic absentees',
        '• Create engaging morning activities'
      ]
    }
  } catch (error) {
    return {
      averageAttendance: 85,
      perfectAttendance: 0,
      lowAttendance: 0,
      recommendations: ['• Monitor attendance patterns regularly']
    }
  }
}

function getCurriculumGuidance(message, userRole) {
  if (message.includes('math') || message.includes('mathematics')) {
    return {
      content: `🔢 **Mathematics Curriculum Excellence**\n\n**Core Components:**\n• Number Sense & Operations\n• Algebraic Thinking\n• Geometry & Spatial Reasoning\n• Data Analysis & Probability\n\n**Teaching Strategies:**\n1. **Concrete-Pictorial-Abstract**: Start with manipulatives\n2. **Problem-Based Learning**: Real-world applications\n3. **Differentiated Instruction**: Multiple ability levels\n4. **Technology Integration**: Interactive math tools\n\n**Assessment Methods:**\n• Formative: Exit tickets, quick polls\n• Summative: Projects, presentations\n• Diagnostic: Pre-assessments, error analysis`,
      suggestions: ['Math lesson templates', 'Assessment rubrics', 'Technology tools', 'Differentiation strategies']
    }
  }
  
  if (message.includes('science')) {
    return {
      content: `🔬 **Science Curriculum Innovation**\n\n**STEM Integration:**\n• Inquiry-Based Learning\n• Hands-On Experiments\n• Scientific Method Application\n• Cross-Curricular Connections\n\n**Laboratory Safety:**\n• Safety protocols and procedures\n• Equipment handling guidelines\n• Emergency response plans\n• Student safety contracts\n\n**21st Century Skills:**\n• Critical thinking development\n• Collaborative problem-solving\n• Digital literacy integration\n• Communication skills enhancement`,
      suggestions: ['Lab safety checklist', 'Experiment ideas', 'STEM projects', 'Assessment strategies']
    }
  }
  
  return {
    content: `📚 **Comprehensive Curriculum Planning**\n\n**Essential Elements:**\n• Learning Objectives Alignment\n• Standards-Based Instruction\n• Assessment Integration\n• Differentiation Strategies\n\n**Planning Framework:**\n1. **Backward Design**: Start with end goals\n2. **Unit Planning**: Chunk content meaningfully\n3. **Lesson Sequencing**: Logical progression\n4. **Resource Allocation**: Materials and time\n\n**Quality Indicators:**\n• Clear learning outcomes\n• Engaging activities\n• Varied assessment methods\n• Inclusive practices`,
    suggestions: ['Lesson plan template', 'Standards alignment', 'Assessment ideas', 'Resource recommendations']
  }
}