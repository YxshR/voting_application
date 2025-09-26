import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const options = [
    { optionName: 'Option A' },
    { optionName: 'Option B' },
    { optionName: 'Option C' }
  ]

  console.log('Seeding voting options...')
  
  for (const option of options) {
    const result = await prisma.option.upsert({
      where: { optionName: option.optionName },
      update: {},
      create: option,
    })
    console.log(`Created/updated option: ${result.optionName}`)
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })