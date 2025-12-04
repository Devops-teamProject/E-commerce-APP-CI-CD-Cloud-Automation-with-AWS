db = db.getSiblingDB('ecommerce');

db.createUser({
  user: "appuser",
  pwd: "apppassword",
  roles: [
    { role: "readWrite", db: "ecommerce" }
  ]
});
