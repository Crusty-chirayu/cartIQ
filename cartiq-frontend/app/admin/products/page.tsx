"use client";

import { useState } from "react";

export default function AdminPage() {

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");

  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");

  const uploadImage = async (e: any) => {

    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);

    try {

      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setImage(data.imageUrl);
      setPreview(data.imageUrl);

    } catch (error) {
      alert("Image upload failed");
    }

    setUploading(false);
  };

  const submitProduct = async (e: any) => {

    e.preventDefault();

    if (!name || !description || !price || !category || !stock || !image) {
      alert("Please fill all fields and upload image");
      return;
    }

    await fetch("http://localhost:5000/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        price,
        category,
        image,
        countInStock: stock,
      }),
    });

    alert("Product added!");

    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setStock("");
    setImage("");
    setPreview("");
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-3xl font-bold mb-8">
        Add Product
      </h1>

      <form onSubmit={submitProduct} className="space-y-4 max-w-xl">

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product Name"
          className="w-full p-3 bg-gray-900 rounded"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full p-3 bg-gray-900 rounded"
        />

        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          className="w-full p-3 bg-gray-900 rounded"
        />

        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="w-full p-3 bg-gray-900 rounded"
        />

        <input
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Stock"
          className="w-full p-3 bg-gray-900 rounded"
        />

        <input type="file" onChange={uploadImage} />

        {uploading && <p>Uploading image...</p>}

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="w-40 rounded mt-4"
          />
        )}

        <button className="bg-white text-black px-6 py-3 rounded">
          Add Product
        </button>

      </form>

    </div>
  );
}