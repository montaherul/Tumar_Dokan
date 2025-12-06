export default function Footer() {
  return (
    <footer className="bg-card text-muted-foreground pt-12 pb-6 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* --- Brand --- */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Tumar Dukan</h2>
          <p className="text-muted-foreground text-sm leading-6">
            Your trusted marketplace for the latest fashion, gadgets, and home
            essentials. Quality products, fast delivery, best prices.
          </p>
        </div>

        {/* --- Customer Service --- */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Customer Service
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="#" className="hover:text-primary">
                Help & FAQs
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary">
                Shipping Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary">
                Returns & Refunds
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary">
                Track Order
              </a>
            </li>
          </ul>
        </div>

        {/* --- Company --- */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">About Us</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="#" className="hover:text-primary">
                Company Info
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary">
                Careers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* --- Newsletter --- */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Subscribe</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Get 10% off on your first order when you subscribe to our
            newsletter.
          </p>

          <div className="flex bg-input rounded-lg overflow-hidden border border-border">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-transparent text-sm text-foreground focus:outline-none"
            />
            <button className="px-4 bg-primary text-primary-foreground text-sm font-medium hover:bg-sky-700">
              Join
            </button>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4 mt-4">
            <a href="#" className="hover:text-primary">
              <i className="fa-brands fa-facebook-f text-xl"></i>
            </a>
            <a href="#" className="hover:text-primary">
              <i className="fa-brands fa-instagram text-xl"></i>
            </a>
            <a href="#" className="hover:text-primary">
              <i className="fa-brands fa-twitter text-xl"></i>
            </a>
            <a href="#" className="hover:text-primary">
              <i className="fa-brands fa-youtube text-xl"></i>
            </a>
          </div>
        </div>
      </div>

      {/* --- Bottom Bar --- */}
      <div className="border-t border-border mt-10 pt-5 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ShopMaster. All Rights Reserved.
      </div>
    </footer>
  );
}