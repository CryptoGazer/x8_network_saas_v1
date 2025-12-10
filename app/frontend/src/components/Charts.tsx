import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { getChartTextColor, getChartAxisColor, getChartGridColor, getChartThemeMode, getChartTooltipTheme, observeThemeChanges } from '../utils/themeChartHelper';

export const RevenueChannelsChart: React.FC = () => {
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    const cleanup = observeThemeChanges(() => {
      setChartKey(prev => prev + 1);
    });
    return cleanup;
  }, []);

  const textColor = getChartTextColor();
  const axisColor = getChartAxisColor();
  const gridColor = getChartGridColor();
  const themeMode = getChartThemeMode();
  const tooltipTheme = getChartTooltipTheme();

  const options: ApexOptions = {
    chart: {
      type: 'area',
      background: 'transparent',
      toolbar: { show: false },
      fontFamily: 'inherit'
    },
    theme: { mode: themeMode },
    stroke: {
      curve: 'smooth',
      width: [2, 3]
    },
    colors: ['#00D4FF', '#00B388'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1
      }
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr'],
      labels: { style: { colors: axisColor } }
    },
    yaxis: [
      {
        title: { text: 'EUR', style: { color: axisColor } },
        labels: { style: { colors: axisColor } }
      },
      {
        opposite: true,
        title: { text: 'Channels', style: { color: axisColor } },
        labels: { style: { colors: axisColor } }
      }
    ],
    dataLabels: { enabled: false },
    legend: {
      labels: { colors: textColor }
    },
    tooltip: {
      shared: true,
      theme: tooltipTheme
    },
    grid: {
      borderColor: gridColor
    }
  };

  const series = [
    { name: 'Revenue (EUR)', type: 'area', data: [] },
    { name: 'Channels', type: 'line', data: [] }
  ];

  return (
    <div id="chart.revenueChannels" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
        Revenue & Channels
      </h3>
      <Chart key={chartKey} options={options} series={series} type="area" height={300} />
    </div>
  );
};

export const DialogsSentReceivedChart: React.FC = () => {
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    const cleanup = observeThemeChanges(() => {
      setChartKey(prev => prev + 1);
    });
    return cleanup;
  }, []);

  const textColor = getChartTextColor();
  const axisColor = getChartAxisColor();
  const gridColor = getChartGridColor();
  const themeMode = getChartThemeMode();
  const tooltipTheme = getChartTooltipTheme();

  const options: ApexOptions = {
    chart: {
      type: 'area',
      background: 'transparent',
      toolbar: { show: false },
      fontFamily: 'inherit'
    },
    theme: { mode: themeMode },
    stroke: {
      curve: 'smooth',
      width: [2, 3]
    },
    colors: ['#6EE7B7', '#00D4FF'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1
      }
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr'],
      labels: { style: { colors: axisColor } }
    },
    yaxis: {
      labels: { style: { colors: axisColor } }
    },
    dataLabels: { enabled: false },
    legend: {
      labels: { colors: textColor }
    },
    tooltip: {
      shared: true,
      theme: tooltipTheme
    },
    grid: {
      borderColor: gridColor
    }
  };

  const series = [
    { name: 'Received', type: 'area', data: [] },
    { name: 'Sent', type: 'line', data: [] }
  ];

  return (
    <div id="chart.dialogsSentReceived" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
        Dialogs Sent & Received
      </h3>
      <Chart key={chartKey} options={options} series={series} type="area" height={300} />
    </div>
  );
};

export const ByChannelChart: React.FC = () => {
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    const cleanup = observeThemeChanges(() => {
      setChartKey(prev => prev + 1);
    });
    return cleanup;
  }, []);

  const textColor = getChartTextColor();
  const axisColor = getChartAxisColor();
  const gridColor = getChartGridColor();
  const themeMode = getChartThemeMode();
  const tooltipTheme = getChartTooltipTheme();

  const total = 0;
  const whatsapp = 0;
  const instagram = 0;
  const gmail = 0;
  const others = 0;

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      background: 'transparent',
      fontFamily: 'inherit'
    },
    theme: { mode: themeMode },
    labels: ['WhatsApp', 'Instagram', 'Gmail', 'Others'],
    colors: ['#00D4FF', '#00B388', '#FFD166', '#888888'],
    legend: {
      labels: { colors: textColor },
      position: 'bottom',
      formatter: function(seriesName, opts) {
        const val = opts.w.globals.series[opts.seriesIndex];
        const pct = ((val / total) * 100).toFixed(0);
        return `${seriesName}: ${pct}%`;
      }
    },
    dataLabels: {
      enabled: true,
      style: { colors: ['#fff'] },
      formatter: function(val) {
        return val.toFixed(0) + '%';
      }
    },
    tooltip: {
      theme: tooltipTheme,
      y: {
        formatter: function(val) {
          return val + ' (' + ((val / total) * 100).toFixed(0) + '%)';
        }
      }
    }
  };

  const series = [whatsapp, instagram, gmail, others];

  return (
    <div id="chart.byChannel" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
        Messages by Channel
      </h3>
      <Chart key={chartKey} options={options} series={series} type="donut" height={300} />
    </div>
  );
};

export const ClientTypesChart: React.FC = () => {
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    const cleanup = observeThemeChanges(() => {
      setChartKey(prev => prev + 1);
    });
    return cleanup;
  }, []);

  const textColor = getChartTextColor();
  const axisColor = getChartAxisColor();
  const gridColor = getChartGridColor();
  const themeMode = getChartThemeMode();
  const tooltipTheme = getChartTooltipTheme();

  const options: ApexOptions = {
    chart: {
      type: 'pie',
      background: 'transparent',
      fontFamily: 'inherit'
    },
    theme: { mode: themeMode },
    labels: ['no link sent', 'unpaid', 'paid'],
    colors: ['#B5B5C3', '#FFD166', '#24D39A'],
    legend: {
      labels: { colors: textColor },
      position: 'bottom',
      formatter: function(seriesName, opts) {
        const val = opts.w.globals.series[opts.seriesIndex];
        if (seriesName === 'unpaid') {
          return `${seriesName} — ${val} (€0)`;
        }
        if (seriesName === 'paid') {
          return `${seriesName} — ${val} (€0)`;
        }
        return `${seriesName} — ${val}`;
      }
    },
    dataLabels: {
      enabled: true,
      style: { colors: ['#fff'] }
    },
    tooltip: {
      theme: tooltipTheme
    }
  };

  const series = [0, 0, 0];

  return (
    <div id="chart.clientTypes" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
        Client Types
      </h3>
      <Chart key={chartKey} options={options} series={series} type="pie" height={300} />
    </div>
  );
};

export const ByCompanyChart: React.FC = () => {
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    const cleanup = observeThemeChanges(() => {
      setChartKey(prev => prev + 1);
    });
    return cleanup;
  }, []);

  const textColor = getChartTextColor();
  const axisColor = getChartAxisColor();
  const gridColor = getChartGridColor();
  const themeMode = getChartThemeMode();
  const tooltipTheme = getChartTooltipTheme();

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      background: 'transparent',
      fontFamily: 'inherit'
    },
    theme: { mode: themeMode },
    labels: [],
    colors: ['#00D4FF', '#00B388'],
    legend: {
      labels: { colors: textColor },
      position: 'bottom'
    },
    dataLabels: {
      enabled: true,
      style: { colors: ['#fff'] }
    },
    tooltip: {
      theme: tooltipTheme
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total messages',
              fontSize: '14px',
              color: axisColor,
              formatter: () => '0'
            }
          }
        }
      }
    }
  };

  const series = [0, 0];

  return (
    <div id="chart.byCompany" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
        Messages by Company
      </h3>
      <Chart key={chartKey} options={options} series={series} type="donut" height={300} />
    </div>
  );
};

export const AnsweredMissedChart: React.FC = () => {
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    const cleanup = observeThemeChanges(() => {
      setChartKey(prev => prev + 1);
    });
    return cleanup;
  }, []);

  const textColor = getChartTextColor();
  const axisColor = getChartAxisColor();
  const gridColor = getChartGridColor();
  const themeMode = getChartThemeMode();
  const tooltipTheme = getChartTooltipTheme();

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      background: 'transparent',
      fontFamily: 'inherit'
    },
    theme: { mode: themeMode },
    labels: ['Answered', 'Missed'],
    colors: ['#24D39A', '#FF5C5C'],
    legend: {
      labels: { colors: textColor },
      position: 'bottom'
    },
    dataLabels: {
      enabled: true,
      style: { colors: ['#fff'] }
    },
    tooltip: {
      theme: tooltipTheme
    }
  };

  const series = [0, 0];

  return (
    <div id="chart.answeredMissed" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
        Answered vs Missed
      </h3>
      <Chart key={chartKey} options={options} series={series} type="donut" height={300} />
    </div>
  );
};

export const AvgResponseChart: React.FC = () => {
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    const cleanup = observeThemeChanges(() => {
      setChartKey(prev => prev + 1);
    });
    return cleanup;
  }, []);

  const textColor = getChartTextColor();
  const axisColor = getChartAxisColor();
  const gridColor = getChartGridColor();
  const themeMode = getChartThemeMode();
  const tooltipTheme = getChartTooltipTheme();

  const options: ApexOptions = {
    chart: {
      type: 'radialBar',
      background: 'transparent',
      fontFamily: 'inherit'
    },
    theme: { mode: themeMode },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          size: '60%'
        },
        dataLabels: {
          name: {
            fontSize: '14px',
            color: axisColor,
            offsetY: -10
          },
          value: {
            fontSize: '32px',
            color: '#00B388',
            fontWeight: 700,
            formatter: () => '0s'
          }
        }
      }
    },
    fill: {
      colors: ['#00B388']
    },
    labels: ['Avg Response']
  };

  const series = [0];

  return (
    <div id="chart.avgResponse" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
        Average Response Time
      </h3>
      <Chart key={chartKey} options={options} series={series} type="radialBar" height={300} />
    </div>
  );
};

export const ClientTypeBarChart: React.FC = () => {
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    const cleanup = observeThemeChanges(() => {
      setChartKey(prev => prev + 1);
    });
    return cleanup;
  }, []);

  const textColor = getChartTextColor();
  const axisColor = getChartAxisColor();
  const gridColor = getChartGridColor();
  const themeMode = getChartThemeMode();
  const tooltipTheme = getChartTooltipTheme();

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      background: 'transparent',
      toolbar: { show: false },
      fontFamily: 'inherit'
    },
    theme: { mode: themeMode },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val, opts) {
        const percentages = [0, 0, 0];
        return percentages[opts.dataPointIndex] + '%';
      },
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ['rgba(255,255,255,0.9)']
      }
    },
    colors: ['#B5B5C3', '#FFD166', '#24D39A'],
    xaxis: {
      categories: ['no link sent', 'unpaid', 'paid'],
      labels: { style: { colors: axisColor } }
    },
    yaxis: {
      labels: { style: { colors: axisColor } }
    },
    legend: {
      show: false
    },
    tooltip: {
      theme: tooltipTheme,
      y: {
        formatter: function(val, opts) {
          const index = opts.dataPointIndex;
          if (index === 1) {
            return `${val} (unpaid €0)`;
          } else if (index === 2) {
            return `${val} (paid €0)`;
          }
          return val.toString();
        }
      }
    },
    grid: {
      borderColor: gridColor
    }
  };

  const series = [{ name: 'Count', data: [0, 0, 0] }];

  return (
    <div id="chart.clientTypeBar" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
        Client Type Distribution
      </h3>
      <Chart key={chartKey} options={options} series={series} type="bar" height={300} />
    </div>
  );
};
