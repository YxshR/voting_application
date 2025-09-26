import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const options = await prisma.option.findMany({
      orderBy: {
        id: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      options
    })
  } catch (error) {
    console.error('Error fetching voting options:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to retrieve voting options'
        }
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}