import { useEffect, useState } from "react";

export default function AdminPage() {
  const [listings, setListings] = useState([]);

  const token = localStorage.getItem("token");

  const fetchPending = async () => {
    const res = await fetch("http://localhost:3000/listings/pending", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setListings(data.data);
  };

  const approve = async (id) => {
    await fetch(`http://localhost:3000/listings/${id}/approve`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchPending(); // refresh
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div>
      <h2>Admin - Pending Listings</h2>

      {listings.map((item) => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <button onClick={() => approve(item.id)}>
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}