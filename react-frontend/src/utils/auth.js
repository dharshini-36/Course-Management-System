// Small helpers to keep the login session in one place.
// sessionStorage = cleared when the browser tab is closed.

export function saveSession(token, student) {
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("student", JSON.stringify(student));
}

export function getToken() {
  return sessionStorage.getItem("token");
}

export function getStudent() {
  try {
    return JSON.parse(sessionStorage.getItem("student"));
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function logout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("student");
}