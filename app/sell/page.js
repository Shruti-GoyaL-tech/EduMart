
// "use client";

// import { useSession } from "next-auth/react";
// import { useState, useEffect } from "react";
// import toast from "react-hot-toast";
// import Image from "next/image";

// // A modal for confirming deletions
// const ConfirmationModal = ({ onConfirm, onCancel, message }) => (
//     <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
//         <div className="bg-slate-800 rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
//             <h3 className="text-xl font-semibold text-white mb-4">{message}</h3>
//             <div className="flex justify-center gap-4 mt-6">
//                 <button
//                     onClick={onCancel}
//                     className="px-6 py-2 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-500 transition-colors"
//                 >
//                     Cancel
//                 </button>
//                 <button
//                     onClick={onConfirm}
//                     className="px-6 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
//                 >
//                     Yes, Delete
//                 </button>
//             </div>
//         </div>
//     </div>
// );


// export default function SellPage() {
//     const { data: session, status } = useSession();
//     const [products, setProducts] = useState([]);
//     const [offers, setOffers] = useState([]); // New state for received offers
//     const [isLoading, setIsLoading] = useState(true);
//     const [isSubmitting, setIsSubmitting] = useState(false);
    
//     const [editingProduct, setEditingProduct] = useState(null);
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//     const [productToDelete, setProductToDelete] = useState(null);

//     // Form state
//     const [name, setName] = useState("");
//     const [description, setDescription] = useState("");
//     const [price, setPrice] = useState("");
//     const [images, setImages] = useState([]);
//     const [imagePreviews, setImagePreviews] = useState([]);
//     const [imagesToRemove, setImagesToRemove] = useState([]);

//     // Fetches both products and received offers
//     const fetchData = async () => {
//         if (status !== "authenticated") return;
//         setIsLoading(true);
//         try {
//             const [productsRes, offersRes] = await Promise.all([
//                 fetch('/api/products'),
//                 fetch('/api/offers/received')
//             ]);

//             if (productsRes.ok) {
//                 setProducts(await productsRes.json());
//             } else {
//                 toast.error("Failed to fetch your products.");
//             }
            
//             if (offersRes.ok) {
//                 setOffers(await offersRes.json());
//             } else {
//                 toast.error("Failed to fetch received offers.");
//             }
//         } catch (error) {
//             toast.error("An error occurred while fetching data.");
//         }
//         setIsLoading(false);
//     };

//     useEffect(() => {
//         fetchData();
//     }, [status]);

//     const handleNewImageChange = (e) => {
//         const files = Array.from(e.target.files);
//         const newFiles = [...images, ...files];
//         setImages(newFiles);
//         const newPreviews = newFiles.map(file => URL.createObjectURL(file));
//         const existingPreviews = editingProduct ? editingProduct.imageUrls.filter(url => !imagesToRemove.includes(url)) : [];
//         setImagePreviews([...existingPreviews, ...newPreviews]);
//     };

//     const handleRemoveExistingImage = (urlToRemove) => {
//         setImagesToRemove([...imagesToRemove, urlToRemove]);
//         setImagePreviews(imagePreviews.filter(preview => preview !== urlToRemove));
//     };
    
//     const resetForm = () => {
//         setName("");
//         setDescription("");
//         setPrice("");
//         setImages([]);
//         setImagePreviews([]);
//         setImagesToRemove([]);
//         setEditingProduct(null);
//         const fileInput = document.getElementById('images');
//         if (fileInput) fileInput.value = "";
//     };

//     const handleEditClick = (product) => {
//         setEditingProduct(product);
//         setName(product.name);
//         setDescription(product.description);
//         setPrice(product.price);
//         setImagePreviews(product.imageUrls);
//         setImages([]);
//         setImagesToRemove([]);
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         if (!editingProduct && images.length === 0) {
//             toast.error("Please upload at least one image.");
//             return;
//         }

//         setIsSubmitting(true);
//         const toastId = toast.loading(editingProduct ? "Updating item..." : "Listing your item...");
//         const formData = new FormData();
//         formData.append("name", name);
//         formData.append("description", description);
//         formData.append("price", price);

//         if (editingProduct) {
//             formData.append("imagesToRemove", JSON.stringify(imagesToRemove));
//             images.forEach(image => formData.append("newImages", image));
//             try {
//                 const response = await fetch(`/api/products/${editingProduct._id}`, { method: 'PUT', body: formData });
//                 const result = await response.json();
//                 if (response.ok) {
//                     toast.success("Item updated successfully!", { id: toastId });
//                     resetForm();
//                     fetchData();
//                 } else {
//                     toast.error(result.message || "Failed to update item.", { id: toastId });
//                 }
//             } catch (error) { toast.error("An error occurred.", { id: toastId }); }
//         } else {
//             images.forEach(image => formData.append("images", image));
//             try {
//                 const response = await fetch('/api/products', { method: 'POST', body: formData });
//                 const result = await response.json();
//                 if (response.ok) {
//                     toast.success("Item listed successfully!", { id: toastId });
//                     resetForm();
//                     fetchData();
//                 } else {
//                     toast.error(result.message || "Failed to list item.", { id: toastId });
//                 }
//             } catch (error) { toast.error("An error occurred.", { id: toastId }); }
//         }
//         setIsSubmitting(false);
//     };

//     const handleDeleteClick = (productId) => {
//         setProductToDelete(productId);
//         setShowDeleteConfirm(true);
//     };
    
//     const confirmDelete = async () => {
//         if (!productToDelete) return;
//         setShowDeleteConfirm(false);
//         const toastId = toast.loading("Deleting item...");
//         try {
//              const response = await fetch(`/api/products/${productToDelete}`, { method: 'DELETE' });
//              const result = await response.json();
//             if(response.ok) {
//                 toast.success("Item deleted!", { id: toastId });
//                 fetchData();
//             } else {
//                 toast.error(result.message || "Failed to delete.", { id: toastId });
//             }
//         } catch (error) {
//              toast.error("An error occurred.", { id: toastId });
//         }
//         setProductToDelete(null);
//     };

//     // New function to handle seller accepting/rejecting an offer
//     const handleOfferAction = async (offerId, action) => {
//         const toastId = toast.loading(`${action === 'accept' ? 'Accepting' : 'Rejecting'} offer...`);
//         try {
//             const res = await fetch('/api/offers/manage', {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ offerId, action })
//             });
//             const result = await res.json();
//             if(res.ok) {
//                 toast.success(result.message, { id: toastId });
//                 fetchData(); // Refresh all data to show new offer status
//             } else {
//                 toast.error(result.message, { id: toastId });
//             }
//         } catch (err) {
//             toast.error("An error occurred.", { id: toastId });
//         }
//     };

//     if (status === "loading") return <div className="text-center text-white p-10">Loading...</div>;
//     if (status === "unauthenticated") return <div className="text-center text-white p-10">Please log in to sell items.</div>;

//     return (
//         <>
//             {showDeleteConfirm && (
//                 <ConfirmationModal 
//                     message="Are you sure you want to delete this listing?"
//                     onConfirm={confirmDelete}
//                     onCancel={() => setShowDeleteConfirm(false)}
//                 />
//             )}
//             <div className="relative min-h-screen w-full bg-slate-950 text-white">
//                 <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3e3e3e,transparent)]"></div>
//                 <div className="relative z-10 container mx-auto p-4 sm:p-6 lg:p-8">
//                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
//                         <div className="lg:col-span-1">
//                             <h1 className="text-4xl font-bold mb-6">{editingProduct ? "Edit Your Item" : "List a New Item"}</h1>
//                             <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/60 p-8 rounded-xl shadow-2xl">
//                                 {/* Form content remains the same... */}
//                                 <div>
//                                     <label htmlFor="name" className="block text-lg font-medium text-slate-300">Product Name</label>
//                                     <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-2 block w-full rounded-md border-slate-600 bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-3 text-lg" required />
//                                 </div>
//                                 <div>
//                                     <label htmlFor="description" className="block text-lg font-medium text-slate-300">Description</label>
//                                     <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="mt-2 block w-full rounded-md border-slate-600 bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-3 text-lg" rows="4"></textarea>
//                                 </div>
//                                 <div>
//                                     <label htmlFor="price" className="block text-lg font-medium text-slate-300">Price (₹)</label>
//                                     <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} className="mt-2 block w-full rounded-md border-slate-600 bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-3 text-lg" required />
//                                 </div>
//                                 <div>
//                                     <label htmlFor="images" className="block text-lg font-medium text-slate-300">{editingProduct ? "Add More Images" : "Product Images"}</label>
//                                     <input type="file" id="images" onChange={handleNewImageChange} className="mt-2 block w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" multiple accept="image/*" required={!editingProduct && images.length === 0} />
//                                 </div>
//                                 {imagePreviews.length > 0 && (
//                                     <div className="grid grid-cols-3 gap-2">
//                                         {imagePreviews.map((src, index) => (
//                                             <div key={index} className="relative group">
//                                                 <Image src={src} alt={`Preview ${index+1}`} width={100} height={100} className="rounded-md object-cover w-full h-24"/>
//                                                 {editingProduct && src.startsWith('http') && (
//                                                     <button type="button" onClick={() => handleRemoveExistingImage(src)} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1 leading-none opacity-0 group-hover:opacity-100 transition-opacity">
//                                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
//                                                     </button>
//                                                 )}
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                                 <div className="flex flex-col sm:flex-row gap-4">
//                                     <button type="submit" disabled={isSubmitting} className="w-full rounded-md bg-indigo-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 transition-transform transform hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:transform-none">
//                                         {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Item' : 'List Item')}
//                                     </button>
//                                     {editingProduct && (
//                                         <button type="button" onClick={resetForm} className="w-full rounded-md bg-gray-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-gray-500">
//                                             Cancel Edit
//                                         </button>
//                                     )}
//                                 </div>
//                             </form>
//                         </div>

//                         {/* --- THIS IS THE UPDATED SECTION --- */}
//                         <div className="lg:col-span-2">
//                              <h2 className="text-4xl font-bold mb-6">Your Listings</h2>
//                              {isLoading ? (
//                                  <div className="text-center text-slate-400">Loading...</div>
//                              ) : products.length > 0 ? (
//                                 <div className="space-y-8">
//                                     {products.map(product => {
//                                         // Find offers for this specific product
//                                         const productOffers = offers.filter(o => o.productId === product._id);
//                                         return (
//                                             <div key={product._id} className="bg-slate-800/60 rounded-xl shadow-2xl">
//                                                 {/* Product Info */}
//                                                 <div className="flex flex-col sm:flex-row p-6 items-start sm:items-center justify-between gap-4">
//                                                     <div className="flex items-center gap-6">
//                                                         <Image src={product.imageUrls[0]} alt={product.name} width={100} height={100} className="rounded-lg object-cover border-2 border-slate-700"/>
//                                                         <div>
//                                                             <h3 className="font-bold text-2xl">{product.name}</h3>
//                                                             <p className="text-slate-300 text-xl">₹{product.price}</p>
//                                                             <p className={`mt-1 text-md font-semibold ${product.status === 'available' ? 'text-green-400' : 'text-yellow-400'}`}>
//                                                                 {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
//                                                             </p>
//                                                         </div>
//                                                     </div>
//                                                     <div className="flex gap-3 self-end sm:self-center">
//                                                         <button onClick={() => handleEditClick(product)} className="bg-yellow-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-yellow-600 transition-colors">Edit</button>
//                                                         <button onClick={() => handleDeleteClick(product._id)} className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors">Delete</button>
//                                                     </div>
//                                                 </div>

//                                                 {/* Offers Section for this product */}
//                                                 {productOffers.length > 0 && product.status === 'available' && (
//                                                     <div className="bg-slate-900/50 p-4 rounded-b-xl border-t border-slate-700">
//                                                         <h4 className="text-lg font-semibold mb-3">Offers Received</h4>
//                                                         <div className="space-y-3">
//                                                             {productOffers.map(offer => (
//                                                                 <div key={offer._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-800 p-3 rounded-lg">
//                                                                     <div>
//                                                                         <p className="text-white">Offer: <span className="font-bold text-indigo-400">₹{offer.offerPrice}</span></p>
//                                                                         <p className="text-sm text-slate-400">from {offer.buyerEmail}</p>
//                                                                     </div>
//                                                                     {offer.status === 'pending_seller' && (
//                                                                         <div className="flex gap-2 mt-2 sm:mt-0">
//                                                                             <button onClick={() => handleOfferAction(offer._id, 'accept')} className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-semibold">Accept</button>
//                                                                             <button onClick={() => handleOfferAction(offer._id, 'reject')} className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-semibold">Reject</button>
//                                                                         </div>
//                                                                     )}
//                                                                     {offer.status === 'pending_buyer_confirmation' && <p className="text-yellow-400 font-semibold">Waiting for Buyer</p>}
//                                                                     {offer.status === 'declined' && <p className="text-red-500 font-semibold">Declined</p>}
//                                                                 </div>
//                                                             ))}
//                                                         </div>
//                                                     </div>
//                                                 )}
                                                
//                                                 {product.status === 'sold' && (
//                                                     <div className="bg-blue-900/50 p-4 rounded-b-xl border-t border-slate-700">
//                                                          <p className="text-blue-300 font-semibold text-center">This item has been sold.</p>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                              ) : (
//                                  <div className="text-center bg-slate-800/60 p-10 rounded-xl">
//                                     <p className="text-xl text-slate-400">You haven't listed any items yet.</p>
//                                  </div>
//                              )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// }

"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

// A modal for confirming deletions
const ConfirmationModal = ({ onConfirm, onCancel, message }) => (
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
                    className="px-6 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                >
                    Yes, Delete
                </button>
            </div>
        </div>
    </div>
);


export default function SellPage() {
    const { data: session, status } = useSession();
    const [products, setProducts] = useState([]);
    const [offers, setOffers] = useState([]); // New state for received offers
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [editingProduct, setEditingProduct] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [imagesToRemove, setImagesToRemove] = useState([]);

    // Fetches both products and received offers
    const fetchData = async () => {
        if (status !== "authenticated") return;
        setIsLoading(true);
        try {
            const [productsRes, offersRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/offers/received')
            ]);

            if (productsRes.ok) {
                setProducts(await productsRes.json());
            } else {
                toast.error("Failed to fetch your products.");
            }
            
            if (offersRes.ok) {
                setOffers(await offersRes.json());
            } else {
                toast.error("Failed to fetch received offers.");
            }
        } catch (error) {
            toast.error("An error occurred while fetching data.");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [status]);

    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newFiles = [...images, ...files];
        setImages(newFiles);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        const existingPreviews = editingProduct ? editingProduct.imageUrls.filter(url => !imagesToRemove.includes(url)) : [];
        setImagePreviews([...existingPreviews, ...newPreviews]);
    };

    const handleRemoveExistingImage = (urlToRemove) => {
        setImagesToRemove([...imagesToRemove, urlToRemove]);
        setImagePreviews(imagePreviews.filter(preview => preview !== urlToRemove));
    };
    
    const resetForm = () => {
        setName("");
        setDescription("");
        setPrice("");
        setImages([]);
        setImagePreviews([]);
        setImagesToRemove([]);
        setEditingProduct(null);
        const fileInput = document.getElementById('images');
        if (fileInput) fileInput.value = "";
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setImagePreviews(product.imageUrls);
        setImages([]);
        setImagesToRemove([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!editingProduct && images.length === 0) {
            toast.error("Please upload at least one image.");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading(editingProduct ? "Updating item..." : "Listing your item...");
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);

        if (editingProduct) {
            formData.append("imagesToRemove", JSON.stringify(imagesToRemove));
            images.forEach(image => formData.append("newImages", image));
            try {
                const response = await fetch(`/api/products/${editingProduct._id}`, { method: 'PUT', body: formData });
                const result = await response.json();
                if (response.ok) {
                    toast.success("Item updated successfully!", { id: toastId });
                    resetForm();
                    fetchData();
                } else {
                    toast.error(result.message || "Failed to update item.", { id: toastId });
                }
            } catch (error) { toast.error("An error occurred.", { id: toastId }); }
        } else {
            images.forEach(image => formData.append("images", image));
            try {
                const response = await fetch('/api/products', { method: 'POST', body: formData });
                const result = await response.json();
                if (response.ok) {
                    toast.success("Item listed successfully!", { id: toastId });
                    resetForm();
                    fetchData();
                } else {
                    toast.error(result.message || "Failed to list item.", { id: toastId });
                }
            } catch (error) { toast.error("An error occurred.", { id: toastId }); }
        }
        setIsSubmitting(false);
    };

    const handleDeleteClick = (productId) => {
        setProductToDelete(productId);
        setShowDeleteConfirm(true);
    };
    
    const confirmDelete = async () => {
        if (!productToDelete) return;
        setShowDeleteConfirm(false);
        const toastId = toast.loading("Deleting item...");
        try {
             const response = await fetch(`/api/products/${productToDelete}`, { method: 'DELETE' });
             const result = await response.json();
            if(response.ok) {
                toast.success("Item deleted!", { id: toastId });
                fetchData();
            } else {
                toast.error(result.message || "Failed to delete.", { id: toastId });
            }
        } catch (error) {
             toast.error("An error occurred.", { id: toastId });
        }
        setProductToDelete(null);
    };

    // New function to handle seller accepting/rejecting an offer
    const handleOfferAction = async (offerId, action) => {
        const toastId = toast.loading(`${action === 'accept' ? 'Accepting' : 'Rejecting'} offer...`);
        try {
            const res = await fetch('/api/offers/manage', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offerId, action })
            });
            const result = await res.json();
            if(res.ok) {
                toast.success(result.message, { id: toastId });
                fetchData(); // Refresh all data to show new offer status
            } else {
                toast.error(result.message, { id: toastId });
            }
        } catch (err) {
            toast.error("An error occurred.", { id: toastId });
        }
    };

    if (status === "loading") return <div className="text-center text-white p-10">Loading...</div>;
    if (status === "unauthenticated") return <div className="text-center text-white p-10">Please log in to sell items.</div>;

    return (
        <>
            {showDeleteConfirm && (
                <ConfirmationModal 
                    message="Are you sure you want to delete this listing?"
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}
            <div className="relative min-h-screen w-full bg-slate-950 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3e3e3e,transparent)]"></div>
                <div className="relative z-10 container mx-auto p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-1">
                            <h1 className="text-4xl font-bold mb-6">{editingProduct ? "Edit Your Item" : "List a New Item"}</h1>
                            <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/60 p-8 rounded-xl shadow-2xl">
                                {/* Form content remains the same... */}
                                <div>
                                    <label htmlFor="name" className="block text-lg font-medium text-slate-300">Product Name</label>
                                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-2 block w-full rounded-md border-slate-600 bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-3 text-lg" required />
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-lg font-medium text-slate-300">Description</label>
                                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="mt-2 block w-full rounded-md border-slate-600 bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-3 text-lg" rows="4"></textarea>
                                </div>
                                <div>
                                    <label htmlFor="price" className="block text-lg font-medium text-slate-300">Price (₹)</label>
                                    <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} className="mt-2 block w-full rounded-md border-slate-600 bg-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white p-3 text-lg" required />
                                </div>
                                <div>
                                    <label htmlFor="images" className="block text-lg font-medium text-slate-300">{editingProduct ? "Add More Images" : "Product Images"}</label>
                                    <input type="file" id="images" onChange={handleNewImageChange} className="mt-2 block w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" multiple accept="image/*" required={!editingProduct && images.length === 0} />
                                </div>
                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {imagePreviews.map((src, index) => (
                                            <div key={index} className="relative group">
                                                <Image src={src} alt={`Preview ${index+1}`} width={100} height={100} className="rounded-md object-cover w-full h-24"/>
                                                {editingProduct && src.startsWith('http') && (
                                                    <button type="button" onClick={() => handleRemoveExistingImage(src)} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1 leading-none opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button type="submit" disabled={isSubmitting} className="w-full rounded-md bg-indigo-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 transition-transform transform hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:transform-none">
                                        {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Item' : 'List Item')}
                                    </button>
                                    {editingProduct && (
                                        <button type="button" onClick={resetForm} className="w-full rounded-md bg-gray-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-gray-500">
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* --- THIS IS THE UPDATED SECTION --- */}
                        <div className="lg:col-span-2">
                             <h2 className="text-4xl font-bold mb-6">Your Listings</h2>
                             {isLoading ? (
                                 <div className="text-center text-slate-400">Loading...</div>
                             ) : products.length > 0 ? (
                                <div className="space-y-8">
                                    {products.map(product => {
                                        // Find offers for this specific product
                                        const productOffers = offers.filter(o => o.productId === product._id);
                                        return (
                                            <div key={product._id} className="bg-slate-800/60 rounded-xl shadow-2xl">
                                                {/* Product Info */}
                                                <div className="flex flex-col sm:flex-row p-6 items-start sm:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-6">
                                                        <Image src={product.imageUrls[0]} alt={product.name} width={100} height={100} className="rounded-lg object-cover border-2 border-slate-700"/>
                                                        <div>
                                                            <h3 className="font-bold text-2xl">{product.name}</h3>
                                                            <p className="text-slate-300 text-xl">₹{product.price}</p>
                                                            <p className={`mt-1 text-md font-semibold ${product.status === 'available' ? 'text-green-400' : 'text-blue-400'}`}>
                                                                {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 self-end sm:self-center">
                                                        {/* --- THIS IS THE FIX --- */}
                                                        {/* Only show Edit/Delete if the item is 'available' */}
                                                        {product.status === 'available' ? (
                                                            <>
                                                                <button onClick={() => handleEditClick(product)} className="bg-yellow-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-yellow-600 transition-colors">Edit</button>
                                                                <button onClick={() => handleDeleteClick(product._id)} className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors">Delete</button>
                                                            </>
                                                        ) : (
                                                            <p className="text-blue-400 font-semibold px-4 py-2">Sold</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Offers Section for this product */}
                                                {productOffers.length > 0 && product.status === 'available' && (
                                                    <div className="bg-slate-900/50 p-4 rounded-b-xl border-t border-slate-700">
                                                        <h4 className="text-lg font-semibold mb-3">Offers Received</h4>
                                                        <div className="space-y-3">
                                                            {productOffers.map(offer => (
                                                                <div key={offer._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-800 p-3 rounded-lg">
                                                                    <div>
                                                                        <p className="text-white">Offer: <span className="font-bold text-indigo-400">₹{offer.offerPrice}</span></p>
                                                                        <p className="text-sm text-slate-400">from {offer.buyerEmail}</p>
                                                                    </div>
                                                                    {offer.status === 'pending_seller' && (
                                                                        <div className="flex gap-2 mt-2 sm:mt-0">
                                                                            <button onClick={() => handleOfferAction(offer._id, 'accept')} className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-semibold">Accept</button>
                                                                            <button onClick={() => handleOfferAction(offer._id, 'reject')} className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-semibold">Reject</button>
                                                                        </div>
                                                                    )}
                                                                    {offer.status === 'pending_buyer_confirmation' && <p className="text-yellow-400 font-semibold">Waiting for Buyer</p>}
                                                                    {offer.status === 'declined' && <p className="text-red-500 font-semibold">Declined</p>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {product.status === 'sold' && (
                                                    <div className="bg-blue-900/50 p-4 rounded-b-xl border-t border-slate-700">
                                                         <p className="text-blue-300 font-semibold text-center">This item has been sold.</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                             ) : (
                                 <div className="text-center bg-slate-800/60 p-10 rounded-xl">
                                    <p className="text-xl text-slate-400">You haven&apos;t listed any items yet.</p>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}