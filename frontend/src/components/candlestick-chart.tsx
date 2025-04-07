import React from "react";
import ReactECharts from "echarts-for-react";

interface Props {
  title: string;
  dates: string[];
  values: [number, number, number, number][];
}

const CandlestickChart: React.FC<Props> = ({ title, dates, values }) => {
  const option = {
    title: {
      text: title,
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
    },
    xAxis: {
      type: "category",
      data: dates,
      scale: true,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false },
      min: "dataMin",
      max: "dataMax",
    },
    yAxis: {
      scale: true,
      splitArea: {
        show: true,
      },
    },
    series: [
      {
        type: "candlestick",
        name: "Stock Price",
        data: values,
        itemStyle: {
          color: "#1fda9c", // rising
          color0: "#ff335a", // falling
          borderColor: "#1fda9c",
          borderColor0: "#ff335a",
        },
      },
    ],
    dataZoom: [
      {
        type: "inside", // zoom with mouse scroll or touch
        start: 0, // default zoom
        end: 100,
      },
      {
        show: true, // external slider
        type: "slider",
        top: 30,
        start: 50,
        end: 100,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 600 }} />;
};

export default CandlestickChart;
