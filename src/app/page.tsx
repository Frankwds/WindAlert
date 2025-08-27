import GoogleMaps from './components/GoogleMaps/GoogleMaps'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center  bg-[var(--background)] text-[var(--foreground)]">
      <div className="w-full max-w-6xl">
        <GoogleMaps />
      </div>
    </main>
  );
}
