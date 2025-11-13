// "use client";

// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useSession, signIn, signOut } from "next-auth/react";
// import Image from "next/image";

// const Navbar = () => {
//   const { data: session, status } = useSession();
//   const pathname = usePathname();
//   const [isClient, setIsClient] = useState(false);
//   const [cartCount, setCartCount] = useState(0);
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   useEffect(() => {
//     const fetchCartCount = async () => {
//       try {
//         const response = await fetch('/api/cart');
//         if (response.ok) {
//           const data = await response.json();
//           setCartCount(data.items?.length || 0);
//         }
//       } catch (error) {
//         console.error("Failed to fetch cart count:", error);
//       }
//     };

//     if (isClient && status === "authenticated") {
//       fetchCartCount();
//       const interval = setInterval(fetchCartCount, 5000);
//       return () => clearInterval(interval);
//     } else {
//       setCartCount(0);
//     }
//   }, [isClient, status]);

//   const [isLoggingIn, setIsLoggingIn] = useState(false);
//   const handleLogin = async () => {
//     setIsLoggingIn(true);
//     await signIn("google");
//     setIsLoggingIn(false);
//   };

//   const handleLogout = () => {
//     signOut({ callbackUrl: '/' });
//   };
  
//   const getLinkClass = (path) => {
//     return `px-3 py-2 rounded-md transition-colors text-lg ${
//         pathname === path 
//         ? 'bg-gray-700'
//         : 'hover:bg-gray-700'
//     }`;
//   };

//   return (
//     <nav className="bg-gray-900 text-white sticky top-0 z-50">
//       <div className="flex items-center p-4">
//         {/* Logo */}
//         <Link href="/" className="flex-shrink-0 flex items-center justify-center gap-2 text-2xl">
//           <lord-icon
//             src="https://cdn.lordicon.com/rrbmabsx.json"
//             trigger="hover"
//             colors="primary:#ffffff,secondary:#ffffff"
//             stroke="bold"
//           ></lord-icon>
//           EduMart
//         </Link>

//         {/* Wrapper for all right-side content */}
//         <div className="ml-auto flex items-center">
//             {/* Desktop Navigation Links & Icons Wrapper */}
//             <div className="hidden md:flex items-center gap-8">
//                 <Link href="/" className={getLinkClass('/')}>Home</Link>
//                 <Link href="/buy" className={getLinkClass('/buy')}>Buy</Link>
//                 {isClient && status === "authenticated" && (
//                     <Link href="/sell" className={getLinkClass('/sell')}>Sell</Link>
//                 )}

//                 {/* Vertical Divider */}
//                 <div className="border-l border-gray-600 h-6"></div>

//                 {/* Right side icons and login/logout */}
//                 <div className="flex items-center gap-6">
//                 {isClient && (
//                     status === "authenticated" ? (
//                     <>
//                         <Link href="/cart" className="relative">
//                         <lord-icon
//                             src="https://cdn.lordicon.com/uisoczqi.json"
//                             trigger="hover"
//                             colors="primary:#ffffff,secondary:#ffffff"
//                             stroke="bold"
//                         ></lord-icon>
//                         {cartCount > 0 && (
//                             <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
//                             {cartCount}
//                             </span>
//                         )}
//                         </Link>
//                         <Link href="/account">
//                         <Image
//                             src={session.user.image}
//                             alt="User Profile"
//                             width={40}
//                             height={40}
//                             className="rounded-full"
//                         />
//                         </Link>
//                         <button
//                         onClick={handleLogout}
//                         className="bg-red-500 text-white text-base py-2 px-4 rounded"
//                         >
//                         Logout
//                         </button>
//                     </>
//                     ) : (
//                     <button
//                         onClick={handleLogin}
//                         disabled={isLoggingIn || status === "loading"}
//                         className="bg-blue-500 text-white text-base py-2 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
//                     >
//                         {isLoggingIn || status === "loading" ? "..." : "Login"}
//                     </button>
//                     )
//                 )}
//                 </div>
//             </div>
            
//             {/* Mobile Menu Button */}
//             <div className="md:hidden flex items-center">
//                 {isClient && status === "authenticated" && (
//                     <Link href="/cart" className="relative mr-4">
//                         <lord-icon
//                             src="https://cdn.lordicon.com/uisoczqi.json"
//                             trigger="hover"
//                             colors="primary:#ffffff,secondary:#ffffff"
//                             stroke="bold"
//                         ></lord-icon>
//                         {cartCount > 0 && (
//                             <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
//                                 {cartCount}
//                             </span>
//                         )}
//                     </Link>
//                 )}
//             <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
//                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
//                 </svg>
//             </button>
//             </div>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       {isMenuOpen && (
//         <div className="md:hidden bg-gray-900">
//           <div className="flex flex-col items-center gap-4 px-2 pt-2 pb-3">
//             <Link href="/" className={getLinkClass('/')} onClick={() => setIsMenuOpen(false)}>Home</Link>
//             <Link href="/buy" className={getLinkClass('/buy')} onClick={() => setIsMenuOpen(false)}>Buy</Link>
//             {isClient && status === "authenticated" && (
//                 <Link href="/sell" className={getLinkClass('/sell')} onClick={() => setIsMenuOpen(false)}>Sell</Link>
//             )}
            
//             <div className="mt-4 flex items-center gap-6">
//                  {isClient && (
//                     status === "authenticated" ? (
//                     <>
//                         <Link href="/account" onClick={() => setIsMenuOpen(false)}>
//                             <Image
//                                 src={session.user.image}
//                                 alt="User Profile"
//                                 width={40}
//                                 height={40}
//                                 className="rounded-full"
//                             />
//                         </Link>
//                         <button
//                         onClick={() => { handleLogout(); setIsMenuOpen(false); }}
//                         className="bg-red-500 text-white text-base py-2 px-4 rounded"
//                         >
//                         Logout
//                         </button>
//                     </>
//                     ) : (
//                     <button
//                         onClick={() => { handleLogin(); setIsMenuOpen(false); }}
//                         disabled={isLoggingIn || status === "loading"}
//                         className="bg-blue-500 text-white text-base py-2 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
//                     >
//                         {isLoggingIn || status === "loading" ? "..." : "Login"}
//                     </button>
//                     )
//                 )}
//             </div>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

const Navbar = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [offerCount, setOfferCount] = useState(0); // Renamed from cartCount
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Effect to fetch the count of offers needing action
  useEffect(() => {
    const fetchOfferCount = async () => {
      if (status !== "authenticated") return; // Don't fetch if not logged in
      try {
        const response = await fetch('/api/offers'); // Fetches from the new offers API
        if (response.ok) {
          const data = await response.json();
          // Count only offers that the seller has accepted and are waiting for buyer confirmation
          const pendingCount = data.filter(offer => offer.status === 'pending_buyer_confirmation').length;
          setOfferCount(pendingCount);
        } else {
          // Don't log errors for 401 Unauthorized, which happens normally on logout
          if (response.status !== 401) {
             console.error("Failed to fetch offer count:", response.statusText);
          }
        }
      } catch (error) {
        console.error("Failed to fetch offer count:", error);
      }
    };

    if (isClient && status === "authenticated") {
      fetchOfferCount(); // Fetch immediately on load
      const interval = setInterval(fetchOfferCount, 10000); // Check for new offers periodically
      return () => clearInterval(interval); // Cleanup interval on unmount
    } else {
      setOfferCount(0); // Reset count if logged out
    }
  }, [isClient, status]); // Rerun when login status changes

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const handleLogin = async () => {
    setIsLoggingIn(true);
    await signIn("google");
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };
  
  const getLinkClass = (path) => {
    return `px-3 py-2 rounded-md transition-colors text-lg ${
        pathname === path 
        ? 'bg-gray-700'
        : 'hover:bg-gray-700'
    }`;
  };

  // Close mobile menu when a link is clicked
  const handleMobileLinkClick = (path) => {
    setIsMenuOpen(false);
    // Note: We don't need to manually navigate, the <Link> component does that.
  };

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50">
      <div className="flex items-center p-4 mx-auto">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center justify-center gap-2 text-2xl">
          <lord-icon
            src="https://cdn.lordicon.com/rrbmabsx.json"
            trigger="hover"
            colors="primary:#ffffff,secondary:#ffffff"
            stroke="bold"
          ></lord-icon>
          EduMart
        </Link>

        {/* Wrapper for all right-side content */}
        <div className="ml-auto flex items-center">
            {/* Desktop Navigation Links & Icons Wrapper */}
            <div className="hidden md:flex items-center gap-8">
                <Link href="/" className={getLinkClass('/')}>Home</Link>
                <Link href="/buy" className={getLinkClass('/buy')}>Buy</Link>
                {isClient && status === "authenticated" && (
                    <Link href="/sell" className={getLinkClass('/sell')}>Sell</Link>
                )}

                {/* Vertical Divider */}
                <div className="border-l border-gray-600 h-6"></div>

                {/* Right side icons and login/logout */}
                <div className="flex items-center gap-6">
                {isClient && (
                    status === "authenticated" ? (
                    <>
                        <Link href="/offers" className="relative">
                           {/* New icon for "My Offers" */}
                           My Offers
                        {offerCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {offerCount}
                            </span>
                        )}
                        </Link>
                        <Link href="/account">
                        <Image
                            src={session.user.image}
                            alt="User Profile"
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                        </Link>
                        <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white text-base py-2 px-4 rounded"
                        >
                        Logout
                        </button>
                    </>
                    ) : (
                    <button
                        onClick={handleLogin}
                        disabled={isLoggingIn || status === "loading"}
                        className="bg-blue-500 text-white text-base py-2 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isLoggingIn || status === "loading" ? "..." : "Login"}
                    </button>
                    )
                )}
                </div>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
                {isClient && status === "authenticated" && (
                    <Link href="/offers" className="relative mr-4">
                        <lord-icon
                            src="https://cdn.lordicon.com/hlistbqa.json"
                            trigger="hover"
                            colors="primary:#ffffff,secondary:#ffffff"
                            stroke="bold"
                            style={{width: '32px', height: '32px'}}
                        ></lord-icon>
                        {offerCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {offerCount}
                            </span>
                        )}
                    </Link>
                )}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                </svg>
            </button>
            </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900">
          <div className="flex flex-col items-center gap-4 px-2 pt-2 pb-3">
            <Link href="/" className={getLinkClass('/')} onClick={() => handleMobileLinkClick('/')}>Home</Link>
            <Link href="/buy" className={getLinkClass('/buy')} onClick={() => handleMobileLinkClick('/buy')}>Buy</Link>
            {isClient && status === "authenticated" && (
                <>
                    <Link href="/sell" className={getLinkClass('/sell')} onClick={() => handleMobileLinkClick('/sell')}>Sell</Link>
                    <Link href="/offers" className={getLinkClass('/offers')} onClick={() => handleMobileLinkClick('/offers')}>My Offers</Link>
                </>
            )}
            
            <div className="mt-4 flex items-center gap-6">
                 {isClient && (
                    status === "authenticated" ? (
                    <>
                        <Link href="/account" onClick={() => handleMobileLinkClick('/account')}>
                            <Image
                                src={session.user.image}
                                alt="User Profile"
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                        </Link>
                        <button
                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                        className="bg-red-500 text-white text-base py-2 px-4 rounded"
                        >
                        Logout
                        </button>
                    </>
                    ) : (
                    <button
                        onClick={() => { handleLogin(); setIsMenuOpen(false); }}
                        disabled={isLoggingIn || status === "loading"}
                        className="bg-blue-500 text-white text-base py-2 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isLoggingIn || status === "loading" ? "..." : "Login"}
                    </button>
                    )
                )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

