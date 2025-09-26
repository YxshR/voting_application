import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// Simple in-memory cache for results
let resultsCache = null
let cacheTimestamp = null
const CACHE_DURATION = 5000 // 5 seconds

export async function GET() {
  try {
    // Check if we have valid cached results
    const now = Date.now()
    if (resultsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        results: resultsCache,
        cached: true
      })
    }

    // Fetch vote counts with option details
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

    // Calculate total votes
    const totalVotes = voteResults.reduce((sum, option) => sum + option._count.votes, 0)

    // Format results with percentages
    const formattedResults = {
      options: voteResults.map(option => ({
        id: option.id,
        name: option.optionName,
        count: option._count.votes,
        percentage: totalVotes > 0 ? Math.round((option._count.votes / totalVotes) * 100) : 0
      })),
      totalVotes
    }

    // Update cache
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

// Helper function to clear cache (useful for testing or manual cache invalidation)
export function clearResultsCache() {
  resultsCache = null
  cacheTimestamp = null
}