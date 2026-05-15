// tests/unit/core/event-bus.test.ts
// Covers bug #108 — "Event bus drops errors from async listeners"

import { EventBus, EVENT } from "../../../packages/core/event-bus";

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Resolved after `ms` milliseconds — simulates async work in a listener. */
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Create a fresh EventBus per test so tests are fully isolated.
let bus: EventBus;
beforeEach(() => {
  bus = new EventBus();
});

// ─── on() — baseline ─────────────────────────────────────────────────────────

describe("on() — basic subscription", () => {
  it("calls a sync listener with the correct payload", async () => {
    const received: unknown[] = [];
    bus.on(EVENT.ORDER_PLACED, (p) => { received.push(p); });

    await bus.emit(EVENT.ORDER_PLACED, {
      order_id: "ord_1",
      customer_email: "a@b.com",
      total: 100,
    });

    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({ order_id: "ord_1" });
  });

  it("calls multiple listeners in parallel", async () => {
    const log: string[] = [];
    bus.on(EVENT.CART_CREATED, async () => { await delay(10); log.push("A"); });
    bus.on(EVENT.CART_CREATED, async () => { await delay(5);  log.push("B"); });

    await bus.emit(EVENT.CART_CREATED, { cart_id: "c_1" });

    // Both must have been called (order may differ because they run in parallel)
    expect(log.sort()).toEqual(["A", "B"]);
  });

  it("unsubscribe removes only the target listener", async () => {
    const calls: string[] = [];
    const off = bus.on(EVENT.PRODUCT_CREATED, () => { calls.push("A"); });
    bus.on(EVENT.PRODUCT_CREATED, () => { calls.push("B"); });

    off();
    await bus.emit(EVENT.PRODUCT_CREATED, { product_id: "p_1", title: "Hat" });

    expect(calls).toEqual(["B"]);
  });
});

// ─── Bug #108 — async errors in emit() ───────────────────────────────────────

describe("emit() — async handler error handling (bug #108)", () => {
  it("routes async listener errors to onError instead of silently dropping them", async () => {
    const boom = new Error("async boom");
    const errors: Array<{ event: string; err: unknown }> = [];

    bus.onError = (event, err) => errors.push({ event, err });
    bus.on(EVENT.ORDER_PLACED, async () => { throw boom; });

    await bus.emit(EVENT.ORDER_PLACED, {
      order_id: "ord_2",
      customer_email: "x@y.com",
      total: 50,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].event).toBe(EVENT.ORDER_PLACED);
    // Full Error object — not just a message string (previously lost)
    expect(errors[0].err).toBe(boom);
  });

  it("preserves the full Error object (stack trace intact) in onError", async () => {
    const original = new Error("with stack");
    let captured: unknown;

    bus.onError = (_evt, err) => { captured = err; };
    bus.on(EVENT.PAYMENT_FAILED, async () => { throw original; });

    await bus.emit(EVENT.PAYMENT_FAILED, { order_id: "ord_3", error: "fail" });

    expect(captured).toBeInstanceOf(Error);
    expect((captured as Error).stack).toBeDefined();
  });

  it("one failing async listener does NOT block other listeners", async () => {
    const reached: string[] = [];
    const errors: unknown[] = [];

    bus.onError = (_evt, err) => errors.push(err);
    bus.on(EVENT.INVENTORY_UPDATED, async () => { throw new Error("bad"); });
    bus.on(EVENT.INVENTORY_UPDATED, async () => { reached.push("second"); });

    await bus.emit(EVENT.INVENTORY_UPDATED, {
      variant_id: "v_1",
      quantity: 0,
    });

    expect(reached).toEqual(["second"]);
    expect(errors).toHaveLength(1);
  });

  it("handles non-Error rejections (strings, objects)", async () => {
    const captured: unknown[] = [];
    bus.onError = (_evt, err) => captured.push(err);
    bus.on(EVENT.CART_ABANDONED, async () => { throw "string rejection"; });

    await bus.emit(EVENT.CART_ABANDONED, { cart_id: "c_2" });

    expect(captured).toEqual(["string rejection"]);
  });
});

// ─── Bug #108 — async errors in once() ───────────────────────────────────────

describe("once() — async handler error handling (bug #108)", () => {
  it("awaits the async handler so errors are NOT silently dropped", async () => {
    const errors: unknown[] = [];
    bus.onError = (_evt, err) => errors.push(err);

    const boom = new Error("once async boom");
    bus.once(EVENT.PRODUCT_DELETED, async () => { throw boom; });

    await bus.emit(EVENT.PRODUCT_DELETED, { product_id: "p_2" });

    // Before the fix this array would be empty — the error was silently lost.
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe(boom);
  });

  it("removes the listener AFTER the async handler settles (race condition fix)", async () => {
    const order: string[] = [];

    bus.once(EVENT.SHIPMENT_CREATED, async () => {
      await delay(20); // simulate slow async work
      order.push("handler-done");
    });

    await bus.emit(EVENT.SHIPMENT_CREATED, {
      order_id: "ord_4",
      tracking_number: "TRK123",
      carrier: "DHL",
    });

    order.push("emit-done");

    // The handler must have completed BEFORE emit resolves
    expect(order).toEqual(["handler-done", "emit-done"]);
    // And the listener must be cleaned up
    expect(bus.listenerCount(EVENT.SHIPMENT_CREATED)).toBe(0);
  });

  it("removes the listener even if the async handler throws", async () => {
    bus.onError = () => {}; // suppress console noise
    bus.once(EVENT.PAYMENT_FAILED, async () => { throw new Error("once-throw"); });

    await bus.emit(EVENT.PAYMENT_FAILED, { order_id: "ord_5", error: "e" });

    // Listener must be gone even after a throw
    expect(bus.listenerCount(EVENT.PAYMENT_FAILED)).toBe(0);
  });

  it("fires exactly once across multiple emits", async () => {
    const calls: number[] = [];
    bus.once(EVENT.CUSTOMER_LOGGED_IN, async () => { calls.push(1); });

    await bus.emit(EVENT.CUSTOMER_LOGGED_IN, { customer_id: "cust_1" });
    await bus.emit(EVENT.CUSTOMER_LOGGED_IN, { customer_id: "cust_1" });
    await bus.emit(EVENT.CUSTOMER_LOGGED_IN, { customer_id: "cust_1" });

    expect(calls).toHaveLength(1);
  });
});

// ─── onError hook ─────────────────────────────────────────────────────────────

describe("onError hook", () => {
  it("defaults to console.error (no override needed for normal usage)", async () => {
    const spy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    bus.on(EVENT.ORDER_CANCELLED, async () => {
      throw new Error("default onError path");
    });
    await bus.emit(EVENT.ORDER_CANCELLED, { order_id: "ord_6" });

    expect(spy).toHaveBeenCalledTimes(1);
    const [, err] = spy.mock.calls[0];
    expect(err).toBeInstanceOf(Error);
    spy.mockRestore();
  });

  it("can be replaced to capture errors for testing", async () => {
    const captured: Error[] = [];
    bus.onError = (_evt, err) => {
      if (err instanceof Error) captured.push(err);
    };

    bus.on(EVENT.ORDER_PLACED, async () => { throw new Error("E1"); });
    bus.on(EVENT.ORDER_PLACED, async () => { throw new Error("E2"); });

    await bus.emit(EVENT.ORDER_PLACED, {
      order_id: "ord_7",
      customer_email: "z@z.com",
      total: 0,
    });

    expect(captured.map((e) => e.message).sort()).toEqual(["E1", "E2"]);
  });
});

// ─── Utilities ────────────────────────────────────────────────────────────────

describe("utilities", () => {
  it("listenerCount reflects on/off/once correctly", () => {
    const off = bus.on(EVENT.CART_UPDATED, () => {});
    bus.once(EVENT.CART_UPDATED, async () => {});
    expect(bus.listenerCount(EVENT.CART_UPDATED)).toBe(2);

    off();
    expect(bus.listenerCount(EVENT.CART_UPDATED)).toBe(1);
  });

  it("off() removes all listeners for an event", async () => {
    bus.on(EVENT.INVENTORY_LOW, () => {});
    bus.on(EVENT.INVENTORY_LOW, () => {});
    bus.off(EVENT.INVENTORY_LOW);
    expect(bus.listenerCount(EVENT.INVENTORY_LOW)).toBe(0);
  });

  it("clear() removes all listeners on all events", () => {
    bus.on(EVENT.ORDER_PLACED, () => {});
    bus.on(EVENT.CART_CREATED, () => {});
    bus.clear();
    expect(bus.registeredEvents()).toHaveLength(0);
  });

  it("getHistory() records emitted events (capped at maxHistory)", async () => {
    await bus.emit(EVENT.PRODUCT_PUBLISHED, { product_id: "p_3" });
    const h = bus.getHistory();
    expect(h).toHaveLength(1);
    expect(h[0].event).toBe(EVENT.PRODUCT_PUBLISHED);
    expect(h[0].payload).toMatchObject({ product_id: "p_3" });
  });
});
