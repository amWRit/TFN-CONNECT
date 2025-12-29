const prisma = require('../lib/prisma').default;

async function testBookmark() {
  try {
    // Try to list bookmarks (should not throw if model is available)
    const bookmarks = await prisma.bookmark.findMany({ take: 1 });
    console.log('Bookmark model is available. Sample:', bookmarks);
  } catch (err) {
    console.error('Error accessing prisma.bookmark:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testBookmark();
