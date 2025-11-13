// "use client";

// import { useSession } from "next-auth/react";
// import { useState, useEffect } from "react";
// import Image from "next/image";
// import toast from "react-hot-toast";

// const InfoCard = ({ title, items, userType }) => (
//     <div className="bg-slate-800/60 p-6 rounded-xl">
//         <h2 className="text-3xl font-bold mb-4">{title}</h2>
//         {items.length > 0 ? (
//             <div className="space-y-4">
//                 {items.map(item => (
//                     <div key={item._id} className="p-4 bg-slate-900 rounded-lg">
//                         <div className="flex justify-between items-start">
//                              <div>
//                                 <p className="font-bold text-xl">{item.name}</p>
//                                 <p className="text-lg text-indigo-400">₹{item.price}</p>
//                              </div>
//                              {userType === 'seller' && item.sellerInfo && (
//                                 <div className="text-right">
//                                     <p className="font-semibold">{item.sellerInfo.name}</p>
//                                     <p className="text-sm text-slate-400">{item.sellerInfo.email}</p>
//                                     <p className="text-sm text-slate-400">{item.sellerInfo.contactNumber}</p>
//                                 </div>
//                              )}
//                              {userType === 'buyer' && item.buyerInfo && (
//                                 <div className="text-right">
//                                     <p className="font-semibold">{item.buyerInfo.name}</p>
//                                     <p className="text-sm text-slate-400">{item.buyerInfo.email}</p>
//                                     <p className="text-sm text-slate-400">{item.buyerInfo.contactNumber}</p>
//                                 </div>
//                              )}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         ) : (
//             <p className="text-slate-400">No items to show.</p>
//         )}
//     </div>
// );


// export default function AccountPage() {
//     const { data: session, status } = useSession();
//     const [contactNumber, setContactNumber] = useState("");
//     const [history, setHistory] = useState({ bought: [], sold: [] });
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         const fetchData = async () => {
//             if (session) {
//                 setIsLoading(true);
//                 const [profileRes, historyRes] = await Promise.all([
//                     fetch('/api/profile'),
//                     fetch('/api/history')
//                 ]);

//                 if (profileRes.ok) {
//                     const data = await profileRes.json();
//                     setContactNumber(data.contactNumber || "");
//                 }
//                 if (historyRes.ok) {
//                     const data = await historyRes.json();
//                     setHistory(data);
//                 }
//                 setIsLoading(false);
//             }
//         };
//         fetchData();
//     }, [session]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const toastId = toast.loading('Updating profile...');
//         try {
//             const response = await fetch('/api/profile', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ contactNumber }),
//             });
//             const result = await response.json();
//             if (response.ok) {
//                 toast.success(result.message, { id: toastId });
//             } else {
//                 toast.error(result.message, { id: toastId });
//             }
//         } catch (error) {
//             toast.error("An error occurred.", { id: toastId });
//         }
//     };

//     if (status === "loading" || isLoading) return <div className="text-center text-white p-10">Loading account...</div>;
//     if (status === "unauthenticated") return <div className="text-center text-white p-10">Please log in to view your account.</div>;

//     return (
//         <div className="relative min-h-screen w-full bg-slate-950 text-white">
//             <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3e3e3e,transparent)]"></div>
//             <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-12">
//                 <div className="text-center">
//                     <Image src={session.user.image} width={120} height={120} alt="Profile" className="rounded-full mx-auto mb-4 border-4 border-slate-700" />
//                     <h1 className="text-4xl font-bold">{session.user.name}</h1>
//                     <p className="text-lg text-slate-400">{session.user.email}</p>
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//                     <form onSubmit={handleSubmit} className="md:col-span-1 space-y-6 bg-slate-800/60 p-8 rounded-xl shadow-2xl h-fit">
//                         <h2 className="text-3xl font-bold">Your Details</h2>
//                         <div>
//                             <label htmlFor="contact" className="block text-lg font-medium text-slate-300">Contact Number</label>
//                             <input type="tel" id="contact" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="e.g., 9876543210" className="mt-2 block w-full rounded-md border-slate-600 bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-3 text-lg" required />
//                         </div>
//                         <button type="submit" className="w-full rounded-md bg-indigo-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500">
//                             Save Changes
//                         </button>
//                     </form>

//                     <div className="md:col-span-2 space-y-8">
//                         <InfoCard title="Items You've Bought" items={history.bought} userType="seller" />
//                         <InfoCard title="Items You've Sold" items={history.sold} userType="buyer" />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function AccountPage() {
  const { data: session, status } = useSession();
  
  // State for the profile form
  const [contactNumber, setContactNumber] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  
  // State for history
  const [history, setHistory] = useState({ bought: [], sold: [] });
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // Fetch the user's current profile data (contact number)
  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
        setIsProfileLoading(true);
        try {
            const response = await fetch('/api/profile');
            if (response.ok) {
                const data = await response.json();
                setContactNumber(data.contactNumber || "");
            }
        } catch (error) {
            toast.error("Failed to fetch profile.");
        }
        setIsProfileLoading(false);
      }
    };
    fetchProfile();
  }, [session]);

  // Fetch the user's transaction history (bought and sold)
  useEffect(() => {
    const fetchHistory = async () => {
      if (session) {
        setIsHistoryLoading(true);
        try {
            const response = await fetch('/api/history');
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            } else {
                toast.error("Failed to fetch transaction history.");
            }
        } catch (error) {
            toast.error("An error occurred while fetching history.");
        }
        setIsHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [session]);

  // Handle the profile update submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Updating profile...');
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactNumber }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message || 'Profile updated!', { id: toastId });
      } else {
        toast.error(result.message || 'Failed to update.', { id: toastId });
      }
    } catch (error) {
      toast.error('An unexpected error occurred.', { id: toastId });
    }
  };

  if (status === "loading" || (session && (isProfileLoading || isHistoryLoading))) {
    return <div className="text-center text-white p-10">Loading account...</div>;
  }

  if (status === "unauthenticated") {
    return <div className="text-center text-white p-10">Please log in to view your account.</div>;
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3e3e3e,transparent)]"></div>
      <div className="relative z-10 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Profile Section */}
        <div className="text-center mb-8">
          {session.user.image && (
            <Image 
              src={session.user.image} 
              width={120} 
              height={120} 
              alt="Profile" 
              className="rounded-full mx-auto mb-4 border-4 border-slate-700" 
            />
          )}
          <h1 className="text-4xl font-bold">{session.user.name}</h1>
          <p className="text-lg text-slate-400">{session.user.email}</p>
        </div>
        
        {/* Edit Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/60 p-8 rounded-xl shadow-2xl mb-12">
          <div>
            <label htmlFor="contact" className="block text-lg font-medium text-slate-300">
              Contact Number
            </label>
            <input
              type="tel"
              id="contact"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="e.g., 9876543210"
              className="mt-2 block w-full rounded-md border-slate-600 bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-3 text-lg"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 transition-transform transform hover:scale-105"
          >
            Save Changes
          </button>
        </form>

        {/* Transaction History Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Items Bought */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Items You&apos;ve Bought</h2>
            <div className="space-y-6">
              {history.bought.length > 0 ? (
                history.bought.map(item => (
                  <div key={item._id} className="bg-slate-800/60 p-6 rounded-xl shadow-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <Image src={item.productImage} alt={item.productName} width={80} height={80} className="rounded-lg border-2 border-slate-700" />
                      <div>
                        <h3 className="text-2xl font-semibold">{item.productName}</h3>
                        <p className="text-xl text-indigo-400">Paid: ₹{item.finalPrice}</p>
                      </div>
                    </div>
                    <div className="border-t border-slate-700 pt-4">
                      <h4 className="text-lg font-semibold text-slate-300">Seller Details:</h4>
                      <p className="text-slate-400">Name: {item.sellerName}</p>
                      <p className="text-slate-400">Email: {item.sellerEmail}</p>
                      <p className="text-slate-400">Phone: {item.sellerContact || "Not provided"}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">You haven&apos;t bought any items yet.</p>
              )}
            </div>
          </div>

          {/* Items Sold */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Items You&apos;ve Sold</h2>
            <div className="space-y-6">
              {history.sold.length > 0 ? (
                history.sold.map(item => (
                  <div key={item._id} className="bg-slate-800/60 p-6 rounded-xl shadow-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <Image src={item.productImage} alt={item.productName} width={80} height={80} className="rounded-lg border-2 border-slate-700" />
                      <div>
                        <h3 className="text-2xl font-semibold">{item.productName}</h3>
                        <p className="text-xl text-green-400">Sold for: ₹{item.finalPrice}</p>
                      </div>
                    </div>
                    <div className="border-t border-slate-700 pt-4">
                      <h4 className="text-lg font-semibold text-slate-300">Buyer Details:</h4>
                      <p className="text-slate-400">Name: {item.buyerName}</p>
                      <p className="text-slate-400">Email: {item.buyerEmail}</p>
                      <p className="text-slate-400">Phone: {item.buyerContact || "Not provided"}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">You haven&apos;t sold any items yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

