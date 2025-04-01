import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { pdf } from '@react-pdf/renderer';
import PdfReport from './pdfReport';
import { saveAs } from 'file-saver';
import { normalizeText } from '../../utils';
import SideMenu from '../SideMenu';
import { useNavigate } from 'react-router-dom';

const Reports = () => {
  const [selectedModule, setSelectedModule] = useState('tasks');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isViewingReport, setIsViewingReport] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);
  const navigate = useNavigate();

  const moduleOptions = [
    { value: 'tasks', label: 'Aircraft Task Manager' },
    { value: 'movements', label: 'Aircraft Movement Manager' },
    { value: 'training', label: 'Training Flights' },
  ];

  useEffect(() => {
    // Set default dates to last 14 days
    const setDefaultDates = () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 1);

      setEndDate(end.toISOString().split('T')[0]);
      setStartDate(start.toISOString().split('T')[0]);
    };

    setDefaultDates();

    // Clear any existing data when component mounts
    setReportData([]);
    setFilteredData([]);
    setHasGeneratedReport(false);

    // Cleanup function to reset when component unmounts
    return () => {
      setReportData([]);
      setFilteredData([]);
      setHasGeneratedReport(false);
    };
  }, []);

  // Handle module change - clear existing data
  const handleModuleChange = (newModule) => {
    setSelectedModule(newModule);
    // Only clear the data if we're not regenerating immediately
    if (!loading) {
      setReportData([]);
      setFilteredData([]);
      setHasGeneratedReport(false);
      setIsViewingReport(false);
      setError('');
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:5000/api/reports`, {
        params: {
          module: selectedModule,
          startDate,
          endDate
        }
      });

      if (response.data.length === 0) {
        setError('No data found for the selected period');
      }

      setReportData(response.data);
      setFilteredData(response.data);
      setHasGeneratedReport(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch report data');
    }
    setLoading(false);
  };

  useEffect(() => {
    // Fetch current user if needed
    const fetchCurrentUser = async () => {
      try {
        const user = localStorage.getItem('currentUser') || 'Guest';
        setCurrentUser(user);
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      }
    };

    fetchCurrentUser();
  }, []);


  useEffect(() => {
    if (reportData.length > 0) {
      const results = reportData.filter(item => {
        const normalizedTerm = normalizeText(searchTerm);
        return Object.values(item).some(value =>
          normalizeText(String(value)).includes(normalizedTerm)
        );
      });
      setFilteredData(results.sort((a, b) =>
        new Date(b.date_of_flight) - new Date(a.date_of_flight)
      ));
    }
  }, [searchTerm, reportData]);

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    fetchReportData();
    setIsViewingReport(false);
  };

  const handleNavigateHome = () => {
      navigate('/home');
    };

  const toggleReportView = () => {
    setIsViewingReport(!isViewingReport);
  };

  const exportToPDF = async () => {
    if (filteredData.length === 0) return;

    const fileName = `${selectedModule}_report_${new Date().toISOString()}.pdf`;

    try {
      // Generate PDF blob
      const blob = await pdf(
        <PdfReport
          data={filteredData}
          module={selectedModule}
          startDate={startDate}
          endDate={endDate}
        />
      ).toBlob();

      // Save the blob using file-saver
      saveAs(blob, fileName);
    } catch (error) {
      console.error('PDF generation error:', error);
      setError('Failed to generate PDF document');
    }
  };

  const getModuleTitle = () => {
    switch(selectedModule) {
      case 'tasks': return 'Aircraft Tasks Report';
      case 'movements': return 'Aircraft Movements Report';
      case 'training': return 'Training Flights Report';
      default: return 'Report';
    }
  };

  const renderTableHeaders = () => {
    switch(selectedModule) {
      case 'tasks':
        return (
          <tr className="bg-gray-100 text-gray-700">
            <th className="px-4 py-2 border">DATE</th>
            <th className="px-4 py-2 border">TASK NO.</th>
            <th className="px-4 py-2 border">A/C TYPE</th>
            <th className="px-4 py-2 border">ROUTE</th>
            <th className="px-4 py-2 border">PURPOSE</th>
            <th className="px-4 py-2 border">ETD</th>
            <th className="px-4 py-2 border">CREW</th>
            <th className="px-4 py-2 border">AUTHORITY</th>
          </tr>
        );
      case 'movements':
        return (
          <tr className="bg-gray-100 text-gray-700">
            <th className="px-4 py-2 border">DATE</th>
            <th className="px-4 py-2 border">CALL SIGN</th>
            <th className="px-4 py-2 border">A/C TYPE</th>
            <th className="px-4 py-2 border">DEPT AEROD</th>
            <th className="px-4 py-2 border">ATD</th>
            <th className="px-4 py-2 border">ENROUTE ESTIMATES</th>
            <th className="px-4 py-2 border">PURPOSE</th>
            <th className="px-4 py-2 border">DEST AEROD</th>
            <th className="px-4 py-2 border">ATA</th>
          </tr>
        );
      case 'training':
        return (
          <tr className="bg-gray-100 text-gray-700">
            <th className="px-4 py-2 border">DATE</th>
            <th className="px-4 py-2 border">CALL SIGN</th>
            <th className="px-4 py-2 border">A/C TYPE</th>
            <th className="px-4 py-2 border">ATD</th>
            <th className="px-4 py-2 border">ROUTE</th>
            <th className="px-4 py-2 border">DUTY</th>
            <th className="px-4 py-2 border">CREW</th>
            <th className="px-4 py-2 border">ATA</th>
            <th className="px-4 py-2 border">DURATION</th>
          </tr>
        );
      default:
        return null;
    }
  };

  const renderTableRows = () => {
    return filteredData.map((item, index) => {
      const rowClass = index % 2 === 0 ? "bg-white" : "bg-gray-50";

      return (
        <tr key={index} className={rowClass}>
          {selectedModule === 'tasks' && (
            <>
              <td className="px-4 py-2 border">{item.date_of_flight}</td>
              <td className="px-4 py-2 border">{item.task_number}</td>
              <td className="px-4 py-2 border">{item.aircraft_type}</td>
              <td className="px-4 py-2 border">{item.route}</td>
              <td className="px-4 py-2 border">{item.purpose}</td>
              <td className="px-4 py-2 border">{item.estimated_time_of_departure}</td>
              <td className="px-4 py-2 border">{item.crew}</td>
              <td className="px-4 py-2 border">{item.authority}</td>
            </>
          )}
          {selectedModule === 'movements' && (
            <>
              <td className="px-4 py-2 border">{item.date_of_flight}</td>
              <td className="px-4 py-2 border">{item.call_sign}</td>
              <td className="px-4 py-2 border">{item.aircraft_type}</td>
              <td className="px-4 py-2 border">{item.dept_aerod}</td>
              <td className="px-4 py-2 border">{item.atd}</td>
              <td className="px-4 py-2 border">{item.enroute_estimates}</td>
              <td className="px-4 py-2 border">{item.purpose}</td>
              <td className="px-4 py-2 border">{item.dest_aerod}</td>
              <td className="px-4 py-2 border">{item.ata}</td>
            </>
          )}
          {selectedModule === 'training' && (
            <>
              <td className="px-4 py-2 border">{item.date_of_flight}</td>
              <td className="px-4 py-2 border">{item.call_sign}</td>
              <td className="px-4 py-2 border">{item.aircraft_type}</td>
              <td className="px-4 py-2 border">{item.atd}</td>
              <td className="px-4 py-2 border">{item.route}</td>
              <td className="px-4 py-2 border">{item.duty}</td>
              <td className="px-4 py-2 border">{item.crew}</td>
              <td className="px-4 py-2 border">{item.ata}</td>
              <td className="px-4 py-2 border">{item.total_flight_time}</td>
            </>
          )}
        </tr>
      );
    });
  };

 // PDF Report Preview component
 const ReportPreview = () => {
   return (
     <div className="bg-white p-6 border rounded-lg shadow-lg">
       <nav
             className="p-5"
             style={{
               background: 'linear-gradient(to right, white, #87CEEB, #1E90FF)', // White to sky blue to darker blue
             }}
           >
             <div className="container mx-auto flex justify-between items-center">
               <div className="flex items-center">
                 {/* ZAF emblem with white background */}
                 <img
                   src="/zaf-emblem.png"
                   alt="ZAF Emblem"
                   className="w-14 h-14"
                   style={{ cursor: 'default' }}
                   onClick={(e) => e.preventDefault()}
                 />
               </div>

               {/* Centered title */}
               <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
                 <h1 className="text-white text-3xl font-bold mb-1">ZAMBIA AIR FORCE</h1>
                 <h2 className="text-white text-1xl">ADVANCED AIRCRAFT MANAGEMENT SYSTEM</h2>
               </div>

               <div className="flex items-center">
                 {/* ZAF Roundel on right side */}
                 <img
                   src="/zaf-roundel.png"
                   alt="ZAF Roundel"
                   className="w-12 h-12"
                   style={{ cursor: 'default' }}
                   onClick={(e) => e.preventDefault()}
                 />
               </div>
             </div>
           </nav>

       <h3 className="text-lg font-bold mb-2">{getModuleTitle()}</h3>
       <p className="text-sm text-gray-600 mb-4">
         For period {startDate ? new Date(startDate).toLocaleDateString() : ''} - {endDate ? new Date(endDate).toLocaleDateString() : ''}
       </p>

       <div className="overflow-x-auto border rounded">
         <table className="min-w-full bg-white border-collapse">
           <thead>
             {renderTableHeaders()}
           </thead>
           <tbody className="divide-y divide-gray-200">
             {renderTableRows()}
           </tbody>
         </table>
       </div>

       <div className="mt-4 text-right">
         <p className="text-xs text-gray-500">This is a preview of how your PDF will appear</p>
       </div>
     </div>
   );
 };

  return (
    <div className="container mx-auto px-4 py-4">
    <SideMenu />
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Logged in as <span className="font-bold">{currentUser}</span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-center text-3xl font-bold text-gray-800">
            AIRCRAFT REPORTS MANAGER
          </h3>
          <div className="border-b-2 border-gray-300 w-1/4 mx-auto mb-6"></div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
              <select
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                value={selectedModule}
                onChange={(e) => handleModuleChange(e.target.value)}
              >
                {moduleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <input
                type="date"
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <input
                type="date"
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            {/* Left side - Generate button */}
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={handleGenerateReport}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>

             <div className="flex items-center gap-2">
                {hasGeneratedReport && filteredData.length > 0 && (
                  <>
                    <button
                      className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      onClick={toggleReportView}
                    >
                      {isViewingReport ? 'Hide Preview' : 'View Preview'}
                    </button>
               <button
                         className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                         onClick={exportToPDF}
                       >
                         Export PDF
                       </button>
                     </>
                   )}
                <button
                      onClick={handleNavigateHome}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>


          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}

          {/* Report Preview Section */}
          {isViewingReport && filteredData.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Report Preview</h3>
              <ReportPreview />
            </div>
          )}

          {/* Data Table Section (only show when not viewing the report preview and has generated report) */}
          {!isViewingReport && hasGeneratedReport && filteredData.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{getModuleTitle()}</h3>
                <div className="w-1/3">
                  <input
                    type="text"
                    placeholder="Search results..."
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto border rounded shadow">
                <table className="min-w-full bg-white border-collapse">
                  <thead>
                    {renderTableHeaders()}
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {renderTableRows()}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Showing {filteredData.length} results
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;