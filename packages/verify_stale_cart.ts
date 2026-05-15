import { CartService } from "./modules/cart/cart.service";
import { ProductModel } from "./modules/products/product.model";
import { OrderService } from "./modules/orders/order.service";
import { generateId } from "./core/utils";

async function run() {
  console.log("1. Creating a new cart...");
  const cart = await CartService.create("demo@test.com");
  console.log(`Cart ID: ${cart.id}`);

  console.log("\n2. Getting first published product...");
  const product = ProductModel.findPublished()[0];
  const variant = product.variants[0];
  console.log(`Product: ${product.title}, Variant: ${variant.title}`);

  console.log("\n3. Adding item to cart...");
  await CartService.addItem(cart.id, product.id, variant.id, 2);
  
  let currentCart = CartService.get(cart.id);
  console.log(`Cart total items: ${currentCart.items.length}, Subtotal: ${currentCart.subtotal}`);

  console.log("\n4. Simulating Admin deleting the product...");
  ProductModel.delete(product.id);

  console.log("\n5. Fetching Cart again (should auto-sync and remove stale items)...");
  currentCart = CartService.get(cart.id);
  console.log(`Cart total items after product deletion: ${currentCart.items.length}, Subtotal: ${currentCart.subtotal}`);

  console.log("\n6. Attempting to place order with empty cart (should fail)...");
  try {
    await CartService.setShippingAddress(cart.id, {
      first_name: "Test", last_name: "User", address_1: "123 Main", city: "City", state: "ST", postal_code: "12345", country_code: "US"
    });
    await OrderService.place({ cart_id: cart.id });
    console.log("❌ Order placed successfully! (This should not happen)");
  } catch (error) {
    console.log(`✅ Order gracefully rejected: [${error.code}] ${error.message}`);
  }
}

run().catch(console.error);
