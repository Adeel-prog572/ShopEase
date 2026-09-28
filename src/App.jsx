
import { useEffect, useState } from "react";
import "./App.css";
import { getProducts } from "./api";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
   const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAll, setShowAll] = useState(false);
const [cart, setCart] = useState(() => {
  const savedCart = localStorage.getItem("shopease-cart");

  return savedCart
    ? JSON.parse(savedCart)
    : [];
});
const cartCount = cart.reduce(
  (total, item) => total + (item.quantity || 1),
  0
);
useEffect(() => {
  localStorage.setItem(
    "shopease-cart",
    JSON.stringify(cart)
  );
}, [cart]); 
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewQuantity, setQuickViewQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);
  const [favorites, setFavorites] = useState(() => {
  const savedFavorites = localStorage.getItem("shopease-favorites");

  return savedFavorites
    ? JSON.parse(savedFavorites)
    : [];
});
useEffect(() => {
  localStorage.setItem(
    "shopease-favorites",
    JSON.stringify(favorites)
  );
}, [favorites]);
  const toggleFavorite = (productId) => {
  setFavorites((prev) =>
    prev.includes(productId)
      ? prev.filter((id) => id !== productId)
      : [...prev, productId]
  );
};

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError("Unable to load products.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);
  console.log(products.map((product) => product.category));
  const filteredProducts = products.filter((product) => {
  const title = product.title.toLowerCase();
  const category = product.category.toLowerCase();

  const matchesSearch =
  searchTerm.trim() === "" ||
  title.includes(searchTerm.toLowerCase().trim()) ||
  category.includes(searchTerm.toLowerCase().trim());

  const matchesCategory =
    selectedCategory === "all" ||
    category === selectedCategory.toLowerCase();

  return matchesSearch && matchesCategory;
});
  const displayedProducts = showAll
  ? filteredProducts
  : filteredProducts.slice(0, 4);
 const addToCart = (product) => {
  setCart((prevCart) => {
    const existingItem = prevCart.find(
      (item) => item.id === product.id
    );

    if (existingItem) {
      return prevCart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      );
    }

    return [
      ...prevCart,
      {
        ...product,
        quantity: 1,
      },
    ];
  });
};
 const handleCategoryClick = (category) => {
  setSelectedCategory(category);

  setTimeout(() => {
    const productsSection = document.getElementById("products");

    if (productsSection) {
      const position =
        productsSection.getBoundingClientRect().top +
        window.scrollY -
        -60;

      window.scrollTo({
        top: position,
        behavior: "smooth",
      });
    }
  }, 100);
};
  return (
    <div className="shop-app">

      {/* NAVBAR */}
      <header className="navbar">
        <div className="brand">
          Shop<span>Ease</span>
          <small>®</small>
        </div>

       <nav className={menuOpen ? "mobile-menu open" : "mobile-menu"}>

  <a href="#home" onClick={() => setMenuOpen(false)}>
    Discover
  </a>

  <a href="#products" onClick={() => setMenuOpen(false)}>
    Shop
  </a>

  <a href="#favorites" onClick={() => setMenuOpen(false)}>
    Favorites
  </a>

  <a href="#categories" onClick={() => setMenuOpen(false)}>
    Collections
  </a>

  <a href="#about" onClick={() => setMenuOpen(false)}>
    About
  </a>

</nav>

        <div className="nav-right">

  <div className="search-wrapper">

    <input
      type="text"
      className="search-input"
      placeholder="Search products..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const productsSection =
            document.getElementById("products");

          if (productsSection) {
            productsSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
      }}
    />

    {searchTerm && (
      <button
        className="clear-search"
        onClick={() => setSearchTerm("")}
      >
        ×
      </button>
    )}

  </div>

  <button
    className="cart-btn"
    onClick={() => setCartOpen(!cartOpen)}
  >
    Bag <span>{cartCount}</span>
  </button>

  <button
    className="menu-toggle"
    onClick={() => setMenuOpen(!menuOpen)}
  >
    {menuOpen ? "×" : "☰"}
  </button>

</div>
      </header>
      {cartOpen && (
  <div className="cart-panel">
    <div className="cart-header">
      <h2>Your Cart</h2>

      <button onClick={() => setCartOpen(false)}>
        ×
      </button>
    </div>

    {cart.length === 0 ? (
      <p className="empty-cart">
        Your cart is empty.
      </p>
    ) : (
      <>
        <div className="cart-items">
          {cart.map((item, index) => (
            <div
              className="cart-item"
              key={`${item.id}-${index}`}
            >
              <img
                src={item.image}
                alt={item.title}
              />

              <div>
                <h3>{item.title}</h3>

                <p className="cart-item-price">
  ${item.price.toFixed(2)} × {item.quantity}
</p>

<strong className="cart-item-subtotal">
  ${(item.price * item.quantity).toFixed(2)}
</strong>
                <div className="quantity-controls">
  <button
    onClick={() => {
      setCart((prevCart) =>
        prevCart
          .map((cartItem) =>
            cartItem.id === item.id
              ? {
                  ...cartItem,
                  quantity: cartItem.quantity - 1,
                }
              : cartItem
          )
          .filter((cartItem) => cartItem.quantity > 0)
      );
    }}
  >
    −
  </button>

  <span>{item.quantity}</span>

  <button
    onClick={() => {
      setCart((prevCart) =>
        prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem
        )
      );
    }}
  >
    +
  </button>
</div>

                <button
                  className="remove-cart-item"
                  onClick={() => {
                    setCart((prevCart) =>
                      prevCart.filter(
                        (_, i) => i !== index
                      )
                    );
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-total">
          <strong>Total:</strong>

          <strong>
            $
            {cart
              .reduce(
                (total, item) =>
                  total + item.price * item.quantity,
                0
              )
              .toFixed(2)}
          </strong>
        </div>
        <button
  className="checkout-btn"
  onClick={() => {
    alert(
      `Order Total: $${cart
        .reduce(
          (total, item) =>
            total + item.price * item.quantity,
          0
        )
        .toFixed(2)}`
    );
  }}
>
  Checkout →
</button>
      </>
    )}
  </div>
)}
      {/* HERO */}
      <main id="home">

        <section className="hero">

          <div className="hero-orb orb-one"></div>
          <div className="hero-orb orb-two"></div>

          <div className="hero-copy">

            <div className="hero-badge">
              <span></span>
              CURATED FOR THE NEXT GENERATION
            </div>

            <h1>
              SHOP THE
              <br />
              <i>UNEXPECTED.</i>
            </h1>

            <p>
              A new kind of shopping experience.
              Discover products designed for people
              who don't follow the ordinary.
            </p>

            <div className="hero-actions">
              <button className="explore-btn">
                Explore Collection
                <span>↗</span>
              </button>

              <button className="play-btn">
                <span>▶</span>
                Watch Story
              </button>
            </div>

            <div className="hero-meta">
              <div>
                <strong>500+</strong>
                <span>Products</span>
              </div>

              <div>
                <strong>24K</strong>
                <span>Customers</span>
              </div>

              <div>
                <strong>4.9</strong>
                <span>Rating</span>
              </div>
            </div>

          </div>

          {/* HERO PRODUCT */}
          <div className="hero-product-area">

            <div className="vertical-text">
              SHOPEASE / 2026
            </div>

            <div className="hero-product">

              <div className="product-glow"></div>

             <div className="hero-product-image">
  {products[0] && (
    <img
      src={products[0].image}
      alt={products[0].title}
    />
  )}
</div>

              <div className="hero-product-info">
                <div>
                  <small>FEATURED</small>
                  <h3>AeroPods X</h3>
                </div>

                <strong>$129</strong>
              </div>

            </div>

            <div className="floating-info">
              <span>✦</span>

              <div>
                <strong>Editor's Pick</strong>
                <small>Top rated this week</small>
              </div>
            </div>

          </div>

        </section>

        {/* MOVING BAR */}
        <section className="ticker">
          <div className="ticker-track">
            <span>NEW ARRIVALS</span>
            <b>✦</b>

            <span>LIMITED EDITION</span>
            <b>✦</b>

            <span>FREE SHIPPING</span>
            <b>✦</b>

            <span>NEW ARRIVALS</span>
            <b>✦</b>

            <span>LIMITED EDITION</span>
            <b>✦</b>

            <span>FREE SHIPPING</span>
            <b>✦</b>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="categories" id="categories">

          <div className="section-top">

            <div>
              <span>01 / CATEGORIES</span>

              <h2>
                Find your
                <i> thing.</i>
              </h2>
            </div>

            <p>
              Explore our world of carefully selected
              products across multiple categories.
            </p>

          </div>

          <div className="category-grid">

           <div
  className="category-item"
  onClick={() => handleCategoryClick("laptops")}
>
  <span className="category-number">01</span>
  <div className="category-symbol">◉</div>
  <h3>Technology</h3>
  <p>Smart & powerful</p>
  <button>↗</button>
</div>

            <div
  className="category-item"
onClick={() => handleCategoryClick("mens-shirts")}
>
  <span className="category-number">02</span>
  <div className="category-symbol">◇</div>
  <h3>Fashion</h3>
  <p>Bold & original</p>
  <button>↗</button>
</div>
           <div
  className="category-item"
 onClick={() => handleCategoryClick("womens-jewellery")}
 >
  <span className="category-number">03</span>
  <div className="category-symbol">△</div>
  <h3>Accessories</h3>
  <p>Small details</p>
  <button>↗</button>
</div>
            <div
  className="category-item"
  onClick={() => handleCategoryClick("womens-dresses")}
>
  <span className="category-number">04</span>
  <div className="category-symbol">□</div>
  <h3>Lifestyle</h3>
  <p>Live different</p>
  <button>↗</button>
</div>

          </div>

        </section>

        {/* PRODUCTS */}
        <section className="products" id="products">

          <div className="section-top">

            <div>
              <span>02 / TRENDING</span>

              <h2>
                What's
                <i> hot.</i>
              </h2>
            </div>

            <button
  className="all-products"
  onClick={() => setShowAll(!showAll)}
>
  {showAll ? "Show less ↑" : "View all →"}
</button>

          </div>

          {/* PRODUCT GRID */}
          <div className="product-grid">

            {loading && (
              <div className="products-state">
                Loading products...
              </div>
            )}

            {error && (
              <div className="products-state error">
                {error}
              </div>
            )}

            {!loading &&
              !error &&
              displayedProducts.map((product, index) => (
                

               <article
  className="product-card"
  key={product.id}
 onClick={(e) => {
  if (
    e.target.closest(".heart") ||
    e.target.closest(".add-button")
  ) {
    return;
  }

  setSelectedProduct(product);
  setQuickViewQuantity(1);
}}
>

                  <div className="card-image">

                    <span className="card-number">
                      0{index + 1}
                    </span>

                   <button
  className={`heart ${
    favorites.includes(product.id) ? "liked" : ""
  }`}
  onClick={() => toggleFavorite(product.id)}
>
  {favorites.includes(product.id) ? "♥" : "♡"}
</button>

                    <img
                      src={product.image}
                      alt={product.title}
                      className="product-real-image"
                    />
                   <button
  className="add-button"
  onClick={() => addToCart(product)}
>
  <span>Add to bag</span>
  <span>+</span>
</button>
                  </div>

                 <div className="card-content">

  <span>
    {product.category}
  </span>

  <div className="product-rating">
    <span>★</span>
    <strong>{product.rating?.rate ?? "N/A"}</strong>
    <small>
      ({product.rating?.count ?? 0})
    </small>
  </div>

  <div className="card-title">
                      <h3>
                        {product.title}
                      </h3>

                      <strong>
                        ${product.price.toFixed(2)}
                      </strong>

                    </div>

                  </div>

                </article>

              ))}

          </div>

        </section>
        {/* FAVORITES */}
<section className="favorites-section" id="favorites">

  <div className="section-top">

    <div>
      <span>03 / YOUR PICKS</span>

      <h2>
        Your
        <i> favorites.</i>
      </h2>
    </div>

  </div>

  {favorites.length === 0 ? (

    <div className="empty-favorites">
      <h3>No favorites yet</h3>

      <p>
        Click the heart on any product to save it here.
      </p>
    </div>

  ) : (

    <div className="product-grid">

      {products
        .filter((product) =>
          favorites.includes(product.id)
        )
        .map((product, index) => (

          <article
            className="product-card"
            key={product.id}
          >

            <div className="card-image">

              <span className="card-number">
                0{index + 1}
              </span>

              <button
                className="heart liked"
                onClick={() =>
                  toggleFavorite(product.id)
                }
              >
                ♥
              </button>

              <img
                src={product.image}
                alt={product.title}
                className="product-real-image"
              />

              <button
                className="add-button"
                onClick={() => addToCart(product)}
              >
                <span>Add to bag</span>
                <span>+</span>
              </button>

            </div>

            <div className="card-content">

              <span>
                {product.category}
              </span>

              <div className="product-rating">

                <span>★</span>

                <strong>
                  {product.rating?.rate ?? "N/A"}
                </strong>

                <small>
                  ({product.rating?.count ?? 0})
                </small>

              </div>

              <div className="card-title">

                <h3>
                  {product.title}
                </h3>

                <strong>
                  ${product.price.toFixed(2)}
                </strong>

              </div>

            </div>

          </article>

        ))}

    </div>

  )}

</section>       

        {/* BIG CTA */}
        <section className="big-cta">

          <div className="cta-glow"></div>

          <span>
            THE SHOPEASE EXPERIENCE
          </span>

          <h2>
            DIFFERENT
            <br />
            <i>BY DESIGN.</i>
          </h2>

          <p>
            Because ordinary shopping was never
            meant for extraordinary people.
          </p>

          <button className="explore-btn">
            Enter ShopEase
            <span>↗</span>
          </button>

        </section>

      </main>
      {/* PRODUCT QUICK VIEW */}
{selectedProduct && (
  <div
    className="product-modal-overlay"
    onClick={() => setSelectedProduct(null)}
  >
    <div
      className="product-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="product-modal-close"
        onClick={() => setSelectedProduct(null)}
      >
        ×
      </button>

      <div className="product-modal-image">
        <img
          src={selectedProduct.image}
          alt={selectedProduct.title}
        />
      </div>

      <div className="product-modal-info">

        <span>
          {selectedProduct.category}
        </span>

        <h2>
          {selectedProduct.title}
        </h2>

        <div className="product-modal-rating">
          ★ {selectedProduct.rating?.rate ?? "N/A"}
          <small>
            ({selectedProduct.rating?.count ?? 0} reviews)
          </small>
        </div>

        <strong className="product-modal-price">
          ${selectedProduct.price.toFixed(2)}
        </strong>
        <div className="quick-view-quantity">

  <button
    onClick={() =>
      setQuickViewQuantity((quantity) =>
        Math.max(1, quantity - 1)
      )
    }
  >
    −
  </button>

  <span>{quickViewQuantity}</span>

  <button
    onClick={() =>
      setQuickViewQuantity((quantity) =>
        quantity + 1
      )
    }
  >
    +
  </button>

</div>

        <p>
          {selectedProduct.description}
        </p>

        <button
  className="product-modal-cart"
  onClick={() => {
    for (let i = 0; i < quickViewQuantity; i++) {
      addToCart(selectedProduct);
    }

    setAddedMessage(true);

    setTimeout(() => {
      setAddedMessage(false);
      setSelectedProduct(null);
      setQuickViewQuantity(1);
    }, 700);
  }}
>
  {addedMessage ? "Added ✓" : "Add to Bag →"}
</button>

      </div>

    </div>
  </div>
)}  

      {/* FOOTER */}
      <footer id="about">

        <div className="footer-main">

          <div>

            <div className="brand">
              Shop<span>Ease</span>
              <small>®</small>
            </div>

            <p>
              A modern marketplace for
              extraordinary finds.
            </p>

          </div>

          <div className="footer-column">

            <strong>Explore</strong>

            <a href="#home">
              Discover
            </a>

            <a href="#products">
              Shop
            </a>
            <a
  href="#favorites"
>
  Favorites
</a>

            <a href="#categories">
              Collections
            </a>

          </div>

          <div className="footer-column">

            <strong>Company</strong>

            <a href="#about">
              About
            </a>

            <a href="#about">
              Contact
            </a>

            <a href="#about">
              Privacy
            </a>

          </div>

        </div>

        <div className="footer-bottom">

          <span>
            © 2026 ShopEase
          </span>

          <span>
            Built with React
          </span>

          <span>
            Pakistan 🇵🇰
          </span>

        </div>

      </footer>

    </div>
  );
}

export default App;