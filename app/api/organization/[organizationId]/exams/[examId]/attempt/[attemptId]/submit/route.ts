import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: { organizationId: string, examId: string, attemptId: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const { organizationId, examId, attemptId } = params

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          sections: {
            include: {
              questions: true
            }
          }
        }
      },
      responses: true
    }
  })

  if (!attempt || attempt.userId !== userId) {
    return NextResponse.json({ error: 'Attempt not found or unauthorized' }, { status: 404 })
  }

  if (attempt.submittedAt) {
    return NextResponse.json({ error: 'Attempt already submitted' }, { status: 400 })
  }

  if (attempt.examId !== examId || attempt.exam.organizationId !== organizationId) {
    return NextResponse.json({ error: 'Attempt does not match exam or organization' }, { status: 400 })
  }

  // Grading Logic
  let totalScore = 0
  let gradedResponses = []

  for (const response of attempt.responses) {
    const question = await prisma.question.findUnique({
      where: { id: response.questionId },
      include: { correctAnswer: true }
    })

    // Here, you can expand the grading logic based on question type (MCQ, short answer, etc.)
    let isCorrect = false
    if (question.type === 'MULTIPLE_CHOICE' && response.response === question.correctAnswer) {
      isCorrect = true
    } else if (question.type === 'SHORT_ANSWER' && response.response.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
      isCorrect = true
    }
    // Add more types as needed

    // Points assignment
    if (isCorrect) {
      totalScore += question.points
      gradedResponses.push({
        questionId: question.id,
        score: question.points,
        isCorrect: true
      })
    } else {
      gradedResponses.push({
        questionId: question.id,
        score: 0,
        isCorrect: false
      })
    }
  }

  // Mark attempt as submitted
  const updatedAttempt = await prisma.examAttempt.update({
    where: { id: attempt.id },
    data: {
      submittedAt: new Date(),
      score: totalScore,
      graded: true
    }
  })

  // Optional: Save graded responses
  await prisma.examResponse.updateMany({
    where: { attemptId: attempt.id },
    data: gradedResponses.map(({ questionId, score, isCorrect }) => ({
      score,
      isCorrect
    }))
  })

  return NextResponse.json({
    success: true,
    attempt: {
      id: updatedAttempt.id,
      submittedAt: updatedAttempt.submittedAt,
      score: updatedAttempt.score,
      graded: updatedAttempt.graded
    }
  })
}
