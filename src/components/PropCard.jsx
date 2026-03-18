export default function PropCard({ prop }) {
  return (
    <div className="card">
      <img src={prop.image} width="50" />
      <h3>{prop.name}</h3>
      <p>{prop.team}</p>
      <strong>{prop.stat} O{prop.line}</strong>
      <p>Risk: {prop.risk}%</p>
    </div>
  );
}
