import { initDatabase } from '@/lib/db/init';
import Post from '@/models/Post';

async function migrateCodeBlocks() {
  await initDatabase();
  
  const posts = await Post.find({});
  
  for (const post of posts) {
    // Update code blocks to have proper classes
    let content = post.content;
    content = content.replace(
      /<pre><code>/g, 
      '<pre><code class="hljs language-typescript">'
    );
    
    await Post.updateOne(
      { _id: post._id },
      { $set: { content: content } }
    );
  }
  
  console.log('Migration complete');
}

migrateCodeBlocks().catch(console.error); 