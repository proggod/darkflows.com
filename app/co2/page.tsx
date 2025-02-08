'use client';

import React, { useState } from 'react';
import TopNavBar from '@/app/components/TopNavBar';

interface CO2Data {
  country: string;
  totalEmissions: number; // in Mt
  population: number; // in millions
  perCapitaEmissions: number; // in t
  sequestration: number; // in Mt
  netContribution: number; // in Mt
  netPerCapita: number; // in t
}

// Updated dataset
const co2Data: CO2Data[] = [
  { country: 'China', totalEmissions: 12667, population: 1425, perCapitaEmissions: 8.89, sequestration: 1000, netContribution: 11667, netPerCapita: 8.19 },
  { country: 'United States', totalEmissions: 4854, population: 342, perCapitaEmissions: 14.21, sequestration: 500, netContribution: 4354, netPerCapita: 12.73 },
  { country: 'India', totalEmissions: 2693, population: 1425, perCapitaEmissions: 1.89, sequestration: 300, netContribution: 2393, netPerCapita: 1.68 },
  { country: 'Russia', totalEmissions: 1909, population: 146, perCapitaEmissions: 13.11, sequestration: 500, netContribution: 1409, netPerCapita: 9.65 },
  { country: 'Japan', totalEmissions: 1083, population: 125, perCapitaEmissions: 8.66, sequestration: 50, netContribution: 1033, netPerCapita: 8.26 },
  { country: 'Germany', totalEmissions: 702, population: 83, perCapitaEmissions: 8.46, sequestration: 30, netContribution: 672, netPerCapita: 8.10 },
  { country: 'Iran', totalEmissions: 686, population: 90, perCapitaEmissions: 7.62, sequestration: 20, netContribution: 666, netPerCapita: 7.40 },
  { country: 'Saudi Arabia', totalEmissions: 601, population: 36, perCapitaEmissions: 16.69, sequestration: 10, netContribution: 591, netPerCapita: 16.42 },
  { country: 'South Korea', totalEmissions: 611, population: 52, perCapitaEmissions: 11.75, sequestration: 10, netContribution: 601, netPerCapita: 11.56 },
  { country: 'Canada', totalEmissions: 738, population: 38, perCapitaEmissions: 19.42, sequestration: 100, netContribution: 638, netPerCapita: 16.79 },
  { country: 'Indonesia', totalEmissions: 692, population: 279, perCapitaEmissions: 2.48, sequestration: 200, netContribution: 492, netPerCapita: 1.76 },
  { country: 'Mexico', totalEmissions: 500, population: 128, perCapitaEmissions: 3.91, sequestration: 50, netContribution: 450, netPerCapita: 3.52 },
  { country: 'Brazil', totalEmissions: 457, population: 213, perCapitaEmissions: 2.15, sequestration: 500, netContribution: -43, netPerCapita: -0.20 },
  { country: 'South Africa', totalEmissions: 452, population: 60, perCapitaEmissions: 7.53, sequestration: 20, netContribution: 432, netPerCapita: 7.20 },
  { country: 'Australia', totalEmissions: 400, population: 26, perCapitaEmissions: 15.38, sequestration: 50, netContribution: 350, netPerCapita: 13.46 },
  { country: 'United Kingdom', totalEmissions: 400, population: 67, perCapitaEmissions: 5.97, sequestration: 30, netContribution: 370, netPerCapita: 5.52 },
  { country: 'Turkey', totalEmissions: 400, population: 85, perCapitaEmissions: 4.71, sequestration: 20, netContribution: 380, netPerCapita: 4.47 },
  { country: 'Italy', totalEmissions: 350, population: 60, perCapitaEmissions: 5.83, sequestration: 20, netContribution: 330, netPerCapita: 5.50 },
  { country: 'France', totalEmissions: 300, population: 65, perCapitaEmissions: 4.62, sequestration: 30, netContribution: 270, netPerCapita: 4.15 },
  { country: 'Poland', totalEmissions: 300, population: 38, perCapitaEmissions: 7.89, sequestration: 10, netContribution: 290, netPerCapita: 7.63 },
  { country: 'Spain', totalEmissions: 250, population: 47, perCapitaEmissions: 5.32, sequestration: 25, netContribution: 225, netPerCapita: 4.79 },
  { country: 'Ukraine', totalEmissions: 200, population: 41, perCapitaEmissions: 4.88, sequestration: 50, netContribution: 150, netPerCapita: 3.66 },
  { country: 'Argentina', totalEmissions: 190, population: 45, perCapitaEmissions: 4.22, sequestration: 40, netContribution: 150, netPerCapita: 3.33 },
  { country: 'Thailand', totalEmissions: 180, population: 70, perCapitaEmissions: 2.57, sequestration: 20, netContribution: 160, netPerCapita: 2.29 },
  { country: 'Malaysia', totalEmissions: 170, population: 32, perCapitaEmissions: 5.31, sequestration: 15, netContribution: 155, netPerCapita: 4.84 },
  { country: 'Egypt', totalEmissions: 160, population: 104, perCapitaEmissions: 1.54, sequestration: 10, netContribution: 150, netPerCapita: 1.44 },
  { country: 'Vietnam', totalEmissions: 150, population: 98, perCapitaEmissions: 1.53, sequestration: 15, netContribution: 135, netPerCapita: 1.38 },
  { country: 'Philippines', totalEmissions: 140, population: 113, perCapitaEmissions: 1.24, sequestration: 20, netContribution: 120, netPerCapita: 1.06 },
  { country: 'Pakistan', totalEmissions: 135, population: 231, perCapitaEmissions: 0.58, sequestration: 15, netContribution: 120, netPerCapita: 0.52 },
  { country: 'Nigeria', totalEmissions: 130, population: 213, perCapitaEmissions: 0.61, sequestration: 20, netContribution: 110, netPerCapita: 0.52 },
  { country: 'Bangladesh', totalEmissions: 100, population: 169, perCapitaEmissions: 0.59, sequestration: 10, netContribution: 90, netPerCapita: 0.53 },
  { country: 'Ethiopia', totalEmissions: 50, population: 126, perCapitaEmissions: 0.40, sequestration: 30, netContribution: 20, netPerCapita: 0.16 },
  { country: 'Democratic Republic of the Congo', totalEmissions: 30, population: 95, perCapitaEmissions: 0.32, sequestration: 20, netContribution: 10, netPerCapita: 0.11 }
];

const SortableTable: React.FC = () => {
  const [data] = useState<CO2Data[]>(co2Data);
  const [sortConfig, setSortConfig] = useState<{ key: keyof CO2Data; direction: 'ascending' | 'descending' } | null>(null);

  // Sorting function
  const sortedData = React.useMemo(() => {
    if (sortConfig !== null) {
      return [...data].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return data;
  }, [data, sortConfig]);

  // Click handler for sorting
  const requestSort = (key: keyof CO2Data) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const columnLabels: Record<keyof CO2Data, string> = {
    country: 'Country',
    totalEmissions: 'Total Emissions',
    population: 'Population',
    perCapitaEmissions: 'Per Capita Emissions',
    sequestration: 'Sequestration',
    netContribution: 'Net Contribution',
    netPerCapita: 'Net Per Capita'
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-white">CO₂ Emissions by Country</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-900">
            <tr>
              {Object.entries(columnLabels).map(([key, label]) => (
                <th
                  key={key}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-800 text-left text-sm font-medium text-gray-300"
                  onClick={() => requestSort(key as keyof CO2Data)}
                >
                  <div className="flex items-center gap-1">
                    {label}
                    {sortConfig?.key === key && (
                      <span className="text-blue-400">
                        {sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sortedData.map((item, index) => (
              <tr 
                key={index} 
                className="bg-gray-900/50 hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-4 py-3 text-white">{item.country}</td>
                <td className="px-4 py-3 text-gray-300">{item.totalEmissions.toLocaleString()} Mt</td>
                <td className="px-4 py-3 text-gray-300">{item.population.toLocaleString()} M</td>
                <td className="px-4 py-3 text-gray-300">{item.perCapitaEmissions.toFixed(2)} t</td>
                <td className="px-4 py-3 text-gray-300">{item.sequestration.toLocaleString()} Mt</td>
                <td className="px-4 py-3 text-gray-300">{item.netContribution.toLocaleString()} Mt</td>
                <td className="px-4 py-3 text-gray-300">{item.netPerCapita.toFixed(2)} t</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function EmissionsPage() {
  return (
    <main className="min-h-screen bg-black">
      <TopNavBar />
      <div className="pt-16">
        <SortableTable />
      </div>
    </main>
  );
} 