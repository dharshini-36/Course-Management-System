// Turns an Axios error into a readable message.
// The backend sends { message, errors: [{ field, message }] } for validation
// problems, so show the first detailed message when there is one.
export function getErrorMessage(err, fallback) {
  const data = err?.response?.data;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    return typeof first === "string" ? first : first.message;
  }

  return data?.message || fallback;
}