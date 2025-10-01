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

const RawMaterialsChart = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchRawMats();
  }, []);

  const fetchRawMats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/inventory_rawmats"
      );
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching raw materials:", error);
    }
  };

  const getBarColor = (qty) => {
    if (qty < 150000) return "red";
    if (qty < 160000) return "yellow";
    return "#5cb45cff";
  };

  const data = {
    labels: items.map((item) => item.item),
    datasets: [
      {
        label: "Quantity",
        data: items.map((item) => item.quantity),
        backgroundColor: items.map((item) => getBarColor(item.quantity)),
        borderColor: items.map((item) => getBarColor(item.quantity)),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: "x", // vertical bars
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          generateLabels: () => [
            { text: "Normal Stock", fillStyle: "#5cb45cff" },
            { text: "Warning", fillStyle: "yellow" },
            { text: "Low Stock", fillStyle: "red" },
          ],
        },
      },
      datalabels: {
        color: "#000",
        anchor: "center",
        align: "center",
        font: { weight: "italic"},
        formatter: (value) => value,
      },
    },
    scales: {
      y: { beginAtZero: true },
      x: { ticks: { autoSkip: false } },
    },
  };

  return (
    <div style={{ width: "100%", height: "200px" }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default RawMaterialsChart;
