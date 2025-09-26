import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession, hasUserVoted } from '../../../../lib/session.js'
import { broadcastVoteUpdate } from '../../../../lib/websocket-server.js'
import { getCurrentVotingResults } from '../../../../lib/voting-utils.js'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const body = await request.json()
    const { optionId } = body

    if (!optionId || typeof optionId !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Option ID is required and must be a number'
          }
        },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const sessionId = cookieStore.get('voting-session')?.value

    console.log('Vote API - Session ID from cookie:', sessionId)

    if (!sessionId) {
      console.log('Vote API - No session ID found in cookie')
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Valid session required to vote'
          }
        },
        { status: 401 }
      )
    }

    const user = await validateSession(sessionId)
    
    if (!user) {
      console.log('Vote API - Session validation failed for ID:', sessionId)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Valid session required to vote'
          }
        },
        { status: 401 }
      )
    }

    const userHasVoted = await hasUserVoted(user.id)
    if (userHasVoted) {
      console.log('Vote API - User has already voted:', user.name)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_VOTE',
            message: 'You have already voted in this session'
          }
        },
        { status: 409 }
      )
    }

    const option = await prisma.option.findUnique({
      where: { id: optionId }
    })

    if (!option) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_OPTION',
            message: 'Selected voting option does not exist'
          }
        },
        { status: 400 }
      )
    }

    const vote = await prisma.vote.create({
      data: {
        userId: user.id,
        optionId: optionId
      },
      include: {
        option: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    try {
      const updatedResults = await getCurrentVotingResults()
      broadcastVoteUpdate(updatedResults)
      console.log('Vote update broadcasted to WebSocket clients')
    } catch (broadcastError) {
      console.error('Error broadcasting vote update:', broadcastError)
    }

    return NextResponse.json({
      success: true,
      message: 'Vote recorded successfully',
      vote: {
        id: vote.id,
        optionName: vote.option.optionName,
        userName: vote.user.name,
        createdAt: vote.createdAt
      }
    })

  } catch (error) {
    console.error('Error submitting vote:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to record vote'
        }
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}