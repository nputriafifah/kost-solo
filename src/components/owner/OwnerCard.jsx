import { useNavigate } from "react-router-dom";

export default function OwnerCard({ item, onEdit }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition">

      <h3 className="font-semibold text-lg text-slate-800">
        {item.name}
      </h3>

      <p className="text-sm text-slate-500 mt-1">
        {item.address}
      </p>

      <div className="mt-3 text-xs">
        Status:{" "}
        <span className="font-semibold text-indigo-600">
          {item.status}
        </span>
      </div>

      <div className="mt-4 flex gap-4 text-sm">

        {/* EDIT */}
        <button
          onClick={() => onEdit(item.id)}
          className="text-yellow-500 hover:underline"
        >
          Edit
        </button>

        {/* 🔥 DETAIL (INI YANG DIPERBAIKI) */}
        <button
          onClick={() => navigate(`/owner/listing/${item.id}`)}
          className="text-indigo-600 hover:underline"
        >
          Detail
        </button>

        {/* NONAKTIF */}
        <button className="text-red-500 hover:underline">
          Nonaktifkan
        </button>

      </div>
    </div>
  );
}