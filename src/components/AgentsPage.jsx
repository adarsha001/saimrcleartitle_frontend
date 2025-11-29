import { useEffect, useState } from "react";
import {
  getAgents,
  createAgent,
  updateAgent,
  deleteAgent,
} from "../api/agentApi";
import AgentForm from "../components/AgentForm";

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState(null);

  const [totalPages, setTotalPages] = useState(1);

  const fetchAgents = async () => {
    const res = await getAgents(page, search);
    setAgents(res.data.data);
    setTotalPages(res.data.pages);
  };

  useEffect(() => {
    fetchAgents();
  }, [page, search]);

  const handleAdd = async (data) => {
    await createAgent(data);
    setOpenForm(false);
    fetchAgents();
  };

  const handleUpdate = async (data) => {
    await updateAgent(editData._id, data);
    setEditData(null);
    setOpenForm(false);
    fetchAgents();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this agent?")) {
      await deleteAgent(id);
      fetchAgents();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Agents</h1>
        <button
          onClick={() => setOpenForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Agent
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search agents..."
        className="w-full p-2 border rounded mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Company</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {agents.map((a) => (
              <tr key={a._id} className="text-center">
                <td className="p-2 border">{a.name}</td>
                <td className="p-2 border">{a.phoneNumber}</td>
                <td className="p-2 border">{a.email}</td>
                <td className="p-2 border">{a.company}</td>

                <td className="p-2 border flex justify-center gap-3">

                  <button
                    onClick={() => {
                      setEditData(a);
                      setOpenForm(true);
                    }}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(a._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="px-4 py-1 bg-gray-100 rounded">
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Modal Form */}
      {openForm && (
        <AgentForm
          onSubmit={editData ? handleUpdate : handleAdd}
          onClose={() => {
            setOpenForm(false);
            setEditData(null);
          }}
          initialData={editData}
        />
      )}
    </div>
  );
}
