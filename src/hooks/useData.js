import { useEffect, useState } from "react";
import { getAllSportsData } from "../services/dataService";

export default function useData() {
  const [data, setData] = useState(null);

  async function load() {
    const result = await getAllSportsData();
    setData(result);
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 60000);
    return () => clearInterval(i);
  }, []);

  return data;
}
