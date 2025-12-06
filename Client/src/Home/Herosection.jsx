import { Link } from "react-router-dom";
import { HiOutlineShieldCheck } from "react-icons/hi";

const backgroundImage = "/bgimages/background.jpg";

const HeroSection = ({ user = null }) => {
  const isAuthenticated = !!user;

  return (
    <section
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

      {/* Soft glow accents */}
      <div className="pointer-events-none absolute -top-32 -right-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-10 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />

      {/* Content card */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-10 md:py-14 
                      rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 
                      shadow-[0_18px_60px_rgba(15,23,42,0.85)] text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full 
                        bg-emerald-500/10 border border-emerald-300/30 mb-5">
          <HiOutlineShieldCheck className="text-emerald-300 text-lg" />
          <span className="text-xs md:text-sm font-medium uppercase tracking-[0.18em] text-emerald-100">
            SPA CERTIFICATE SUITE
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Spa Certificate Generator <span className="text-emerald-300">&amp; Manager</span>
        </h1>

        {/* Subheading */}
        <p className="mt-4 md:mt-6 text-sm md:text-lg text-gray-200/90 max-w-3xl mx-auto leading-relaxed">
          The all-in-one solution for creating, managing, and tracking certificates and 
          documents for luxury SPA and wellness centers — secure, elegant, and effortless.
        </p>

        {/* CTA Buttons */}
        {!isAuthenticated && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 md:mt-10">
            <Link
              to="/login"
              className="px-8 py-3.5 md:py-4 rounded-xl font-semibold text-base md:text-lg
                         bg-white text-emerald-700 shadow-lg shadow-black/25
                         hover:shadow-2xl hover:bg-emerald-50 hover:-translate-y-1
                         transition-all duration-300"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="px-8 py-3.5 md:py-4 rounded-xl font-semibold text-base md:text-lg
                         bg-gradient-to-r from-emerald-500 to-sky-500 text-white 
                         shadow-lg shadow-emerald-900/50 border border-white/20
                         hover:from-emerald-400 hover:to-sky-400 hover:-translate-y-1
                         hover:shadow-2xl transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        )}

        {/* Authenticated state */}
        {isAuthenticated && (
          <div className="mt-8 md:mt-10 flex flex-col items-center gap-3">
            <p className="text-lg md:text-xl font-semibold text-emerald-200 flex items-center gap-2">
              <HiOutlineShieldCheck className="text-2xl md:text-3xl" />
              Welcome back, {user?.name}
            </p>
            <p className="text-sm md:text-base text-gray-200/80">
              Continue managing your spa certificates with ease and confidence.
            </p>
          </div>
        )}

        {/* Trust / micro copy */}
        {!isAuthenticated && (
          <p className="mt-6 md:mt-8 text-xs md:text-sm text-gray-300/80 flex items-center justify-center gap-2">
            <span className="inline-flex h-1 w-8 rounded-full bg-emerald-300/70" />
            Secure, cloud-based &amp; designed for premium spa experiences
            <span className="inline-flex h-1 w-8 rounded-full bg-sky-300/70" />
          </p>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
