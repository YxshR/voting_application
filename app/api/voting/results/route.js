import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

let resultsCache = null
let cacheTimestamp = null
const CACHE_DURATION = 5000

export async function GET() {
  try {
    const now = Date.now()
    if (resultsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        results: resultsCache,
        cached: true
      })
    }

    const voteResults = await prisma.option.findMany({
      include: {
        _count: {
          select: {
            votes: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    })

    const totalVotes = voteResults.reduce((sum, option) => sum + option._count.votes, 0)

    const formattedResults = {
      options: voteResults.map(option => ({
        id: option.id,
        name: option.optionName,
        count: option._count.votes,
        percentage: totalVotes > 0 ? Math.round((option._count.votes / totalVotes) * 100) : 0
      })),
      totalVotes
    }

    resultsCache = formattedResults
    cacheTimestamp = now

    return NextResponse.json({
      success: true,
      results: formattedResults,
      cached: false
    })

  } catch (error) {
    console.error('Error fetching voting results:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to retrieve voting results'
        }
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export function clearResultsCache() {
  resultsCache = null
  cacheTimestamp = null
}