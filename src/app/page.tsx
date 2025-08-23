import UsersList from './components/UsersList'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-[var(--background)] text-[var(--foreground)]">
      <div className="w-full max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)]/50 bg-clip-text text-transparent">
          Wind Alert Dashboard
        </h1>
        <UsersList />
      </div>
    </main>
  );
}
