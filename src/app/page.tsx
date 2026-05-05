import { SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-4 bg-black text-white">
      <h1 className="text-4xl font-bold">Hackathon API Tester</h1>

      {!userId ? (
        <>
          <div className="bg-white text-black px-6 py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors mt-6">
            <SignInButton mode="modal" />
          </div>
          <p className="text-sm text-gray-400 mt-2">Click this button to log in</p>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 mt-6">
          <UserButton />
          <p className="text-green-400 font-semibold text-xl">✅ You are successfully logged in!</p>
          
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg max-w-lg mt-4 text-center">
            <h2 className="text-lg mb-2">Next Step: Get your token</h2>
            <p className="text-sm text-gray-400 mb-4">Open your browser console (F12 or Right-Click &rarr; Inspect) and paste this command:</p>
            <code className="bg-black border border-gray-800 px-3 py-2 rounded text-green-300 block select-all">
              await window.Clerk.session.getToken()
            </code>
          </div>
        </div>
      )}
    </main>
  );
}

