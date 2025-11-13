"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Modal Component for Making an Offer
const OfferModal = ({ product, onClose, onSubmit, isSubmitting }) => {
    const [price, setPrice] = useState(product.price);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(price);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl p-8 max-w-sm w-full">
                <h3 className="text-xl font-semibold text-white mb-4">Make an Offer for</h3>
                <p className="text-lg text-slate-300 mb-2 truncate">{product.name}</p>
                <p className="text-md text-slate-400 mb-4">Listing Price: ₹{product.price}</p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="offerPrice" className="block text-sm font-medium text-slate-300">Your Offer (₹)</label>
                    <input
                        type="number"
                        id="offerPrice"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="mt-1 block w-full rounded-md border-slate-600 bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-3 text-lg"
                        required
                    />
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-500">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-500 disabled:bg-slate-500">
                            {isSubmitting ? "Submitting..." : "Submit Offer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Product Card Component
const ProductCard = ({ product, onMakeOffer, isMakingOffer, userOffers }) => {
    const [currentImage, setCurrentImage] = useState(0);
    
    // --- THIS IS THE FIX ---
    // Check if the user has an ACTIVE offer on this item (pending or accepted)
    const activeOffer = userOffers.find(offer => 
        offer.productId === product._id && 
        (offer.status === 'pending_seller' || offer.status === 'pending_buyer_confirmation')
    );

    return (
        <div className="bg-slate-800/60 rounded-xl shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 flex flex-col">
            <div className="relative w-full h-56">
                 <Image src={product.imageUrls[currentImage]} alt={product.name} layout="fill" objectFit="cover" />
                {product.imageUrls.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {product.imageUrls.map((_, index) => (
                            <button key={index} onClick={() => setCurrentImage(index)} className={`w-2 h-2 rounded-full ${currentImage === index ? 'bg-white' : 'bg-white/50'}`} />
                        ))}
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-bold truncate">{product.name}</h3>
                <p className="text-slate-400 mt-1 h-12 overflow-hidden text-ellipsis flex-grow">{product.description}</p>
                <div className="flex justify-between items-center mt-4">
                    <p className="text-2xl font-semibold text-indigo-400">₹{product.price}</p>
                    {/* If there's an active offer, show "View Offer" */}
                    {activeOffer ? (
                        <Link href="/offers" className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-500 text-center text-sm">
                            View Offer
                        </Link>
                    ) : (
                        // Otherwise (no offer, or a declined offer), show "Make Offer"
                        <button 
                            onClick={() => onMakeOffer(product)}
                            disabled={isMakingOffer}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-500 transition-colors disabled:bg-slate-500 text-sm"
                        >
                            {isMakingOffer ? '...' : 'Make Offer'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main Buy Page Component
export default function BuyPage() {
    const { status } = useSession();
    const [products, setProducts] = useState([]);
    const [userOffers, setUserOffers] = useState([]); // To track user's existing offers
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null); // For the modal

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const fetchMarketData = async () => {
        setIsLoading(true);
        try {
            const [productsRes, offersRes] = await Promise.all([
                fetch('/api/market'),
                status === "authenticated" ? fetch('/api/offers') : Promise.resolve(null)
            ]);

            if (productsRes.ok) setProducts(await productsRes.json());
            if (offersRes && offersRes.ok) setUserOffers(await offersRes.json());

        } catch (error) {
            toast.error("An error occurred while fetching data.");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchMarketData();
    }, [status]);

    const handleMakeOffer = (product) => {
        if (status !== "authenticated") {
            toast.error("Please log in to make an offer.");
            return;
        }
        setSelectedProduct(product);
    };

    const handleSubmitOffer = async (offerPrice) => {
        setIsSubmitting(true);
        const toastId = toast.loading("Submitting offer...");
        try {
            const response = await fetch('/api/offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: selectedProduct._id,
                    sellerEmail: selectedProduct.sellerEmail,
                    offerPrice: offerPrice
                }),
            });
            const result = await response.json();
            if (response.ok) {
                toast.success(result.message, { id: toastId });
                fetchMarketData(); // Refresh data to show "View Offer"
            } else {
                toast.error(result.message, { id: toastId });
            }
        } catch (error) {
            toast.error("An error occurred.", { id: toastId });
        }
        setIsSubmitting(false);
        setSelectedProduct(null);
    };

    const filteredProducts = useMemo(() => {
        return products
            .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(product => maxPrice === "" || product.price <= parseFloat(maxPrice));
    }, [products, searchTerm, maxPrice]);

    return (
        <>
            {selectedProduct && (
                <OfferModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onSubmit={handleSubmitOffer}
                    isSubmitting={isSubmitting}
                />
            )}
            <div className="relative min-h-screen w-full bg-slate-950 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3e3e3e,transparent)]"></div>
                <div className="relative z-10 container mx-auto p-4 sm:p-6 lg:p-8">
                    <header className="text-center mb-12">
                        <h1 className="text-5xl font-extrabold">Marketplace</h1>
                        <p className="text-slate-400 text-lg mt-2">Browse and buy items from fellow students</p>
                    </header>

                    {/* Search and Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-slate-800/60 rounded-xl">
                        <input type="text" placeholder="Search for an item..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-grow rounded-md border-slate-600 bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-3 text-lg" />
                        <input type="number" placeholder="Max Price (₹)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full sm:w-48 rounded-md border-slate-600 bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-3 text-lg" />
                    </div>

                    {/* Products Grid */}
                    {isLoading ? (
                        <div className="text-center text-slate-400">Loading products...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <ProductCard 
                                        key={product._id} 
                                        product={product} 
                                        onMakeOffer={handleMakeOffer}
                                        isMakingOffer={isSubmitting && selectedProduct?._id === product._id}
                                        userOffers={userOffers}
                                    />
                                ))
                            ) : (
                                <p className="col-span-full text-center text-slate-400 text-xl">No products found.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

