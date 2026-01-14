import React from 'react';
import { View, Text } from 'react-native';
import { VictoryChart, VictoryLine, VictoryBar, VictoryPie, VictoryAxis, VictoryTheme } from 'victory';
import { Platform } from 'react-native';

interface ChartData {
  x: string | number;
  y: number;
  label?: string;
}

interface ChartProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'pie';
  title?: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  width?: number;
  color?: string;
  colors?: string[];
}

export function Chart({ 
  data, 
  type, 
  title, 
  xLabel, 
  yLabel, 
  height = 300, 
  width, 
  color = '#5B21B6',
  colors = ['#5B21B6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']
}: ChartProps) {
  const chartWidth = width || (Platform.OS === 'web' ? 600 : 350);

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <VictoryChart
            theme={VictoryTheme.material}
            height={height}
            width={chartWidth}
            padding={{ left: 60, top: 20, right: 20, bottom: 60 }}
          >
            <VictoryAxis dependentAxis />
            <VictoryAxis />
            <VictoryLine
              data={data}
              style={{
                data: { stroke: color, strokeWidth: 2 },
              }}
              animate={{
                duration: 2000,
                onLoad: { duration: 1000 }
              }}
            />
          </VictoryChart>
        );

      case 'bar':
        return (
          <VictoryChart
            theme={VictoryTheme.material}
            height={height}
            width={chartWidth}
            padding={{ left: 60, top: 20, right: 20, bottom: 60 }}
          >
            <VictoryAxis dependentAxis />
            <VictoryAxis />
            <VictoryBar
              data={data}
              style={{
                data: { fill: color },
              }}
              animate={{
                duration: 2000,
                onLoad: { duration: 1000 }
              }}
            />
          </VictoryChart>
        );

      case 'pie':
        return (
          <VictoryPie
            data={data}
            height={height}
            width={chartWidth}
            colorScale={colors}
            animate={{
              duration: 2000,
              onLoad: { duration: 1000 }
            }}
            labelRadius={({ innerRadius }) => innerRadius + 20}
            style={{
              labels: { fontSize: 12, fill: 'white' }
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={Platform.OS === 'web' ? { className: "bg-white rounded-lg p-4 shadow-sm" } : { backgroundColor: 'white', borderRadius: 8, padding: 16 }}>
      {title && (
        <Text style={Platform.OS === 'web' ? { className: "text-lg font-semibold text-gray-900 mb-4 text-center" } : { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16, textAlign: 'center' }}>
          {title}
        </Text>
      )}
      {renderChart()}
      {(xLabel || yLabel) && (
        <View style={Platform.OS === 'web' ? { className: "flex-row justify-between mt-2" } : { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          {xLabel && (
            <Text style={Platform.OS === 'web' ? { className: "text-sm text-gray-600" } : { fontSize: 14, color: '#6B7280' }}>{xLabel}</Text>
          )}
          {yLabel && (
            <Text style={Platform.OS === 'web' ? { className: "text-sm text-gray-600" } : { fontSize: 14, color: '#6B7280' }}>{yLabel}</Text>
          )}
        </View>
      )}
    </View>
  );
}
