import Link from "next/link";

export default function FavouritesTestPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="z-10 w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Favourites Test Page
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--border)] rounded-lg">
            <Link href={`/locations/1`}>
              <h2 className="text-xl font-semibold hover:underline">
                Test Location 1
              </h2>
            </Link>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Notify me via email for promising conditions:
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  className={`px-3 py-1 text-sm rounded-md bg-gray-200 dark:bg-gray-700`}
                >
                  Today
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md bg-blue-500 text-white`}
                >
                  Tomorrow
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md bg-gray-200 dark:bg-gray-700`}
                >
                  In two days
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 bg-[var(--border)] rounded-lg">
            <Link href={`/locations/2`}>
              <h2 className="text-xl font-semibold hover:underline">
                Test Location 2
              </h2>
            </Link>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Notify me via email for promising conditions:
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  className={`px-3 py-1 text-sm rounded-md bg-blue-500 text-white`}
                >
                  Today
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md bg-gray-200 dark:bg-gray-700`}
                >
                  Tomorrow
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md bg-blue-500 text-white`}
                >
                  In two days
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
