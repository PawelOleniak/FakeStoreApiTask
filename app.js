const axios = require('axios');

const usersUrl = 'https://fakestoreapi.com/users';
const cartsUrl = 'https://fakestoreapi.com/carts';
const productsUrl = 'https://fakestoreapi.com/products';

const myAxios = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
const toRadians = (deg) => (deg * Math.PI) / 180;
function calculateDistance(coord1, coord2) {
  let lat1 = toRadians(coord1['lat']);
  let lat2 = toRadians(coord2['lat']);
  let long1 = toRadians(coord1['long']);
  let long2 = toRadians(coord2['long']);

  // Haversine formula
  let dlong = long2 - long1;
  let dlat = lat2 - lat1;
  let a =
    Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlong / 2), 2);

  let c = 2 * Math.asin(Math.sqrt(a));

  // Radius of earth in kilometers. Use 3956
  let r = 6371;

  // calculate the result
  return c * r;
}

(async function main() {
  const users = await myAxios(usersUrl);
  const carts = await myAxios(cartsUrl);
  const products = await myAxios(productsUrl);

  const productsByCategory = products.reduce((acc, product) => {
    const { category } = product;

    return {
      ...acc,
      [category]: {
        sum: acc[category]
          ? Math.round(
              (acc[category].sum + product.price + Number.EPSILON) * 100
            ) / 100
          : product.price,
      },
    };
  }, []);

  const cartsWithPrices = carts.map((cart) => {
    const user = users.filter((user) => user.id === cart.userId)[0];
    const userFullname = user.name.firstname + ' ' + user.name.lastname;

    const value = cart.products.reduce((acc, cartProduct) => {
      const productValue = products.filter(
        (product) => product.id === cartProduct.productId
      )[0].price;
      return acc + cartProduct.quantity * productValue;
    }, 0);

    return { user: userFullname, value };
  });
  const largestCart = cartsWithPrices.reduce((a, b) =>
    a.value > b.value ? a : b
  );

  const usersPairs = [];

  users.forEach((user1) => {
    users.forEach((user2) => {
      if (user1.id !== user2.id)
        usersPairs.push({
          fromName: user1.name.firstname + ' ' + user1.name.lastname,
          fromId: user1.id,
          toName: user2.name.firstname + ' ' + user2.name.lastname,
          toId: user2.id,
          distance: calculateDistance(
            user1.address.geolocation,
            user2.address.geolocation
          ),
        });
    });
  });

  const maxDistance = Math.max(...usersPairs.map((pair) => pair.distance));
  const maxDistanceUsers = usersPairs.filter(
    (el) => el.distance === maxDistance
  )[0];

  //console.log('1.');
  //console.log(users);
  //console.log(products);
  //console.log(carts);
  console.log('2.');
  console.log(productsByCategory);
  console.log('3.');
  console.log(largestCart);
  console.log('4.');
  console.log(maxDistanceUsers);
})();
