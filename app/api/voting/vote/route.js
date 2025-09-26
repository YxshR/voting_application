import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '../../../../lib/session.js'
import { broadcastVoteUpdate } from '../../../../lib/websocket-server.js'
import { getCurrentVotingResults } from '../../../../lib/voting-utils.js'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json()
    const { optionId } = body

    // Validate input
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

    // Get session from request
    const sessionData = await getSessionFromRequest(request)
    
    if (!sessionData || !sessionData.user) {
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

    // Check if user has already voted
    if (sessionData.hasVoted) {
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

    // Verify the option exists
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

    // Create the vote
    const vote = await prisma.vote.create({
      data: {
        userId: sessionData.user.id,
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

    // Get updated results and broadcast to all connected clients
    try {
      const updatedResults = await getCurrentVotingResults()
      broadcastVoteUpdate(updatedResults)
      console.log('Vote update broadcasted to WebSocket clients')
    } catch (broadcastError) {
      console.error('Error broadcasting vote update:', broadcastError)
      // Don't fail the vote if broadcast fails
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