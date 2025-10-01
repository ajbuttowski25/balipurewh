import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const PurchaseOrderPieChart = ({ pending, partiallyReceived, completed }) => {
  const total = pending + partiallyReceived + completed;

  const data = {
    labels: ['Pending', 'Partially Received', 'Completed'],
    datasets: [
      {
        data: [pending, partiallyReceived, completed],
        backgroundColor: ['#f4496eff', '#f6bd2fff', '#1287d4ff'],
        hoverBackgroundColor: ['#FF6384', '#FFCE56', '#36A2EB'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      title: {
        display: true,
        font: { size: 16 },
      },
      datalabels: {
        color: '#fff',
        formatter: (value) => value,
        font: { weight: 'bold', size: 14 },
      },
    },
  };

  return (
    <div className="topbar-card-boxx d-flex flex-column align-items-center justify-content-center">
      <div style={{ width: '450px', height: '380px' }}>
        <Pie data={data} options={options} />
      </div>
      {/* Display total below the chart */}
      <div style={{ marginTop: '16px', fontWeight: 'bold', fontSize: '18px' }}>
        Total Purchase Orders: {total}
      </div>
    </div>
  );
};

export default PurchaseOrderPieChart;
