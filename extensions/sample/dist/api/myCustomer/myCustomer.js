export default ((request, response, next)=>{
    const current = request.getCurrentCustomer();
    // Respond with the created foo item
    response.status(200).json({
        success: true,
        data: {
            customer: current
        }
    });
});

