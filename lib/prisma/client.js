import { PrismaClient } from '../generated/prisma/client'

// allow global `var` declarations
// eslint-disable-next-line no-var
global.prisma = global.prisma || undefined

export const prisma =
  global.prisma ||
  new PrismaClient({
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma 