import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getCurrentVotingResults() {
  try {
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
    });

    const totalVotes = voteResults.reduce((sum, option) => sum + option._count.votes, 0);

    const formattedResults = {
      options: voteResults.map(option => ({
        id: option.id,
        name: option.optionName,
        count: option._count.votes,
        percentage: totalVotes > 0 ? Math.round((option._count.votes / totalVotes) * 100) : 0
      })),
      totalVotes,
      timestamp: Date.now()
    };

    return formattedResults;
  } catch (error) {
    console.error('Error fetching voting results:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export async function validateOptionExists(optionId) {
  try {
    const option = await prisma.option.findUnique({
      where: { id: optionId }
    });
    return !!option;
  } catch (error) {
    console.error('Error validating option:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}