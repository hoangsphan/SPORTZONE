import {
  FaBolt,
  FaListAlt,
  FaMobileAlt,
  FaSearchLocation,
  FaShieldAlt,
  FaSyncAlt,
} from "react-icons/fa";
import FeatureItem from "./FeatureItem";

const WhyChooseUsSection = () => {
  const features = [
    {
      icon: <FaMobileAlt size={32} className="text-[#1ec391] mx-auto mb-4" />,
      title: "Giao diện thân thiện",
      desc: "Dễ sử dụng cho mọi lứa tuổi, từ học sinh đến người lớn tuổi.",
    },
    {
      icon: <FaBolt size={32} className="text-[#1ec391] mx-auto mb-4" />,
      title: "Đặt sân chỉ vài giây",
      desc: "Chọn sân, chọn giờ, xác nhận – cực kỳ nhanh chóng và tiện lợi.",
    },
    {
      icon: <FaListAlt size={32} className="text-[#1ec391] mx-auto mb-4" />,
      title: "Nhiều lựa chọn sân",
      desc: "Hàng trăm sân bóng, cầu lông, tennis… tại mọi quận huyện.",
    },
    {
      icon: <FaShieldAlt size={32} className="text-[#1ec391] mx-auto mb-4" />,
      title: "An toàn thông tin",
      desc: "Chúng tôi cam kết bảo mật thông tin người dùng và thanh toán.",
    },
    {
      icon: (
        <FaSearchLocation size={32} className="text-[#1ec391] mx-auto mb-4" />
      ),
      title: "Tìm sân gần bạn",
      desc: "Dựa trên vị trí hiện tại, hệ thống gợi ý sân phù hợp nhất.",
    },
    {
      icon: <FaSyncAlt size={32} className="text-[#1ec391] mx-auto mb-4" />,
      title: "Linh hoạt & tiện lợi",
      desc: "Cho phép thay đổi lịch, hủy sân dễ dàng – không ràng buộc.",
    },
  ];

  return (
    <section className="py-20 px-6 bg-white animate-fadeInUp">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">
          Tại sao nên chọn chúng tôi?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((item, index) => (
            <FeatureItem
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.desc}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
