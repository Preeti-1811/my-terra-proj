import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [menu, setMenu] = useState([]);
  const [selectedBurger, setSelectedBurger] = useState(null);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [placedOrder, setPlacedOrder] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Get menu from backend
  useEffect(() => {
    async function loadMenu() {
      try {
        const response = await fetch("/api/menu");

        if (!response.ok) {
          throw new Error("Failed to load menu");
        }

        const data = await response.json();

        setMenu(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load menu. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, []);

  // Separate burgers and drinks
  const burgers = menu.filter((item) =>
    item.name.includes("Burger")
  );

  const drinks = menu.filter(
    (item) => !item.name.includes("Burger")
  );

  // Calculate total
  const total =
    Number(selectedBurger?.price || 0) +
    Number(selectedDrink?.price || 0);

  const canPlaceOrder =
    selectedBurger && selectedDrink;

  // Place order
  async function placeOrder() {
    if (!selectedBurger || !selectedDrink) {
      return;
    }

    setPlacingOrder(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          burger: selectedBurger.name,
          drink: selectedDrink.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      const order = await response.json();

      setPlacedOrder(order);
    } catch (err) {
      console.error(err);
      setError("Unable to place your order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  }

  // Get price of an item from the menu
  function getItemPrice(itemName) {
    const item = menu.find(
      (item) => item.name === itemName
    );

    return item ? Number(item.price) : 0;
  }

  // Success page
  if (placedOrder) {
    return (
      <div className="app">
        <main className="success-page">

          <div className="success-card">

            <div className="success-icon">
              ✓
            </div>

            <p className="success-label">
              BRU9MARZ
            </p>

            <h1>Order Placed!</h1>

            <p className="success-message">
              Congratulations! 🎉
              <br />
              Your delicious meal is on its way.
            </p>

            <div className="order-number">
              <span>ORDER NO.</span>

              <strong>
                BRU{placedOrder.id}
              </strong>
            </div>

            <div className="bill">

              <div className="bill-header">
                <span>Your Order</span>
                <span>Bill</span>
              </div>

              <div className="bill-item">
                <span>
                  🍔 {placedOrder.burger}
                </span>

                <strong>
                  ₹{getItemPrice(placedOrder.burger)}
                </strong>
              </div>

              <div className="bill-item">
                <span>
                  🥤 {placedOrder.drink}
                </span>

                <strong>
                  ₹{getItemPrice(placedOrder.drink)}
                </strong>
              </div>

              <div className="bill-divider"></div>

              <div className="bill-total">
                <span>Total</span>

                <strong>
                  ₹{placedOrder.total}
                </strong>
              </div>

            </div>

            <button
              className="order-again"
              onClick={() => {
                setPlacedOrder(null);
                setSelectedBurger(null);
                setSelectedDrink(null);
                setError("");
              }}
            >
              Order Again
            </button>

          </div>

        </main>
      </div>
    );
  }

  // Main ordering page
  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🍔</span>
          <span>BRU9MARZ</span>
        </div>

        <div className="tagline">
          Fresh. Fast. Delicious.
        </div>
      </header>

      <main className="main">

        {/* Hero */}
        <section className="hero">
          <p className="hero-small">
            WELCOME TO
          </p>

          <h1>
            Your Burger.
            <br />
            <span>Your Way.</span>
          </h1>

          <p className="hero-description">
            Build your perfect meal with our delicious burgers
            and refreshing drinks.
          </p>
        </section>

        {/* Loading */}
        {loading && (
          <div className="loading">
            Loading menu...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {/* Burger and Drink Selection */}
        {!loading && !error && (
          <>

            {/* Burger Selection */}
            <section className="menu-section">

              <div className="section-heading">

                <span className="step-number">
                  01
                </span>

                <div>
                  <h2>
                    Choose your burger
                  </h2>

                  <p>
                    Select one burger
                  </p>
                </div>

              </div>

              <div className="cards">

                {burgers.map((burger) => (
                  <button
                    key={burger.id}
                    className={`food-card ${
                      selectedBurger?.id === burger.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedBurger(burger)
                    }
                  >

                    <div className="food-emoji">
                      {burger.name.includes("Non-Veg")
                        ? "🍔"
                        : "🥬"}
                    </div>

                    <div className="food-info">

                      <h3>
                        {burger.name}
                      </h3>

                      <p>
                        {burger.name.includes("Non-Veg")
                          ? "Juicy chicken patty with fresh toppings"
                          : "Fresh veggies with a delicious burger sauce"}
                      </p>

                    </div>

                    <div className="food-price">
                      ₹{burger.price}
                    </div>

                    {selectedBurger?.id === burger.id && (
                      <div className="selected-mark">
                        ✓
                      </div>
                    )}

                  </button>
                ))}

              </div>

            </section>

            {/* Drink Selection */}
            <section className="menu-section">

              <div className="section-heading">

                <span className="step-number">
                  02
                </span>

                <div>
                  <h2>
                    Choose your drink
                  </h2>

                  <p>
                    Select one drink
                  </p>
                </div>

              </div>

              <div className="cards">

                {drinks.map((drink) => (
                  <button
                    key={drink.id}
                    className={`food-card drink-card ${
                      selectedDrink?.id === drink.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedDrink(drink)
                    }
                  >

                    <div className="food-emoji">
                      {drink.name === "Coke"
                        ? "🥤"
                        : "🍋"}
                    </div>

                    <div className="food-info">

                      <h3>
                        {drink.name}
                      </h3>

                      <p>
                        Perfect with your burger
                      </p>

                    </div>

                    <div className="food-price">
                      ₹{drink.price}
                    </div>

                    {selectedDrink?.id === drink.id && (
                      <div className="selected-mark">
                        ✓
                      </div>
                    )}

                  </button>
                ))}

              </div>

            </section>

            {/* Order Summary */}
            <section className="order-summary">

              <div className="summary-top">

                <div>

                  <p className="summary-label">
                    YOUR ORDER
                  </p>

                  <h2>
                    Order Summary
                  </h2>

                </div>

                <div className="total">

                  <span>
                    Total
                  </span>

                  <strong>
                    ₹{total}
                  </strong>

                </div>

              </div>

              <div className="summary-items">

                <div className="summary-item">

                  <span>
                    {selectedBurger
                      ? selectedBurger.name
                      : "No burger selected"}
                  </span>

                  <strong>
                    {selectedBurger
                      ? `₹${selectedBurger.price}`
                      : "—"}
                  </strong>

                </div>

                <div className="summary-item">

                  <span>
                    {selectedDrink
                      ? selectedDrink.name
                      : "No drink selected"}
                  </span>

                  <strong>
                    {selectedDrink
                      ? `₹${selectedDrink.price}`
                      : "—"}
                  </strong>

                </div>

              </div>

              <button
                className="place-order"
                disabled={
                  !canPlaceOrder || placingOrder
                }
                onClick={placeOrder}
              >
                {placingOrder
                  ? "Placing Order..."
                  : canPlaceOrder
                    ? `Place Order • ₹${total}`
                    : "Select burger & drink"}
              </button>

            </section>

          </>
        )}

      </main>

      <footer>
        <p>
          © 2026 BRU9MARZ • Made with ❤️ for burger lovers
        </p>
      </footer>

    </div>
  );
}

export default App;