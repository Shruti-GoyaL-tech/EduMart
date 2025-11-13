"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

const HomeActions = () => {
  const { status } = useSession();

  return (
    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
      <Link href="/buy" className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-500 transition-transform transform hover:scale-105 shadow-lg">
        Browse the Market
      </Link>
      {/* This button will only render if the user is logged in */}
      {status === "authenticated" && (
        <Link href="/sell" className="bg-slate-700 text-white font-semibold py-3 px-8 rounded-lg hover:bg-slate-600 transition-transform transform hover:scale-105 shadow-lg">
          Sell an Item
        </Link>
      )}
    </div>
  );
};

export default HomeActions;
