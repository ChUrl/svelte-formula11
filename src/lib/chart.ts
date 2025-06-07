import { type LineChartOptions, ScaleTypes } from "@carbon/charts-svelte";

export const make_chart_options = (
  title: string,
  bottom: string,
  left: string,
  group: string = "group",
  width: string = "100%",
  height: string = "400px",
): LineChartOptions => {
  return {
    title: title,
    axes: {
      bottom: {
        mapsTo: bottom,
        scaleType: ScaleTypes.LABELS,
      },
      left: {
        mapsTo: left,
        scaleType: ScaleTypes.LINEAR,
      },
    },
    data: {
      groupMapsTo: group,
    },
    curve: "curveMonotoneX",
    // toolbar: {
    //   enabled: false,
    // },
    animations: true,
    // canvasZoom: {
    //   enabled: false,
    // },
    grid: {
      x: {
        enabled: true,
        alignWithAxisTicks: true,
      },
      y: {
        enabled: true,
        alignWithAxisTicks: true,
      },
    },
    legend: {
      enabled: true,
      clickable: true,
      position: "top",
    },
    points: {
      enabled: true,
      radius: 5,
    },
    tooltip: {
      showTotal: false,
    },
    resizable: true,
    width: width,
    height: height,
  };
};
