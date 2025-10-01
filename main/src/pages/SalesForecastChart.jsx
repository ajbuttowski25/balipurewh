import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Title } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Title);

const SalesForecastChart = ({ data, options }) => {
  // Example default data if none is passed
  const defaultData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Forecasted Sales",
        data: [1200, 1500, 1700, 1400, 1800, 2000],
        borderColor: "#36A2EB",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const defaultOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Sales Forecast (Units)", font: { size: 16 } },
    },
  };

  return <Line data={data || defaultData} options={options || defaultOptions} />;
};

export default SalesForecastChart;
