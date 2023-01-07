/*eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateTour = async (tourId, summary) => {
  console.log(tourId, summary);
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/tours/${tourId}`,
      data: {
        summary
      }
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Review updated successfuly!', 2);
      window.setTimeout(() => {
        location.reload();
      }, 2000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const deleteTour = async tourId => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/tours/${tourId}`
    });

    if (!res.data) {
      showAlert('success', 'Tour deleted successfully!', 1);
      window.setTimeout(() => location.reload(), 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
