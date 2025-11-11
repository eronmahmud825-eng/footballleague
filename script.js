// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCqbDmeB6hrJ3NmwfPWakxg4z31UwudZ5c",
    authDomain: "footballleague-b89e5.firebaseapp.com",
    projectId: "footballleague-b89e5",
    storageBucket: "footballleague-b89e5.firebasestorage.app",
    messagingSenderId: "345929896639",
    appId: "1:345929896639:web:25e2a47c96a42d5307ac0a",
    measurementId: "G-2S5YYMKYCE"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const coachesList = ["ERON", "ARIN", "LAWIN"];
const adminPassword = "eron2025";

// Apply match to coaches stats
function applyMatchToCoaches(match, coaches) {
    const c1 = coaches.find(c => c.name === match.p1);
    const c2 = coaches.find(c => c.name === match.p2);
    if (!c1 || !c2) return;

    c1.game++;
    c2.game++;
    c1.gf += match.s1;
    c1.ga += match.s2;
    c2.gf += match.s2;
    c2.ga += match.s1;

    if (match.s1 > match.s2) { c1.win++;
        c2.lose++; } else if (match.s1 < match.s2) { c2.win++;
        c1.lose++; } else { c1.draw++;
        c2.draw++; }
}

// Load league table
function loadTableFromFirebase() {
    db.collection("matches").get().then(snapshot => {
        const matches = [];
        snapshot.forEach(doc => matches.push(doc.data()));

        const coaches = coachesList.map(name => ({ name, game: 0, win: 0, lose: 0, draw: 0, ga: 0, gf: 0, diff: 0, point: 0 }));
        matches.forEach(m => applyMatchToCoaches(m, coaches));
        coaches.forEach(c => { c.diff = c.gf - c.ga;
            c.point = c.win * 3 + c.draw; });
        coaches.sort((a, b) => b.point - a.point || b.diff - a.diff || b.gf - a.gf);

        const tbody = document.querySelector("#leagueTable tbody");
        if (tbody) {
            tbody.innerHTML = "";
            coaches.forEach((c, i) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td>${i+1}</td><td>${c.name}</td><td>${c.game}</td><td>${c.win}</td><td>${c.lose}</td><td>${c.draw}</td><td>${c.ga}</td><td>${c.gf}</td><td>${c.diff}</td><td>${c.point}</td>`;
                tbody.appendChild(tr);
            });
        }
    });
}

// Load match history
function loadHistory() {
    db.collection("matches").get().then(snapshot => {
        const tbody = document.querySelector("#historyTable tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        snapshot.forEach(doc => {
            const m = doc.data();
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${m.date}</td><td>${m.p1} vs ${m.p2}</td><td>${m.s1}-${m.s2}</td>`;
            tbody.appendChild(tr);
        });
    });
}

// Save match (admin only)
const saveBtn = document.getElementById("saveMatchBtn");
if (saveBtn) {
    saveBtn.addEventListener("click", () => {
        const pass = document.getElementById("adminPass").value;
        if (pass !== adminPassword) { alert("❌ Wrong password"); return; }

        const p1 = document.getElementById("player1").value;
        const p2 = document.getElementById("player2").value;
        const s1 = parseInt(document.getElementById("score1").value);
        const s2 = parseInt(document.getElementById("score2").value);
        const date = document.getElementById("matchDate").value;

        if (!p1 || !p2 || isNaN(s1) || isNaN(s2) || !date) { alert("❌ Fill all fields"); return; }
        if (p1 === p2) { alert("❌ Players must be different"); return; }

        const match = { p1, p2, s1, s2, date };
        db.collection("matches").add(match)
            .then(() => { alert("✅ Match saved");
                document.getElementById("score1").value = "";
                document.getElementById("score2").value = "";
                loadTableFromFirebase();
                loadHistory(); })
            .catch(e => { alert("❌ Error saving");
                console.error(e); });
    });
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
    loadTableFromFirebase();
    loadHistory();
});