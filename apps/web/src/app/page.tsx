import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Sprite Generator</h1>
        <p className="mt-2 text-lg text-gray-600">
          AI-powered sprite sheets for Godot and Unity
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-indigo-600 px-6 py-2.5 text-white font-medium hover:bg-indigo-700 transition-colors"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="rounded-md border border-gray-300 px-6 py-2.5 font-medium hover:bg-gray-100 transition-colors"
        >
          Register
        </Link>
      </div>
    </main>
  );
}
