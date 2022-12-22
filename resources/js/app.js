const axios = require("axios");
const Noty = require("noty");
const initAdmin = require("./admin");
const moment = require("moment");

let addToCart = document.querySelectorAll(".add-to-cart");

let cartCounter = document.querySelector("#cartCounter");

function upadteCart(pizza) {
  axios
    .post("/updateCart", pizza)
    .then(function (res) {
      cartCounter.innerText = res.data.totalQty;

      new Noty({
        type: "success",
        timeout: 1000,
        text: "Item added to cart",
        progressBar: false,
      }).show();
    })
    .catch(function (err) {
      new Noty({
        type: "error",
        timeout: 1000,
        text: "Something went wrong",
        progressBar: false,
      }).show();
    });
}

addToCart.forEach(function (btn) {
  btn.addEventListener("click", function (e) {
    let pizza = JSON.parse(btn.dataset.pizza);
    upadteCart(pizza);
  });
});

//remove alert after t seconds

const alertMsg = document.querySelector("#success-alert");
if (alertMsg) {
  setTimeout(function () {
    alertMsg.remove();
  }, 2000);
}

//change single order status

let statuses = document.querySelectorAll(".status-line");

let hiddenInput = document.querySelector("#hiddenInput");
let order = hiddenInput ? hiddenInput.value : null;

order = JSON.parse(order);

let time = document.createElement("small");

function updateStatus(order) {
  statuses.forEach(function (status) {
    status.classList.remove("status-completed");
    status.classList.remove("current-status");
  });

  stepCompleted = true;

  statuses.forEach(function (status) {
    let dataProp = status.dataset.status;
    if (stepCompleted) {
      status.classList.add("status-completed");
    }
    if (dataProp === order.status) {
      stepCompleted = false;
      time.innerText = moment(order.updatedAt).format("hh:mm A");
      status.appendChild(time);
      if (status.nextElementSibling) {
        status.nextElementSibling.classList.add("current-status");
      }
    }
  });
}

updateStatus(order);

//Socket

let socket = io();
// Join user
if (order) {
  socket.emit("join", `order_${order._id}`);
}

socket.on("orderUpdated", function (data) {
  const updatedOrder = { ...order };
  updatedOrder.updatedAt = moment().format();
  updatedOrder.status = data.status;
  updateStatus(updatedOrder);
  new Noty({
    type: "success",
    timeout: 1000,
    text: "Order updated",
    progressBar: false,
  }).show();
  // console.log(data);
});

//join admin
let adminAreaPath = window.location.pathname;
if (adminAreaPath.includes("admin")) {
  initAdmin(socket);
  socket.emit("join", "adminRoom");
}

// toggle between register form

let registerRole = document.querySelector("#registerRole");
if (registerRole) {
  registerRole.addEventListener("change", function (e) {
    console.log(e.target.value);
    if (e.target.value === "admin") {
      document.querySelector("#setRole").value = "admin";
    } else {
      document.querySelector("#setRole").value = "customer";
    }
  });
}

//togle between login form

let loginRole = document.querySelector("#loginRole");
if (loginRole) {
  loginRole.addEventListener("change", function (e) {
    console.log(e.target.value);
    if (e.target.value === "admin") {
      document.querySelector("#customerLogin").classList.add("hide");
      document.querySelector("#adminLogin").classList.remove("hide");
    } else {
      document.querySelector("#customerLogin").classList.remove("hide");
      document.querySelector("#adminLogin").classList.add("hide");
    }
  });
}
