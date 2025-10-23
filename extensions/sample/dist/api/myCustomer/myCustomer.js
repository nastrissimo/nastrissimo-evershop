import { select } from "@evershop/postgres-query-builder";
import { getConnection } from "@evershop/evershop/lib/postgres";
export default (async (request, response, next)=>{
    const current = request.getCurrentCustomer();
    if (!current?.customer_id) {
        response.status(401).json({
            success: false,
            message: "Customer is not logged in"
        });
        return;
    }
    let client = null;
    try {
        client = await getConnection();
        const [addresses, orders] = await Promise.all([
            getCustomerAddresses(current.customer_id, client),
            getCustomerOrders(current.customer_id, client)
        ]);
        response.status(200).json({
            success: true,
            data: {
                customer: current,
                addresses,
                orders
            }
        });
    } catch (error) {
        response.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    } finally{
        if (client) {
            client.release();
        }
    }
});
async function getCustomerAddresses(customer_id, client) {
    return select().from("customer_address").where("customer_id", "=", customer_id).execute(client, false);
}
async function getCustomerOrders(customer_id, client) {
    return select().from("order").where("customer_id", "=", customer_id).andWhere("status", "=", "new").execute(client, false);
}

