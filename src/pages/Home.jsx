import useData from "../hooks/useData";

export default function Home() {
  const data = useData();

  if (!data) return <h2>Loading sports...</h2>;

  return (
    <div>
      <h1>🔥 Rivalis Bets</h1>

      {Object.entries(data).map(([sport, games]) => (
        <div key={sport} style={{ marginBottom: "30px" }}>
          <h2>{sport}</h2>

          {games.length === 0 && <p>No data available</p>}

          {games.map((g, i) => (
            <div key={i} className="card">
              <h3>{g.teams}</h3>

              {g.odds.map((o, j) => (
                <p key={j}>
                  {o.name}: {o.price}
                </p>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
