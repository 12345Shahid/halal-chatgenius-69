
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

type VisualizationProps = {
  data: any;
  type: "chart" | "table" | "list" | "timeline";
  title: string;
};

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const VisualizationRenderer: React.FC<VisualizationProps> = ({ data, type, title }) => {
  // Helper to determine chart type from data structure
  const determineChartType = () => {
    if (!data) return null;

    // If data has labels and values, it's likely a bar or pie chart
    if (data.labels && data.values) {
      // If there are many data points, default to bar chart
      return data.labels.length > 5 ? 'bar' : 'pie';
    }
    
    // If data has x and y values or multiple series, it's likely a line chart
    if (data.series || (data[0] && (data[0].x !== undefined || data[0].date !== undefined))) {
      return 'line';
    }
    
    // Default to bar chart
    return 'bar';
  };

  // Format data for charts if needed
  const formatChartData = () => {
    if (!data) return [];
    
    // If data is already an array of objects ready for recharts
    if (Array.isArray(data) && typeof data[0] === 'object') {
      return data;
    }
    
    // If data has labels and values, format for recharts
    if (data.labels && data.values) {
      return data.labels.map((label: string, index: number) => ({
        name: label,
        value: data.values[index]
      }));
    }
    
    // Return empty array as fallback
    return [];
  };

  const renderChart = () => {
    const chartType = data.chartType || determineChartType();
    const formattedData = formatChartData();
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {formattedData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return <div className="text-center text-muted-foreground">Unable to render chart</div>;
    }
  };

  const renderTable = () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return <div className="text-center text-muted-foreground">No data available</div>;
    }
    
    // Get column headers from the first object's keys
    const columns = Object.keys(data[0]);
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              {columns.map((column, index) => (
                <th key={index} className="p-2 text-left border border-border">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="p-2 border border-border">{row[column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderList = () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return <div className="text-center text-muted-foreground">No list items available</div>;
    }
    
    // Check if data is an array of strings or objects
    const isSimpleList = typeof data[0] !== 'object';
    
    if (isSimpleList) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {data.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }
    
    // If it's an array of objects, render as a more complex list
    return (
      <ul className="divide-y divide-border">
        {data.map((item, index) => (
          <li key={index} className="py-3">
            {Object.entries(item).map(([key, value]) => (
              <div key={key}>
                <span className="font-medium">{key}: </span>
                <span>{String(value)}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    );
  };

  const renderTimeline = () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return <div className="text-center text-muted-foreground">No timeline events available</div>;
    }
    
    return (
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
        <ul className="space-y-4 ml-8">
          {data.map((event, index) => (
            <li key={index} className="relative">
              <div className="absolute -left-8 top-1.5 w-4 h-4 rounded-full bg-primary"></div>
              <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
                <div className="font-semibold text-sm">{event.date || event.time || event.title}</div>
                <div className="text-sm mt-1">{event.description || event.content}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Render different visualization based on type
  const renderVisualization = () => {
    try {
      switch (type) {
        case 'chart':
          return renderChart();
        case 'table':
          return renderTable();
        case 'list':
          return renderList();
        case 'timeline':
          return renderTimeline();
        default:
          return <div className="text-center text-muted-foreground">Unsupported visualization type</div>;
      }
    } catch (error) {
      console.error("Error rendering visualization:", error);
      return (
        <div className="text-center text-destructive">
          <p>Error rendering visualization</p>
          <p className="text-xs">Please check the console for details</p>
        </div>
      );
    }
  };

  return (
    <div className="visualization-container">
      {renderVisualization()}
    </div>
  );
};

export default VisualizationRenderer;
