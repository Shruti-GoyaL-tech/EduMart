"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define a separate component for the confirmation modal
const ConfirmationModal = ({ message, onConfirm, onCancel, confirmText, isDestructive }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
            <h3 className="text-xl font-semibold text-white mb-4">{message}</h3>
            <div className="flex justify-center gap-4 mt-6">
                <button
                    onClick={onCancel}
                    className="px-6 py-2 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-500 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    // --- THIS IS THE FIX ---
                    // The entire string must be wrapped in backticks (`)
                    // instead of double quotes (").
                    className={`px-6 py-2 rounded-md text-white font-semibold transition-colors ${
                        isDestructive 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-500'
                    }`}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
);


export default function MyOffersPage() {
    const { data: session, status } = useSession();
    const [offers, setOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // State for modals
    const [modal, setModal] = useState(null); // 'withdraw', 'confirm'
    const [selectedOffer, setSelectedOffer] = useState(null);

    const fetchOffers = async () => {
        setIsLoading(true);
        const response = await fetch('/api/offers');
        if (response.ok) {
            const data = await response.json();
            setOffers(data);
        } else {
            toast.error("Failed to fetch your offers.");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (status === "authenticated") {
            fetchOffers();
        }
    }, [status]);

    const handleWithdraw = async () => {
        if (!selectedOffer) return;
        const toastId = toast.loading("Withdrawing offer...");
        try {
            const res = await fetch('/api/offers', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offerId: selectedOffer._id })
            });
            const result = await res.json();
            if (res.ok) {
                toast.success(result.message, { id: toastId });
                fetchOffers();
            } else {
                toast.error(result.message, { id: toastId });
            }
        } catch (err) {
            toast.error("An error occurred.", { id: toastId });
        }
        setModal(null);
        setSelectedOffer(null);
    };
    
    const handleConfirmBuy = async () => {
        if (!selectedOffer) return;
        const toastId = toast.loading("Confirming purchase...");
        try {
            const res = await fetch('/api/offers/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offerId: selectedOffer._id })
            });
            const result = await res.json();
            if (res.ok) {
                toast.success(result.message, { id: toastId });
                router.push('/account'); // Redirect to account to see purchase history
            } else {
                toast.error(result.message, { id: toastId });
            }
        } catch (err) {
            toast.error("An error occurred.", { id: toastId });
        }
        setModal(null);
        setSelectedOffer(null);
    };

    // Functions to open modals
    const openWithdrawModal = (offer) => {
        setSelectedOffer(offer);
        setModal('withdraw');
    };

    const openConfirmModal = (offer) => {
        setSelectedOffer(offer);
        setModal('confirm');
    };

    const closeModal = () => {
        setModal(null);
        setSelectedOffer(null);
    };

    if (isLoading && status === "loading") return <div className="text-center text-white p-10">Loading your offers...</div>;
    if (status === "unauthenticated") return <div className="text-center text-white p-10">Please log in to see your offers.</div>;

    return (
        <>
            {/* Modals */}
            {modal === 'withdraw' && (
                <ConfirmationModal
                    message="Are you sure you want to withdraw this offer?"
                    onConfirm={handleWithdraw}
                    onCancel={closeModal}
                    confirmText="Yes, Withdraw"
                    isDestructive={true}
                />
            )}
            {modal === 'confirm' && (
                <ConfirmationModal
                    message="The seller has accepted your offer. Do you want to confirm this purchase?"
                    onConfirm={handleConfirmBuy}
                    onCancel={closeModal}
                    confirmText="Yes, Confirm"
                    isDestructive={false}
                />
            )}

            <div className="relative min-h-screen w-full bg-slate-950 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3e3e3e,transparent)]"></div>
                <div className="relative z-10 container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
                    <h1 className="text-4xl font-bold mb-8 text-center sm:text-left">My Sent Offers</h1>
                    <div className="space-y-6">
                        {offers.length > 0 ? (
                            offers.map(offer => (
                                <div key={offer._id} className="bg-slate-800/60 p-4 sm:p-6 rounded-xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <Image src={offer.product.imageUrls[0]} alt={offer.product.name} width={100} height={100} className="rounded-lg object-cover border-2 border-slate-700"/>
                                        <div>
                                            <h3 className="font-bold text-xl sm:text-2xl">{offer.product.name}</h3>
                                            <p className="text-slate-300 text-lg sm:text-xl">Your Offer: <span className="font-bold text-indigo-400">₹{offer.offerPrice}</span></p>
                                            <p className="text-slate-400 text-md">Original Price: ₹{offer.product.price}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-stretch sm:self-center w-full sm:w-auto">
                                        {offer.status === 'pending_seller' && (
                                            <>
                                                <p className="text-yellow-400 font-semibold text-center px-4 py-2 rounded-md bg-slate-700">Pending Seller</p>
                                                <button onClick={() => openWithdrawModal(offer)} className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700">Withdraw</button>
                                            </>
                                        )}
                                        {offer.status === 'pending_buyer_confirmation' && (
                                            <>
                                                <button onClick={() => openConfirmModal(offer)} className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-500 order-1 sm:order-none">Confirm & Buy</button>
                                                <button onClick={() => openWithdrawModal(offer)} className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 order-2 sm:order-none">Decline</button>
                                            </>
                                        )}
                                        {offer.status === 'declined' && (
                                            <>
                                                <p className="text-red-400 font-semibold text-center px-4 py-2 rounded-md bg-slate-700">Declined by Seller</p>
                                                {/* This button deletes the old offer and lets the user make a new one */}
                                                <button 
                                                    onClick={async () => {
                                                        // We need to set the selectedOffer before calling handleWithdraw
                                                        setSelectedOffer(offer); 
                                                        await handleWithdraw(); 
                                                        router.push('/buy'); 
                                                    }} 
                                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-500"
                                                >
                                                    Make New Offer
                                                </button>
                                            </>
                                        )}
                                        {offer.status === 'completed' && <p className="text-blue-400 font-semibold text-center px-4 py-2 rounded-md bg-slate-700">Purchased</p>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center bg-slate-800/60 p-10 rounded-xl">
                                <p className="text-xl text-slate-400">You haven&apos;t made any offers yet.</p>
                                <Link href="/buy" className="mt-4 inline-block bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-500 transition-colors">
                                    Browse the Market
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

