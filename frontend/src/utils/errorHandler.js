export const handleApiError = (error, setError) => {
  if (error.response) {
    setError(error.response.data.message || 'An error occurred');
  } else if (error.request) {
    setError('Network error. Please check your connection.');
  } else {
    setError('An unexpected error occurred.');
  }
};