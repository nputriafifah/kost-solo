export default function ListingCard({ item, onEdit }) {
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

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition">
      <h3 className="font-semibold text-lg">{item.name}</h3>
      <p className="text-sm text-slate-500">{item.address}</p>

      <div className="mt-2 text-xs">
        Status:{" "}
        <span className={getStatusColor(item.status)}>
          {item.status}
        </span>
      </div>

      <div className="mt-4 flex gap-4 text-sm">
        <button className="text-indigo-600">Detail</button>
        <button
          onClick={() => onEdit(item.id)}
          className="text-yellow-500"
        >
          Edit
        </button>
      </div>
    </div>
  );
}