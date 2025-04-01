import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    width: '100%',
    height: '100%',
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#E3F2FD', // Lighter blue for a more modern look
    padding: 12,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2196F3' // More subtle border
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  logo: {
    width: 60,
    height: 60
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D47A1', // Darker blue for better contrast
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  subTitle: {
    fontSize: 12,
    color: '#1565C0', // Slightly darker than background for readability
    textAlign: 'center',
    marginTop: 4
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: '#0D47A1' // Matching with main title
  },
  period: {
    fontSize: 12,
    color: '#616161', // Darker gray for better readability
    textAlign: 'center',
    marginBottom: 20
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 0.5, // Thinner border for a more elegant look
    borderColor: '#90CAF9', // Lighter blue border
    borderRadius: 4, // Slightly rounded corners
    overflow: 'hidden' // Ensures the rounded corners are respected
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#BBDEFB', // Very light blue for row borders
    borderBottomWidth: 0.5 // Thinner lines
  },
  tableRowEven: {
    backgroundColor: '#F8FBFF' // Very subtle background for even rows
  },
  tableHeader: {
    backgroundColor: '#2196F3', // More vibrant blue for header
    padding: 8,
    fontWeight: 'bold',
    borderRightStyle: 'solid',
    borderRightWidth: 0.5,
    borderRightColor: '#90CAF9', // Lighter blue for cell borders
    fontSize: 10,
    textAlign: 'center',
    color: 'white' // White text for better contrast
  },
  tableCell: {
    padding: 6,
    borderRightStyle: 'solid',
    borderRightWidth: 0.5,
    borderRightColor: '#BBDEFB', // Very light blue for cell borders
    fontSize: 9,
    textAlign: 'center'
  },
  lastColumn: {
    borderRightWidth: 0 // Remove right border on last column
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#757575'
  }
});

const PdfReport = ({ data, module, startDate, endDate }) => {
  // Define column widths based on module type
  const getColumnWidths = () => {
    switch(module) {
      case 'tasks':
           return ['12%', '12%', '11%', '20%', '20%', '9%', '25%', '11%'];
            case 'movements':
              return ['10%', '10%', '10%', '10%', '9%', '18%', '18%', '10%', '10%'];
            case 'training':
              return ['10%', '10%', '9%', '9%', '18%', '18%', '18%', '9%', '9%'];
      default:
        return [];
    }
  };

  // Get appropriate headers based on module type
  const getHeaders = () => {
    switch(module) {
      case 'tasks': return ['Date', 'Task No', 'Aircraft', 'Route', 'Purpose', 'ETD', 'Crew', 'Authority'];
      case 'movements': return ['Date', 'Call Sign', 'Aircraft', 'Dept', 'ATD', 'Enroute', 'Purpose', 'Dest', 'ATA'];
      case 'training': return ['Date', 'Call Sign', 'A/C', 'ATD', 'Route', 'Duty', 'Crew', 'ATA', 'Duration'];
      default: return [];
    }
  };

  // Map data fields to table columns based on module
  const mapDataToColumns = (item) => {
    switch(module) {
      case 'tasks':
        return [
          item.date_of_flight || '',
          item.task_number || '',
          item.aircraft_type || '',
          item.route || '',
          item.purpose || '',
          item.estimated_time_of_departure || '',
          item.crew || '',
          item.authority || ''
        ];
      case 'movements':
        return [
          item.date_of_flight || '',
          item.call_sign || '',
          item.aircraft_type || '',
          item.dept_aerod || '',
          item.atd || '',
          item.enroute_estimates || '',
          item.purpose || '',
          item.dest_aerod || '',
          item.ata || ''
        ];
      case 'training':
        return [
          item.date_of_flight || '',
          item.call_sign || '',
          item.aircraft_type || '',
          item.atd || '',
          item.route || '',
          item.duty || '',
          item.crew || '',
          item.ata || '',
          item.total_flight_time || ''
        ];
      default:
        return [];
    }
  };

  // Get the report title based on module
  const getReportTitle = () => {
    switch(module) {
      case 'tasks': return 'Aircraft Tasks Report';
      case 'movements': return 'Aircraft Movements Report';
      case 'training': return 'Training Flights Report';
      default: return 'Report';
    }
  };

  const headers = getHeaders();
  const columnWidths = getColumnWidths();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              src="/ZAF-LOGO.png"
            />
            <View style={styles.headerCenter}>
              <Text style={styles.mainTitle}>ZAMBIA AIR FORCE</Text>
              <Text style={styles.subTitle}>ADVANCED AIRCRAFT MANAGEMENT SYSTEM</Text>
            </View>
            <Image
              style={styles.logo}
              src="/zaf-roundel.png"
            />
          </View>
        </View>

        <Text style={styles.reportTitle}>{getReportTitle()}</Text>
        <Text style={styles.period}>
          For period {formatDate(startDate)} - {formatDate(endDate)}
        </Text>

        {/* Table */}
        <View style={styles.table}>
          {/* Table header */}
          <View style={styles.tableRow}>
            {headers.map((header, index) => (
              <View
                key={index}
                style={[
                  styles.tableHeader,
                  { width: `${columnWidths[index]}%` },
                  index === headers.length - 1 && styles.lastColumn
                ]}
              >
                <Text>{header}</Text>
              </View>
            ))}
          </View>

          {/* Table rows */}
          {data.map((item, rowIndex) => {
            const rowData = mapDataToColumns(item);
            return (
              <View
                key={rowIndex}
                style={[
                  styles.tableRow,
                  rowIndex % 2 === 1 && styles.tableRowEven
                ]}
              >
                {rowData.map((cellData, cellIndex) => (
                  <View
                    key={cellIndex}
                    style={[
                      styles.tableCell,
                      { width: `${columnWidths[cellIndex]}%` },
                      cellIndex === rowData.length - 1 && styles.lastColumn
                    ]}
                  >
                    <Text>{cellData}</Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>

        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString('en-GB')} | ZAMBIA AIR FORCE - ADVANCED AIRCRAFT MANAGEMENT SYSTEM
        </Text>
      </Page>
    </Document>
  );
};

export default PdfReport;