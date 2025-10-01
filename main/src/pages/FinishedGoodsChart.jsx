import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const FinishedGoodsChart = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchFinishedGoods();
  }, []);

  const fetchFinishedGoods = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/inventories");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching finished goods:", error);
    }
  };

  const getBarColor = (item) => {
    const qty = item.quantity;
    if (item.item.includes("350ml")) {
      if (qty < 1001) return "red";
      if (qty < 2000) return "yellow";
    } else if (item.item.includes("500ml")) {
      if (qty < 1501) return "red";
      if (qty < 2500) return "yellow";
    } else if (item.item.includes("1L")) {
      if (qty < 1001) return "red";
      if (qty < 2000) return "yellow";
    } else if (item.item.includes("6L")) {
      if (qty < 501) return "red";
      if (qty < 750) return "yellow";
    }
    return "#5cb45cff";
  };

  const data = {
    labels: items.map((item) => item.item),
    datasets: [
      {
        label: "Quantity",
        data: items.map((item) => item.quantity),
        backgroundColor: items.map((item) => getBarColor(item)),
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          generateLabels: (chart) => {
            // Custom legend labels based on color meaning
            return [
              { text: "Normal Stock", fillStyle: "#5cb45cff" },
              { text: "Warning", fillStyle: "yellow" },
              { text: "Low Stock", fillStyle: "red" },
            ];
          },
        },
      },
      title: {
        display: true,
      },
      datalabels: {
        color: "#000000ff",
        anchor: "center",
        align: "center",
        font: { weight: "italic" },
        formatter: (value) => value,
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
        <div style={{ width: "100%", height: "300px" }}>
          <Bar data={data} options={options} />
        </div>
  );
};

export default FinishedGoodsChart;
