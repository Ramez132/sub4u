"use client";

import { useRouter } from "next/navigation";

type Props = {
  title: string;
};

export default function PageHeader({ title }: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="sticky top-0 z-50 border-b-4 border-red-500 bg-yellow-200">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4">
        <button
          onClick={handleBack}
          className="rounded-lg bg-red-600 px-4 py-2 text-white"
        >
          ← Back
        </button>

        <h1 className="text-xl font-bold text-black">{title}</h1>
      </div>
    </div>
  );
}