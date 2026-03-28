export async function scanFiles(files: any[]) {
  const res = await fetch("http://127.0.0.1:8000/scan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(files),
  });

  return res.json();
}