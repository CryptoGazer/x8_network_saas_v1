import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

export const RevenueChannelsChart: React.FC = () => {
  const options: ApexOptions = {
    chart: {
      type: 'area',
      background: 'transparent',
      toolbar: { show: false },
      fontFamily: 'inherit'
    },
    theme: { mode: 'dark' },
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
      labels: { style: { colors: 'rgba(255,255,255,0.7)' } }
    },
    yaxis: [
      {
        title: { text: 'EUR', style: { color: 'rgba(255,255,255,0.7)' } },
        labels: { style: { colors: 'rgba(255,255,255,0.7)' } }
      },
      {
        opposite: true,
        title: { text: 'Channels', style: { color: 'rgba(255,255,255,0.7)' } },
        labels: { style: { colors: 'rgba(255,255,255,0.7)' } }
      }
    ],
    dataLabels: { enabled: false },
    legend: {
      labels: { colors: 'rgba(255,255,255,0.7)' }
    },
    tooltip: {
      shared: true,
      theme: 'dark'
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.1)'
    }
  };

  const series = [
    { name: 'Revenue (EUR)', type: 'area', data: [1200, 2800, 1000, 3400] },
    { name: 'Channels', type: 'line', data: [1, 2, 1, 4] }
  ];

  return (
    <div id="chart.revenueChannels" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
        Revenue & Channels
      </h3>
      <Chart options={options} series={series} type="area" height={300} />
    </div>
  );
};

export const DialogsSentReceivedChart: React.FC = () => {
  const options: ApexOptions = {
    chart: {
      type: 'area',
      background: 'transparent',
      toolbar: { show: false },
      fontFamily: 'inherit'
    },
    theme: { mode: 'dark' },
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
      labels: { style: { colors: 'rgba(255,255,255,0.7)' } }
    },
    yaxis: {
      labels: { style: { colors: 'rgba(255,255,255,0.7)' } }
    },
    dataLabels: { enabled: false },
    legend: {
      labels: { colors: 'rgba(255,255,255,0.7)' }
    },
    tooltip: {
      shared: true,
      theme: 'dark'
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.1)'
    }
  };

  const series = [
    { name: 'Received', type: 'area', data: [320, 420, 520, 518] },
    { name: 'Sent', type: 'line', data: [208, 273, 338, 337] }
  ];

  return (
    <div id="chart.dialogsSentReceived" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
        Dialogs Sent & Received
      </h3>
      <Chart options={options} series={series} type="area" height={300} />
    </div>
  );
};

export const ByChannelChart: React.FC = () => {
  const total = 1780;
  const whatsapp = Math.round(total * 0.57);
  const instagram = Math.round(total * 0.25);
  const gmail = Math.round(total * 0.12);
  const others = total - whatsapp - instagram - gmail;

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      background: 'transparent',
      fontFamily: 'inherit'
    },
    theme: { mode: 'dark' },
    labels: ['WhatsApp', 'Instagram', 'Gmail', 'Others'],
    colors: ['#00D4FF', '#00B388', '#FFD166', '#888888'],
    legend: {
      labels: { colors: 'rgba(255,255,255,0.7)' },
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
      theme: 'dark',
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
      <Chart options={options} series={series} type="donut" height={300} />
    </div>
  );
};

export const ClientTypesChart: React.FC = () => {
  const options: ApexOptions = {
    chart: {
      type: 'pie',
      background: 'transparent',
      fontFamily: 'inherit'
    },
    theme: { mode: 'dark' },
    labels: ['no link sent', 'unpaid', 'paid'],
    colors: ['#B5B5C3', '#FFD166', '#24D39A'],
    legend: {
      labels: { colors: 'rgba(255,255,255,0.7)' },
      position: 'bottom',
      formatter: function(seriesName, opts) {
        const val = opts.w.globals.series[opts.seriesIndex];
        if (seriesName === 'unpaid') {
          return `${seriesName} — ${val} (€8,340)`;
        }
        if (seriesName === 'paid') {
          return `${seriesName} — ${val} (€8,400)`;
        }
        return `${seriesName} — ${val}`;
      }
    },
    dataLabels: {
      enabled: true,
      style: { colors: ['#fff'] }
    },
    tooltip: {
      theme: 'dark'
    }
  };

  const series = [970, 460, 350];

  return (
    <div id="chart.clientTypes" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
        Client Types
      </h3>
      <Chart options={options} series={series} type="pie" height={300} />
    </div>
  );
};

export const ByCompanyChart: React.FC = () => {
  const options: ApexOptions = {
    chart: {
      type: 'donut',
      background: 'transparent',
      fontFamily: 'inherit'
    },
    theme: { mode: 'dark' },
    labels: ['Surf Group Lessons', 'Consulting Services'],
    colors: ['#00D4FF', '#00B388'],
    legend: {
      labels: { colors: 'rgba(255,255,255,0.7)' },
      position: 'bottom'
    },
    dataLabels: {
      enabled: true,
      style: { colors: ['#fff'] }
    },
    tooltip: {
      theme: 'dark'
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
              color: 'rgba(255,255,255,0.7)',
              formatter: () => '1,780'
            }
          }
        }
      }
    }
  };

  const series = [500, 1280];

  return (
    <div id="chart.byCompany" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
        Messages by Company
      </h3>
      <Chart options={options} series={series} type="donut" height={300} />
    </div>
  );
};

export const AnsweredMissedChart: React.FC = () => {
  const options: ApexOptions = {
    chart: {
      type: 'donut',
      background: 'transparent',
      fontFamily: 'inherit'
    },
    theme: { mode: 'dark' },
    labels: ['Answered', 'Missed'],
    colors: ['#24D39A', '#FF5C5C'],
    legend: {
      labels: { colors: 'rgba(255,255,255,0.7)' },
      position: 'bottom'
    },
    dataLabels: {
      enabled: true,
      style: { colors: ['#fff'] }
    },
    tooltip: {
      theme: 'dark'
    }
  };

  const series = [1691, 89];

  return (
    <div id="chart.answeredMissed" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
        Answered vs Missed
      </h3>
      <Chart options={options} series={series} type="donut" height={300} />
    </div>
  );
};

export const AvgResponseChart: React.FC = () => {
  const options: ApexOptions = {
    chart: {
      type: 'radialBar',
      background: 'transparent',
      fontFamily: 'inherit'
    },
    theme: { mode: 'dark' },
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
            color: 'rgba(255,255,255,0.7)',
            offsetY: -10
          },
          value: {
            fontSize: '32px',
            color: '#00B388',
            fontWeight: 700,
            formatter: () => '8s'
          }
        }
      }
    },
    fill: {
      colors: ['#00B388']
    },
    labels: ['Avg Response']
  };

  const series = [80];

  return (
    <div id="chart.avgResponse" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
        Average Response Time
      </h3>
      <Chart options={options} series={series} type="radialBar" height={300} />
    </div>
  );
};

export const ClientTypeBarChart: React.FC = () => {
  const options: ApexOptions = {
    chart: {
      type: 'bar',
      background: 'transparent',
      toolbar: { show: false },
      fontFamily: 'inherit'
    },
    theme: { mode: 'dark' },
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
        const percentages = [54.5, 25.8, 19.7];
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
      labels: { style: { colors: 'rgba(255,255,255,0.7)' } }
    },
    yaxis: {
      labels: { style: { colors: 'rgba(255,255,255,0.7)' } }
    },
    legend: {
      show: false
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: function(val, opts) {
          const index = opts.dataPointIndex;
          if (index === 1) {
            return `${val} (unpaid €8,340)`;
          } else if (index === 2) {
            return `${val} (paid €8,400)`;
          }
          return val.toString();
        }
      }
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.1)'
    }
  };

  const series = [{ name: 'Count', data: [970, 460, 350] }];

  return (
    <div id="chart.clientTypeBar" className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
        Client Type Distribution
      </h3>
      <Chart options={options} series={series} type="bar" height={300} />
    </div>
  );
};
