/*eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const deleteUser = async userId => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/users/${userId}`
    });

    if (!res.data) {
      showAlert('success', 'User deleted successfully!', 1);
      window.setTimeout(() => location.reload(), 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
