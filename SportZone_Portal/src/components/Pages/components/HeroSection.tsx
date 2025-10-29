import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#1ec391] text-white py-24 px-6 text-center overflow-hidden">
      <div className="max-w-4xl mx-auto z-10 relative animate-fadeInDown">
        <h1 className="text-5xl font-bold leading-tight mb-6">
          Đặt Sân Nhanh - Dễ Dàng - Uy Tín
        </h1>
        <p className="text-xl mb-6">
          Nền tảng hàng đầu giúp bạn đặt sân thể thao chỉ trong vài cú click.
        </p>
        <button
          className="bg-white text-[#1ec391] font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition"
          onClick={() => navigate("/field_list")}
        >
          Đặt sân ngay
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
