import { useNavigate } from "react-router-dom";

export default function OwnerCard({ item, onEdit }) {
  const navigate = useNavigate();
  const id = item?.id ?? item?._id;

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "text-indigo-600";
      case "PENDING":
        return "text-yellow-500";
      case "REJECTED":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const openDetail = () => {
    if (id) navigate(`/owner/listing/${id}`);
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition">
      <h3 className="font-semibold text-lg text-slate-800">{item.name}</h3>
      <p className="text-sm text-slate-500 mt-1">{item.address}</p>

      <div className="mt-2 text-xs">
        Status:{" "}
        <span className={`font-semibold ${getStatusColor(item.status)}`}>
          {item.status}
        </span>
      </div>

      <div className="mt-4 flex gap-4 text-sm">
        <button
          type="button"
          onClick={openDetail}
          className="text-indigo-600 hover:underline font-semibold"
        >
          Detail
        </button>
        <button
          type="button"
          onClick={() => id && onEdit(id)}
          className="text-yellow-500 hover:underline font-semibold"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
