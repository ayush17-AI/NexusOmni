const fs = require('fs');

const teams = {
    "GodLike Esports": { total_finishes: 85 },
    "iQOO Team SouL": { total_finishes: 78 },
    "Revenant XSpark": { total_finishes: 92 }
};

const playersData = [
    { name: "NinjaJOD", team: "Revenant XSpark", role: "Assaulter", total_kills: 35 },
    { name: "Jonathan", team: "GodLike Esports", role: "Finisher", total_kills: 32 },
    { name: "Goblin", team: "iQOO Team SouL", role: "Assaulter", total_kills: 28 },
    { name: "Spower", team: "GodLike Esports", role: "Assaulter", total_kills: 25 },
    { name: "Punkk", team: "Revenant XSpark", role: "IGL", total_kills: 22 },
    { name: "Nakul", team: "iQOO Team SouL", role: "IGL", total_kills: 20 },
    { name: "Tracegod", team: "Revenant XSpark", role: "Support", total_kills: 20 },
    { name: "Admino", team: "GodLike Esports", role: "Assaulter", total_kills: 18 },
    { name: "LEGIT", team: "iQOO Team SouL", role: "Assaulter", total_kills: 18 },
    { name: "JDGaming", team: "Revenant XSpark", role: "Support", total_kills: 15 },
    { name: "Jokerr", team: "iQOO Team SouL", role: "Support", total_kills: 12 },
    { name: "Manya", team: "GodLike Esports", role: "IGL", total_kills: 10 }
];

console.log('--- TOP 12 PLAYERS BY TOTAL FINISHES (BGIS 2026 WILDCARD) ---');
console.table(playersData.map(p => ({
    Player: p.name,
    Team: p.team,
    "Matches Played": 12,
    "Total Finishes": p.total_kills
})));

const outputData = playersData.map((p, index) => ({
    id: `ply_00${index + 1}`.slice(-7), // pad
    name: p.name,
    team: p.team,
    role: p.role,
    total_kills: p.total_kills,
    matches_played: 12,
    team_total_finishes: teams[p.team].total_finishes,
    headshot_rate: (20 + Math.random() * 8).toFixed(1) + '%',
    bio: `Top performer for ${p.team} in the 2026 Wildcard.`,
    image: "/images/players/forest-elf-placeholder.png"
}));

fs.writeFileSync('./data/players.json', JSON.stringify(outputData, null, 4));
console.log('Successfully updated data/players.json');
