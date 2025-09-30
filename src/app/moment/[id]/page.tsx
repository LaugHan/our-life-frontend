// src/app/moment/[id]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

// --- 类型定义 ---
interface ImageAsset { url: string; width: number; height: number; alternativeText?: string | null; }
interface DescriptionNode { type: string; children: { type: string; text: string }[] }
interface Photo { id: number; title: string; description: DescriptionNode[]; location: string; date: string; image: ImageAsset[]; }

// --- 最终版数据获取函数 ---
async function getPhotoById(id: string): Promise<Photo | null> {
  // 关键：这里请求的是列表 API，不是 /moments/:id
  const STRAPI_URL = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/moments?populate=image`;
  try {
    const res = await fetch(STRAPI_URL, { cache: 'no-store' });
    if (!res.ok) return null;
    const jsonResponse = await res.json();
    const allPhotos: Photo[] = jsonResponse.data || [];
    
    // 在获取到的列表中查找匹配的 ID
    const numericId = parseInt(id, 10);
    const photo = allPhotos.find(p => p.id === numericId);
    
    return photo || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// --- 详情页组件 ---
export default async function PhotoDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const photo = await getPhotoById(id);

  if (!photo) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen text-center bg-stone-50 text-stone-800">
        <h1 className="text-4xl font-bold font-serif">哦豁！ (404)</h1>
        <p className="mt-4">找不到 ID 为 {id} 的瞬间记录。</p>
        <Link href="/" className="mt-8 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          返回主页
        </Link>
      </main>
    );
  }

  // 将 Strapi 的富文本 JSON 转换成 Markdown 字符串
  const descriptionAsMarkdown = photo.description?.map(block => 
    block.children.map(child => child.text).join('')
  ).join('\n\n') || '';

  return (
    <main className="bg-stone-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <Link href="/" className="text-blue-500 hover:underline mb-8 block font-sans">
          &larr; 返回所有瞬间
        </Link>
        <header className="mb-8 border-b pb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900">{photo.title}</h1>
          <div className="text-lg text-stone-500 mt-4 flex items-center gap-4 font-sans">
            <span>{photo.location}</span>
            <span>&bull;</span>
            <span>{photo.date}</span>
          </div>
        </header>
        <div className="space-y-8">
          {photo.image.map((img, index) => (
            <div key={index}>
              <Image
                src={img.url.startsWith('http') ? img.url : `${process.env.NEXT_PUBLIC_STRAPI_URL}${img.url}`}
                alt={img.alternativeText || `${photo.title} - ${index + 1}`}
                width={img.width}
                height={img.height}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          ))}
        </div>
        {descriptionAsMarkdown && (
            <article className="prose lg:prose-xl mt-12 pt-8 border-t">
              <ReactMarkdown>{descriptionAsMarkdown}</ReactMarkdown>
            </article>
        )}
      </div>
    </main>
  );
}