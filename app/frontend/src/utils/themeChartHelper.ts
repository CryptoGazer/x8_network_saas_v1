export const getChartTextColor = (): string => {
  const htmlElement = document.documentElement;
  const currentTheme = htmlElement.getAttribute('data-theme');

  return currentTheme === 'light' ? '#0B0B0B' : '#FFFFFF';
};

export const getChartAxisColor = (): string => {
  const htmlElement = document.documentElement;
  const currentTheme = htmlElement.getAttribute('data-theme');

  return currentTheme === 'light' ? 'rgba(11, 11, 11, 0.7)' : 'rgba(255, 255, 255, 0.7)';
};

export const getChartGridColor = (): string => {
  const htmlElement = document.documentElement;
  const currentTheme = htmlElement.getAttribute('data-theme');

  return currentTheme === 'light' ? 'rgba(11, 11, 11, 0.1)' : 'rgba(255, 255, 255, 0.1)';
};

export const getChartThemeMode = (): 'light' | 'dark' => {
  const htmlElement = document.documentElement;
  const currentTheme = htmlElement.getAttribute('data-theme');

  return currentTheme === 'light' ? 'light' : 'dark';
};

export const getChartTooltipTheme = (): string => {
  const htmlElement = document.documentElement;
  const currentTheme = htmlElement.getAttribute('data-theme');

  return currentTheme === 'light' ? 'light' : 'dark';
};

export const applyThemeToCharts = (theme: 'light' | 'dark') => {
  const textColor = theme === 'light' ? '#0B0B0B' : '#FFFFFF';
  const axisColor = theme === 'light' ? 'rgba(11, 11, 11, 0.7)' : 'rgba(255, 255, 255, 0.7)';

  const chartLabels = document.querySelectorAll<HTMLElement>(
    '.chart-label, .chart-annotation, .chart-legend-text, .chart-value, .apexcharts-text'
  );

  chartLabels.forEach(label => {
    label.style.fill = textColor;
    label.style.color = textColor;
  });

  const legendText = document.querySelectorAll<HTMLElement>('.apexcharts-legend-text');
  legendText.forEach(text => {
    text.style.color = textColor;
  });

  const axisText = document.querySelectorAll<HTMLElement>('.apexcharts-xaxis-label, .apexcharts-yaxis-label');
  axisText.forEach(text => {
    text.style.fill = axisColor;
  });
};

export const observeThemeChanges = (callback: (theme: 'light' | 'dark') => void) => {
  const htmlElement = document.documentElement;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        const theme = htmlElement.getAttribute('data-theme') as 'light' | 'dark' || 'dark';
        callback(theme);
      }
    });
  });

  observer.observe(htmlElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  return () => observer.disconnect();
};
