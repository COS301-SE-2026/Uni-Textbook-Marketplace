import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Demo | Uni Textbook Marketplace',
  description:
    'Watch the full demo of the Uni Textbook Marketplace, a verified student marketplace for second-hand textbooks.',
};

const VIDEO_ID = '4Y2gHTDhFwg';
const REPO_URL = 'https://github.com/COS301-SE-2026/Uni-Textbook-Marketplace';

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-white text-[#3a3a3a]">
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#006D8A]">
          Project Day demo
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#000f2b] sm:text-4xl">
          See the marketplace in action
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed">
          A full walkthrough of the Uni Textbook Marketplace: verified student
          accounts, structured listings, admin moderation, messaging, live
          auctions, AI book scan and the bundle optimizer.
        </p>

        <div className="mt-8 overflow-hidden rounded border border-[#dddddd] bg-[#F5F5F5]">
          <div className="relative aspect-video w-full">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${VIDEO_ID}?rel=0`}
              title="Uni Textbook Marketplace full demo video"
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>

        <p className="mt-3 text-sm">
          Video not loading?{' '}
          <a
            href={`https://youtu.be/${VIDEO_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#006D8A] underline"
          >
            Watch it on YouTube
          </a>
          .
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded bg-[#00B4D8] px-6 py-2 font-semibold text-[#000f2b] hover:bg-[#0096b4]"
          >
            Try the live site
          </Link>
          
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center rounded border border-[#dddddd] px-6 py-2 font-semibold text-[#3a3a3a] hover:bg-[#F5F5F5]"
          >
            View the code on GitHub
          </a>
        </div>

        <p className="mt-10 text-sm text-[#4b4f58]">
          Built by NexusDev for Agile Bridge, COS 301 Software Engineering,
          University of Pretoria, 2026.
        </p>
      </section>
    </main>
  );
}