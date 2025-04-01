import React from 'react';

const Pagination = ({ tasksPerPage, totalTasks, currentPage, setCurrentPage }) => {
  const pageNumbers = [];

  // Calculate total pages
  for (let i = 1; i <= Math.ceil(totalTasks / tasksPerPage); i++) {
    pageNumbers.push(i);
  }

  // Go to previous page
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Go to next page
  const handleNext = () => {
    if (currentPage < pageNumbers.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center mt-6">
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * tasksPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * tasksPerPage, totalTasks)}
              </span>{' '}
              of <span className="font-medium">{totalTasks}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              {/* Previous Page Button */}
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Page Numbers */}
              {pageNumbers.map(number => {
                // Show current page, 2 pages before and after current page
                const showPageNumber =
                  number === 1 ||
                  number === pageNumbers.length ||
                  (number >= currentPage - 2 && number <= currentPage + 2);

                // Show ellipsis
                const showEllipsisBefore = number === currentPage - 3 && currentPage > 4;
                const showEllipsisAfter = number === currentPage + 3 && currentPage < pageNumbers.length - 3;

                if (showEllipsisBefore) {
                  return (
                    <span key={`ellipsis-before-${number}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  );
                }

                if (showEllipsisAfter) {
                  return (
                    <span key={`ellipsis-after-${number}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  );
                }

                if (showPageNumber) {
                  return (
                    <button
                      key={number}
                      onClick={() => setCurrentPage(number)}
                      aria-current={currentPage === number ? "page" : undefined}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        currentPage === number
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      } text-sm font-medium`}
                    >
                      {number}
                    </button>
                  );
                }

                return null;
              })}

              {/* Next Page Button */}
              <button
                onClick={handleNext}
                disabled={currentPage === pageNumbers.length}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === pageNumbers.length ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>

        {/* Mobile View */}
        <div className="flex items-center justify-between w-full sm:hidden">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === 1 ? 'text-gray-300 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <div className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{pageNumbers.length}</span>
          </div>
          <button
            onClick={handleNext}
            disabled={currentPage === pageNumbers.length}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === pageNumbers.length ? 'text-gray-300 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;