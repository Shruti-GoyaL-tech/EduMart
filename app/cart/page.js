"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";

// A custom modal component for a better user experience
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg shadow-xl p-8 max-w-sm w-full">
                <p className="text-xl text-white mb-6">{message}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 font-semibold">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 font-semibold">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function CartPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // State for managing button disabling
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [removingItemId, setRemovingItemId] = useState(null);

    // State for the confirmation modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchCart = async () => {
        setIsLoading(true);
        const response = await fetch('/api/cart');
        if (response.ok) {
            const data = await response.json();
            setCartItems(data.items);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (status === "authenticated") {
            fetchCart();
        }
    }, [status]);

    const handleRemoveItem = async (productId) => {
        setRemovingItemId(productId);
        const toastId = toast.loading("Removing item...");
        try {
            const response = await fetch('/api/cart', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
            });
            const result = await response.json();
            if (response.ok) {
                toast.success(result.message, { id: toastId });
                fetchCart(); // Refresh the cart
            } else {
                toast.error(result.message, { id: toastId });
            }
        } catch (error) {
            toast.error("An error occurred.", { id: toastId });
        } finally {
            setRemovingItemId(null);
        }
    };

    const handleCheckout = async () => {
        setIsModalOpen(false); // Close the modal
        setIsCheckingOut(true);
        const toastId = toast.loading("Processing your order...");

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
            });
            const result = await response.json();
            if (response.ok) {
                toast.success(result.message, { id: toastId });
                router.push('/account'); // Redirect to account page to see purchase history
            } else {
                toast.error(result.message, { id: toastId });
            }
        } catch (error) {
            toast.error("An error occurred during checkout.", { id: toastId });
        } finally {
            setIsCheckingOut(false);
        }
    };
    
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);

    if (isLoading) return <div className="text-center text-white p-10">Loading your cart...</div>;

    return (
        <>
            <ConfirmationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleCheckout}
                message="Are you sure you want to purchase all items in your cart?"
            />
            <div className="relative min-h-screen w-full bg-slate-950 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3e3e3e,transparent)]"></div>
                <div className="relative z-10 container mx-auto p-4 sm:p-6 lg:p-8">
                    <h1 className="text-4xl font-bold mb-8">Your Shopping Cart</h1>
                    {cartItems.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            <div className="lg:col-span-2 space-y-4">
                                {cartItems.map(item => (
                                    <div key={item._id} className="flex justify-between items-center bg-slate-800/60 p-4 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <Image src={item.imageUrls[0]} alt={item.name} width={80} height={80} className="rounded-md object-cover"/>
                                            <div>
                                                <h2 className="text-xl font-semibold">{item.name}</h2>
                                                <p className="text-indigo-400">₹{item.price}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveItem(item._id)}
                                            disabled={removingItemId === item._id}
                                            className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                        >
                                            {removingItemId === item._id ? "..." : "Remove"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="lg:col-span-1 bg-slate-800/60 p-6 rounded-lg">
                                <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                                <div className="flex justify-between text-lg">
                                    <span>Total Price:</span>
                                    <span className="font-semibold">₹{total}</span>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(true)}
                                    disabled={isCheckingOut}
                                    className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-md text-lg font-semibold hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                >
                                    {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-400 text-xl">Your cart is empty.</p>
                    )}
                </div>
            </div>
        </>
    );
}

