import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import NotFound from "../NotFound/NotFound";
import { formatPrice } from "../../utils/format";
import "./ProductDetail.css";

function ProductDetail({ addToCart, removeFromCart, getQuantityOfItemInCart }) {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProductDetail = async () => {
      if (!productId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const { data } = await axios.get(`http://localhost:3000/products/${productId}`);
        setProduct(data);
      } catch (err) {
        console.error('Failed to load product details:', err);
        setError('Product not found');
      } finally {
        setIsLoading(false);
      }
    };

    loadProductDetail();
  }, [productId]);

  if (error) {
    return <NotFound />;
  }

  if (isLoading || !product) {
    return <h1>Loading...</h1>;
  }

  const quantity = getQuantityOfItemInCart(product);

  const handleAddClick = () => {
    if (product) {
      addToCart(product);
    }
  };

  const handleRemoveClick = () => {
    if (product) {
      removeFromCart(product);
    }
  };

  return (
    <div className="ProductDetail">
      <div className="product-card">
        <div className="media">
          <img 
            src={product.image_url || "/placeholder.png"} 
            alt={product.name} 
          />
        </div>
        <div className="product-info">
          <p className="product-name">{product.name}</p>
          <p className="product-price">{formatPrice(product.price)}</p>
          <p className="description">{product.description}</p>
          <div className="actions">
            <button onClick={handleAddClick}>
              Add to Cart
            </button>
            {quantity > 0 && (
              <>
                <button onClick={handleRemoveClick}>
                  Remove from Cart
                </button>
                <span className="quantity">
                  Quantity: {quantity}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;