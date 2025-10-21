import { select } from "@evershop/postgres-query-builder";
import { pool } from "@evershop/evershop/lib/postgres";
export default ((request, response, next)=>{
    const current = request.getCurrentCustomer();
    if (!current?.customer_id) {
        response.status(401).json({
            success: false,
            message: "Customer is not logged in"
        });
        return;
    }
    const addresses = select().from("customer_address").where("customer_id", "=", current.customer_id).load(pool);
    addresses.then((data)=>{
        response.status(200).json({
            success: true,
            data: {
                customer: current,
                addresses: data
            }
        });
    }).catch((error)=>{
        response.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    });
});

