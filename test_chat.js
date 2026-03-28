fetch("http://localhost:3000/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "What is a good esports rotation strategy?" })
}).then(async r => {
  console.log("Status:", r.status);
  console.log("Response:", await r.text());
}).catch(console.error);
