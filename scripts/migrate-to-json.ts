import { initDatabase } from '@/lib/db/init';
import Post from '@/models/Post';
import { generateJSON } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

async function migrateToJSON() {
  await initDatabase();
  const lowlight = createLowlight(common);
  
  const posts = await Post.find({});
  
  for (const post of posts) {
    // Convert HTML to JSON
    const json = generateJSON(post.content, [
      StarterKit,
      Image,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'typescript'
      }),
    ]);
    
    await Post.updateOne(
      { _id: post._id },
      { $set: { content: JSON.stringify(json) } }
    );
  }
  
  console.log('Migration complete');
}

migrateToJSON().catch(console.error); 