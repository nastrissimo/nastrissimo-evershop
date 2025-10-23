import { EvershopRequest, EvershopResponse } from '@evershop/evershop';
import { PoolClient, select } from "@evershop/postgres-query-builder";
import { getConnection } from "@evershop/evershop/lib/postgres";

export default async (request: EvershopRequest, response: EvershopResponse, next) => {
  const current = request.getCurrentCustomer();

  if (!current?.customer_id) {
    response.status(401).json({
      success: false,
      message: "Customer is not logged in"
    });
    return;
  }

  let client: PoolClient | null = null;
  try {
    client = await getConnection();

    // Carica indirizzi e ordini in parallelo
    const [addresses, orders] = await Promise.all([
      getCustomerAddresses(current.customer_id, client),
      getOrders(current.customer_id, client)
    ]);

    response.status(200).json({
      success: true,
      data: {
        customer: current,
        addresses,
        orders
      }
    });
  } catch (error: any) {
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

async function getCustomerAddresses(customer_id: number, client: PoolClient): Promise<any[]> {
  return select()
    .from("customer_address")
    .where("customer_id", "=", customer_id)
    .load(client);
}

async function getOrders(customer_id: number, client: PoolClient): Promise<any[]> {
  return select()
    .from("orders")
    .where("customer_id", "=", customer_id)
    .andWhere("status", "=", "new")
    .load(client);
}