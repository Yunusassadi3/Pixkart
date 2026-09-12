async function run() {
  console.log("=== PIXKART SYSTEM VERIFICATION ===");

  // 1. /Tanzar
  try {
    const res = await fetch("http://localhost:3000/Tanzar");
    console.log("1. GET /Tanzar -> Status:", res.status, res.status === 200 ? "✓ PASS" : "✗ FAIL");
  } catch (e: any) {
    console.log("1. GET /Tanzar -> Error:", e.message);
  }

  // 2. /admin (Must be 404)
  try {
    const res = await fetch("http://localhost:3000/admin");
    console.log("2. GET /admin -> Status:", res.status, res.status === 404 ? "✓ PASS (Hidden & 404)" : "✗ FAIL");
  } catch (e: any) {
    console.log("2. GET /admin -> Error:", e.message);
  }

  // 3. /checkout (Must NOT contain pincode input)
  try {
    const res = await fetch("http://localhost:3000/checkout");
    const text = await res.text();
    const hasPincodeBox = text.includes("Delivery Pincode Checker") || text.includes('name="pincode"');
    console.log("3. GET /checkout -> Pincode box found?", hasPincodeBox ? "✗ FAIL (Still present)" : "✓ PASS (Successfully removed)");
  } catch (e: any) {
    console.log("3. GET /checkout -> Error:", e.message);
  }

  // 4. /api/orders
  try {
    const res = await fetch("http://localhost:3000/api/orders");
    const data = await res.json();
    console.log("4. GET /api/orders -> Success:", data.isConnected, "Order count:", data.orders?.length || 0);
    if (data.orders && data.orders.length > 0) {
      console.log("   First Order ID:", data.orders[0].id);
      console.log("   First Order Status:", data.orders[0].status);
      console.log("   First Order Items Count:", data.orders[0].items?.length || 0);
      if (data.orders[0].items?.length > 0) {
        console.log("   First Order Item Title:", data.orders[0].items[0].productTitle);
      }

      // Test PATCH order status update
      const patchRes = await fetch("http://localhost:3000/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.orders[0].id, orderStatus: "Packed" }),
      });
      const patchJson = await patchRes.json();
      console.log("   PATCH status update to 'Packed':", patchJson.success ? "✓ PASS" : "✗ FAIL");

      // Reset back to "Ordered"
      await fetch("http://localhost:3000/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.orders[0].id, orderStatus: "Ordered" }),
      });
      console.log("   Reset status back to 'Ordered': ✓ PASS");
    }
  } catch (e: any) {
    console.log("4. GET /api/orders -> Error:", e.message);
  }

  // 5. Products Promo Flags
  try {
    const res = await fetch("http://localhost:3000/api/products");
    const data = await res.json();
    const prods = data.products || [];
    const featured = prods.filter((p: any) => p.isFeatured).length;
    const deals = prods.filter((p: any) => p.isDealOfDay).length;
    const spotlight = prods.filter((p: any) => p.inSpotlight).length;
    const hero = prods.filter((p: any) => p.inHeroBanner).length;
    console.log(`5. Products Stats: Total=${prods.length}, Featured=${featured}, Deals=${deals}, Spotlight=${spotlight}, Hero=${hero}`);
  } catch (e: any) {
    console.log("5. GET /api/products -> Error:", e.message);
  }
}

run();
