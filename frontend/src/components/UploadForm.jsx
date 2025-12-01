import { useState } from "react";
import toast from "react-hot-toast";

export default function UploadForm({ categories }) {
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("college");
  const [categoryId, setCategoryId] = useState(categories[0]?._id || "");
  const [file, setFile] = useState(null);

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Select a file");
    const b64 = await toBase64(file);
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/certificates/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title, level, categoryId, file: b64 })
    });
    const d = await res.json();
    if (!res.ok) return toast.error(d.error || "Upload failed");
    toast.success("Uploaded");
  };

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
      <input className="w-full border p-2 rounded" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <select className="w-full border p-2 rounded" value={level} onChange={(e) => setLevel(e.target.value)}>
        <option value="college">College</option>
        <option value="state">State</option>
        <option value="national">National</option>
      </select>
      <select className="w-full border p-2 rounded" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        {categories.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
      </select>
      <input className="w-full border p-2 rounded" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} />
      <button className="bg-blue-600 text-white rounded px-4 py-2">Upload</button>
    </form>
  );
}