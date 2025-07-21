const BASE_URL = "http://localhost:5000/api"; // change to production URL when deployed

export const sendContactMessage = async (data) => {
  const response = await fetch(`${BASE_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Erreur lors de l'envoi.");
  }

  return response.json();
};