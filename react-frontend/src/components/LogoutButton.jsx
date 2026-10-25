import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

// Change this to the page students should see after logging out.
const AFTER_LOGOUT_PATH = "/";

function LogoutButton() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();                    // removes the token + student from sessionStorage
    navigate(AFTER_LOGOUT_PATH);
  }

  return (
    <button type="button" onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;