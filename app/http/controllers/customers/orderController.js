const Order = require("../../../models/order");
const moment = require("moment");



function orderController() {
  return {
    store(req, res) {
      if (req.user) {
        const { phone, address } = req.body;
        if (!phone || !address) {
          req.flash("error", "All fields are required");
          return res.redirect("/cart");
        }

        //   console.log(req.body);

        const order = new Order({
          customerId: req.user._id,
          items: req.session.cart.items,
          phone: phone,
          address: address,
        });
        //   console.log(order);

        order
          .save()
          .then(function (result) {
            Order.populate(
              result,
              { path: "customerId" },
              function (err, placedOrder) {
                req.flash("success", "Order placed successfully");
                delete req.session.cart;

                //Emit

                const eventEmitter = req.app.get("eventEmitter");
                eventEmitter.emit("orderPlaced", placedOrder);

                return res.redirect("/customer/orders");
              }
            );
          })
          .catch(function (err) {
            console.log(err);
            req.flash("error", "Something went wrong");
            return res.redirect("/cart");
          });
      } else {
        return res.redirect("/login");
      }
    },
    async index(req, res) {
      if (req.user) {
        const orders = await Order.find({ customerId: req.user._id }, null, {
          sort: { createdAt: -1 },
        });
        res.header(
          "Cache-Control",
          "no-cache,private,no-store,must-revalidate,max-scale=0,post-check=0,pre-check=0"
        );
        res.render("customers/orders", { orders: orders, moment: moment });
        console.log(orders);
      } else {
        return res.redirect("/login");
      }
    },
    async show(req, res) {
      const order = await Order.findById(req.params.id);
      // autherised user
      if (req.user._id.toString() === order.customerId.toString()) {
        return res.render("customers/singleOrder", { order: order });
      }
      return res.redirect("/");
    },
  };
}

module.exports = orderController;
