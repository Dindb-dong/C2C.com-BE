const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    // 데이터베이스 연결 테스트
    await prisma.$connect()
    console.log('Successfully connected to the database!')
    
    // 테스트 사용자 생성
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashed_password_here',
        name: 'Test User',
        role: 'user'
      }
    })
    console.log('Created test user:', testUser)

    // 생성된 사용자 조회
    const users = await prisma.user.findMany()
    console.log('All users:', users)
    
    // 연결 종료
    await prisma.$disconnect()
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main() 