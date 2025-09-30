// src/app/page.tsx
import Image from 'next/image';
import Link from 'next/link';

// --- 类型定义 ---
interface ImageAsset { url: string; width: number; height: number; alternativeText?: string | null; }
interface Photo { id: number; title: string; location: string; date: string; image: ImageAsset[]; }

// --- 数据获取函数 ---
async function getPhotos(): Promise<Photo[]> {
  const STRAPI_URL = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/moments?populate=image`;

  try {
    const res = await fetch(STRAPI_URL, { cache: 'no-store' });
    if (!res.ok) {
      console.error("获取照片列表失败!");
      return [];
    }
    const jsonResponse = await res.json();
    return jsonResponse.data || []; // 保证返回 data 数组
  } catch (error) {
    console.error("获取照片列表时发生严重错误:", error);
    return [];
  }
}

// --- 主页组件 ---
export default async function HomePage() {
  const photos = await getPhotos();

  if (!photos || photos.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-stone-50 text-stone-700">
        <h1 className="text-4xl font-serif font-bold mb-4">妤妤和笑笑的瞬间</h1>
        <p>还没有照片哦，快去后台添加第一张属于妤妤和笑笑的回忆吧！</p>
      </main>
    );
  }

  return (
    <main className="bg-stone-50 min-h-screen p-4 sm:p-8 lg:p-12">
      <div className="container mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 tracking-wider">
            妤妤和笑笑的瞬间💕
          </h1>
          <p className="text-stone-500 mt-2">Yuyu and Xiaoxiao's Precious Moments</p>
        </header>
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {photos.map((photo) => {
            if (!photo.image || photo.image.length === 0) return null;
            const coverImage = photo.image[0];
            return (
              <Link key={photo.id} href={`/moment/${photo.id}`} className="block">
                <div className="relative overflow-hidden rounded-lg group break-inside-avoid">
                  {photo.image.length > 1 && (
                    <div className="absolute top-3 right-3 z-10 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      {photo.image.length} 张
                    </div>
                  )}
                  <Image
                    src={coverImage.url.startsWith('http') ? coverImage.url : `${process.env.NEXT_PUBLIC_STRAPI_URL}${coverImage.url}`}
                    alt={coverImage.alternativeText || photo.title}
                    width={coverImage.width}
                    height={coverImage.height}
                    className="w-full h-auto object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={photos.indexOf(photo) < 4}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out">
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <h2 className="text-2xl font-bold">{photo.title}</h2>
                      <div className="text-sm mt-1 opacity-90 flex items-center gap-4">
                        <span>{photo.location}</span>
                        <span>{photo.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}