document.getElementById("checkBtn").addEventListener("click", async () => {
  const text = document.getElementById("newsInput").value.trim();
  if (!text) {
    alert("Please enter some news text.");
    return;
  }

  const resultDiv = document.getElementById("result");
  const realNewsDiv = document.getElementById("realNews");
  const factChecksDiv = document.getElementById("factChecks");
  resultDiv.textContent = "Analyzing...";
  realNewsDiv.innerHTML = "";
  factChecksDiv.innerHTML = "";

  try {
    const res = await fetch("/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();

    resultDiv.innerHTML = `
      <p>🧠 <strong>AI Prediction:</strong> ${data.aiResult.label}</p>
      <p>📊 <strong>Confidence:</strong> ${data.aiResult.confidence}</p>
      <p>💬 <strong>Reason:</strong> ${data.aiResult.reason}</p>
    `;

    if (data.realNews.length > 0) {
      realNewsDiv.innerHTML = "<h3>✅ Verified News Sources:</h3>";
      data.realNews.forEach((a) => {
        realNewsDiv.innerHTML += `
          <div>
            <img src="${a.image}" width="100"><br>
            <a href="${a.url}" target="_blank">${a.title}</a>
            <p>${a.source}</p>
          </div><hr>`;
      });
    }

    if (data.factChecks.length > 0) {
      factChecksDiv.innerHTML = "<h3>🔍 Fact Check Results:</h3>";
      data.factChecks.forEach((c) => {
        factChecksDiv.innerHTML += `
          <div>
            <p><strong>${c.claimant}</strong> - ${c.publisher}</p>
            <p>${c.title}</p>
            <p><em>${c.rating}</em></p>
            <a href="${c.url}" target="_blank">Read more</a>
          </div><hr>`;
      });
    }

  } catch (err) {
    resultDiv.textContent = "❌ Error verifying news. Check console.";
    console.error(err);
  }
});
