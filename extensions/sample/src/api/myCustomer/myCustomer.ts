import { EvershopRequest, EvershopResponse } from '@evershop/evershop';

export default (request: EvershopRequest, response: EvershopResponse, next) => {
  
  const current = request.getCurrentCustomer();
  
    // Respond with the created foo item
  response.status(200).json({
    success: true,
    data: {
      customer: current
    }
  });
};
