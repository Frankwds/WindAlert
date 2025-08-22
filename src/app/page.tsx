import UsersList from './components/UsersList'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Wind Alert Dashboard</h1>
      <UsersList />
    </main>
  );
}
