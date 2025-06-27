import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import SubNavbar from "../SubNavbar/SubNavbar";
import Sidebar from "../Sidebar/Sidebar";
import Home from "../Home/Home";
import ProductDetail from "../ProductDetail/ProductDetail";
import NotFound from "../NotFound/NotFound";
import { removeFromCart, addToCart, getQuantityOfItemInCart, getTotalItemsInCart } from "../../utils/cart";
import { calculateItemSubtotal, calculateOrderSubtotal, calculateTotal } from "../../utils/calculations";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [userInfo, setUserInfo] = useState({ name: "", dorm_number: "" });
  const [isFetching, setIsFetching] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsFetching(true);
        const { data } = await axios.get('http://localhost:3000/products');
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Unable to load products');
      } finally {
        setIsFetching(false);
      }
    };

    loadProducts();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prevState => !prevState);
  };

  const handleAddToCart = (item) => {
    setCart(addToCart(cart, item));
  };

  const handleRemoveFromCart = (item) => {
    setCart(removeFromCart(cart, item));
  };

  const getItemQuantity = (item) => {
    return getQuantityOfItemInCart(cart, item);
  };

  const getTotalCartItems = () => {
    return getTotalItemsInCart(cart);
  };

  const handleSearchChange = (event) => {
    setSearchInputValue(event.target.value);
  };

  const handleCheckout = async () => {
    if (!userInfo.name.trim()) {
      setError("Please enter your name before checkout");
      return;
    }

    setIsCheckingOut(true);
    setError(null);

    try {
      const cartItems = Object.keys(cart).map(itemId => {
        const product = products.find(p => p.id === parseInt(itemId));
        return {
          productId: parseInt(itemId),
          quantity: cart[itemId],
          price: product?.price || 0
        };
      });

      const response = await axios.post('http://localhost:3000/orders', {
        customerId: 123,
        status: 'pending',
        items: cartItems
      });

      setOrder(response.data);
      setCart({});
    } catch (err) {
      console.error('Checkout failed:', err);
      setError('Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Sidebar
          cart={cart}
          error={error}
          userInfo={userInfo}
          setUserInfo={setUserInfo}
          isOpen={sidebarOpen}
          products={products}
          toggleSidebar={toggleSidebar}
          isCheckingOut={isCheckingOut}
          addToCart={handleAddToCart}
          removeFromCart={handleRemoveFromCart}
          getQuantityOfItemInCart={getItemQuantity}
          getTotalItemsInCart={getTotalCartItems}
          handleOnCheckout={handleCheckout}
          order={order}
          setOrder={setOrder}
        />
        <main>
          <SubNavbar
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            searchInputValue={searchInputValue}
            handleOnSearchInputChange={handleSearchChange}
          />
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  error={error}
                  products={products}
                  isFetching={isFetching}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  addToCart={handleAddToCart}
                  searchInputValue={searchInputValue}
                  removeFromCart={handleRemoveFromCart}
                  getQuantityOfItemInCart={getItemQuantity}
                />
              }
            />
            <Route
              path="/:productId"
              element={
                <ProductDetail
                  addToCart={handleAddToCart}
                  removeFromCart={handleRemoveFromCart}
                  getQuantityOfItemInCart={getItemQuantity}
                />
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;