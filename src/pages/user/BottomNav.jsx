import { Home, Heart, MessageCircle, Map, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const goPage = (path) => {
    if (!token) {
      navigate("/auth");
    } else {
      navigate(path);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-50">

      <button onClick={() => navigate("/dashboard")}>
        <Home />
      </button>

      <button onClick={() => goPage("/like")}>
        <Heart />
      </button>

      <button onClick={() => goPage("/chat")}>
        <MessageCircle />
      </button>

      <button onClick={() => goPage("/map")}>
        <Map />
      </button>

      <button onClick={() => goPage("/profil")}>
        <User />
      </button>

    </div>
  );
}