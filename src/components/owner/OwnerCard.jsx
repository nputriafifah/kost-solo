export default function OwnerCard({ item, onEdit }) {
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

        {/* 🔥 INI YANG PENTING */}
        <button
          onClick={() => onEdit(item.id)}
          className="text-yellow-500 hover:underline"
        >
          Edit
        </button>

        <button className="text-indigo-600 hover:underline">
          Detail
        </button>

        <button className="text-red-500 hover:underline">
          Nonaktifkan
        </button>

      </div>
    </div>
  );
}