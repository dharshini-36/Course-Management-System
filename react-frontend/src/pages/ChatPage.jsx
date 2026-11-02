import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import Chat from "../components/Chat";

// Chat is only for logged-in users (student or admin).
export default function ChatPage() {
    const loggedIn = Boolean(sessionStorage.getItem("token"));

    return (
        <PageShell variant="student3">
            {loggedIn ? (
                <Chat />
            ) : (
                <div className="db-empty-state" style={{ margin: "60px auto" }}>
                    <h3>Please log in to use chat</h3>
                    <Link to="/login" className="db-empty-btn">Log In</Link>
                </div>
            )}
        </PageShell>
    );
}