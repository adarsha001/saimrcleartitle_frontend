import { useState, useEffect } from "react";

export default function AgentForm({ onSubmit, onClose, initialData }) {
  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    alternativePhoneNumber: "",
    email: "",
    company: "",
    languages: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        languages: initialData.languages?.join(", ") || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formatted = {
      ...form,
      languages: form.languages.split(",").map((l) => l.trim()),
    };
    onSubmit(formatted);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">
          {initialData ? "Edit Agent" : "Add Agent"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            type="text"
            name="name"
            placeholder="Agent Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={form.phoneNumber}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            name="alternativePhoneNumber"
            placeholder="Alternative Phone Number"
            value={form.alternativePhoneNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            name="company"
            placeholder="Company Name"
            value={form.company}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            name="languages"
            placeholder="Languages (comma separated)"
            value={form.languages}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {initialData ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
