import { useEffect, useRef, useState } from "react";
import apiClient from "../api/apiClient";
import { createSocket } from "../api/socketClient";
import "./Chat.css";

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function Chat() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [me, setMe] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  // The open conversation's user id, readable inside the socket listener.
  const selectedRef = useRef("");
  selectedRef.current = selected?._id || "";

  const bottomRef = useRef(null);

  // Who am I, and who can I talk to?
  useEffect(() => {
    apiClient
      .get("/profile")
      .then((response) => setMe(response.data.user))
      .catch(() => setError("Could not load your profile. Please log in again."));

    apiClient
      .get("/contacts")
      .then((response) => setContacts(response.data.contacts))
      .catch(() => setError("Could not load your contacts."));
  }, []);

  useEffect(() => {
    const client = createSocket();

    client.on("connect", () => {
      setConnected(true);
      setError("");
    });

    client.on("disconnect", () => {
      setConnected(false);
    });

    client.on("connect_error", (err) => {
      setConnected(false);
      setError(err.message);
    });

    client.on("receive_message", (data) => {
      // Only show messages that belong to the conversation that is open.
      const other = selectedRef.current;
      if (!other || (data.sender !== other && data.recipient !== other)) return;

      setMessages((previous) =>
        previous.some((item) => item._id === data._id) ? previous : [...previous, data]
      );
    });

    client.connect();
    setSocket(client);

    return () => {
      client.disconnect();
    };
  }, []);

  // Keep the newest message in view.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function openConversation(contact) {
    setSelected(contact);
    setMessages([]);
    setError("");

    try {
      const response = await apiClient.get(`/messages/${contact._id}`);
      setMessages(response.data.messages);
    } catch (err) {
      setError("Unable to load message history");
    }
  }

  function sendMessage(event) {
    event.preventDefault();

    if (!socket || !connected || !selected) return;

    socket.emit(
      "send_message",
      {
        recipientId: selected._id,
        text: message,
      },
      (result) => {
        if (result.success) {
          setMessage("");
          setError("");
        } else {
          setError(result.message);
        }
      }
    );
  }

  const myId = me?._id;
  const listTitle = me?.role === "admin" ? "Students" : "Admins";
  const visibleContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <section className="chat">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-head">
          <h2 className="chat-title">Chat</h2>
          <span className={`chat-status ${connected ? "is-online" : "is-offline"}`}>
            <span className="chat-status-dot" />
            {connected ? "Online" : "Offline"}
          </span>
        </div>

        <p className="chat-list-title">{listTitle}</p>

        {contacts.length > 5 && (
          <input
            className="chat-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${listTitle.toLowerCase()}`}
            aria-label="Search contacts"
          />
        )}

        <ul className="chat-contacts">
          {visibleContacts.length === 0 && (
            <li className="chat-contacts-empty">
              {contacts.length === 0 ? `No ${listTitle.toLowerCase()} found.` : "No matches."}
            </li>
          )}

          {visibleContacts.map((contact) => (
            <li key={contact._id}>
              <button
                type="button"
                className={`chat-contact ${selected?._id === contact._id ? "is-active" : ""}`}
                onClick={() => openConversation(contact)}
              >
                <span className="chat-avatar">{initials(contact.name)}</span>
                <span className="chat-contact-name">{contact.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="chat-main">
        {selected ? (
          <header className="chat-conversation-head">
            <span className="chat-avatar">{initials(selected.name)}</span>
            <div>
              <p className="chat-conversation-name">{selected.name}</p>
              <p className="chat-conversation-role">
                {selected.role === "admin" ? "Admin" : "Student"}
              </p>
            </div>
          </header>
        ) : (
          <header className="chat-conversation-head">
            <p className="chat-conversation-name">Messages</p>
          </header>
        )}

        {error && (
          <p role="alert" className="chat-error">
            {error}
          </p>
        )}

        <div className="chat-messages" aria-live="polite">
          {!selected ? (
            <div className="chat-empty">
              <p className="chat-empty-title">Choose someone to chat with</p>
              <p className="chat-empty-text">Pick a name from the list to open the conversation.</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">
              <p className="chat-empty-title">No messages yet</p>
              <p className="chat-empty-text">Say hello to {selected.name}.</p>
            </div>
          ) : (
            messages.map((item) => {
              const mine = item.sender === myId;
              return (
                <div
                  key={item._id}
                  className={`chat-row ${mine ? "is-mine" : "is-theirs"}`}
                >
                  <div className="chat-bubble">
                    <p className="chat-text">{item.text}</p>
                    <time className="chat-time">{formatTime(item.createdAt)}</time>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form className="chat-composer" onSubmit={sendMessage}>
          <input
            className="chat-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={selected ? `Message ${selected.name}` : "Choose someone first"}
            aria-label="Message"
            maxLength={2000}
            disabled={!selected}
            required
          />
          <button
            type="submit"
            className="chat-btn-primary"
            disabled={!connected || !selected}
          >
            Send
          </button>
        </form>
      </div>
    </section>
  );
}

export default Chat;