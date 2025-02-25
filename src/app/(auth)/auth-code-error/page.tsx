"use client";

import {useSearchParams} from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
        <h2 className="text-2xl font-bold text-red-600">
          Authentication Error
        </h2>
        <p className="text-gray-700 mt-2">
          {error
            ? decodeURIComponent(error)
            : "Something went wrong during authentication."}
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
          Go Back to Home
        </button>
      </div>
    </div>
  );
}
