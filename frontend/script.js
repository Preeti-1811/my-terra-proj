let selectedBurger = null;
let selectedDrink = null;

async function loadMenu() {
  const res = await fetch('/api/menu');
  const menu = await res.json();

  const burgers = menu.filter(item => item.name.includes('Burger'));
  const drinks = menu.filter(item => !item.name.includes('Burger'));

  const burgerDiv = document.getElementById('burgerOptions');
  burgers.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = `${item.name} - ₹${item.price}`;
    btn.onclick = () => {
      document.querySelectorAll('#burgerOptions .option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedBurger = item.name;
      checkReady();
    };
    burgerDiv.appendChild(btn);
  });

  const drinkDiv = document.getElementById('drinkOptions');
  drinks.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = `${item.name} - ₹${item.price}`;
    btn.onclick = () => {
      document.querySelectorAll('#drinkOptions .option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedDrink = item.name;
      checkReady();
    };
    drinkDiv.appendChild(btn);
  });
}

function checkReady() {
  document.getElementById('placeOrder').disabled = !(selectedBurger && selectedDrink);
}

async function loadOrders() {
  const res = await fetch('/api/orders');
  const orders = await res.json();
  const list = document.getElementById('ordersList');
  list.innerHTML = orders.map(o =>
    `<div class="order-item">#${o.id} — ${o.burger} + ${o.drink} — ₹${o.total}</div>`
  ).join('');
}

document.getElementById('placeOrder').addEventListener('click', async () => {
  const status = document.getElementById('orderStatus');
  status.innerText = 'Placing order...';

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ burger: selectedBurger, drink: selectedDrink })
    });
    const order = await res.json();
    status.innerText = `Order #${order.id} placed — Total ₹${order.total}`;
    loadOrders();
  } catch (err) {
    status.innerText = 'Failed to place order.';
  }
});

loadMenu();
loadOrders();