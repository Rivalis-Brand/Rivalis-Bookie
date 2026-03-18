import { useEffect, useState } from "react";
import { getNBAData } from "../services/dataService";
import { rank } from "../engine/baseEngine";

export default function useData() {
  const [data, setData] = useState([]);

  async function load() {
    const raw = await getNBAData();
    setData(rank(raw));
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 60000);
    return () => clearInterval(i);
  }, []);

  return data;
}
