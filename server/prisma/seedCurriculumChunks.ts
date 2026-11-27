// Seeds the fine-grained chunks.json produced by `npm run ingest`.
// Run with: npm run seed:chunks

import { PrismaClient } from '@prisma/client';
import { loadChunksFromJson, seedChunks } from '../src/services/chunkStore';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const chunks = loadChunksFromJson();
  await seedChunks(chunks, prisma);
  console.log(`Seeded ${chunks.length} fine-grained curriculum chunks.`);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
