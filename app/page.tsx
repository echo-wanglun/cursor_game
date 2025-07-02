import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold text-center sm:text-left">贪吃蛇消消乐</h1>
        <p className="text-center sm:text-left text-gray-600 dark:text-gray-400">
          经典贪吃蛇与消消乐的完美结合，体验全新的游戏乐趣！
        </p>
        
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            href="/game"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Play icon"
              width={20}
              height={20}
            />
            开始游戏
          </Link>
          
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            游戏规则
          </a>
        </div>
      </main>
    </div>
  );
}