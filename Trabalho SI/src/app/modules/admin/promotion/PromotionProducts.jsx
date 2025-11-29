import { useState } from "react";
import Home from "../../home/Home";
import Promotion from "./Promotion";

export default function PromotionProducts() {
  const [promos, setPromos] = useState([
    { id: 1, titulo: "Banana", preco: "5,99" },
    { id: 2, titulo: "Arroz 5kg", preco: "19,90" }
  ]);

  return (
    <>
      <Home promos={promos} />
      <Promotion promos={promos} setPromos={setPromos} />
    </>
  );
}