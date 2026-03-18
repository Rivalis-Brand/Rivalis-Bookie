import useData from "../hooks/useData";
import PropCard from "../components/PropCard";

export default function Home() {
  const data = useData();

  if (!data) return <h2>Loading...</h2>;

  if (data.length === 0) {
    return (
      <div>
        <h1>🔥 Rivalis Bets</h1>
        <h2>No data available</h2>
      </div>
    );
  }

  return (
    <div>
      <h1>🔥 Rivalis Bets</h1>
      {data.map((p, i) => (
        <PropCard key={i} prop={p} />
      ))}
    </div>
  );
}
