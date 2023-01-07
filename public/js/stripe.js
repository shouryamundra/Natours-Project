/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51JG1qXKUkCNFWE4OUbi2rA9M8qJfqOuCFRPdnTHNTUsVpOzdUPDkXWbznHWGG417sdG9Sl4dBjEECMvU7WjbkDAL00viRvassn'
);

export const bookTour = async tourId => {
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // console.log(session);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
