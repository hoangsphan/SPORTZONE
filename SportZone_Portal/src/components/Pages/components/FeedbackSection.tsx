import FeedbackCard from "./FeedbackCard";

const FeedbackSection = () => {
  const feedbacks = [
    {
      name: "Nam, Quận 7",
      comment:
        "Dễ sử dụng và rất nhanh gọn, tôi đặt sân bóng mỗi tuần qua đây!",
      rating: 5,
    },
    {
      name: "Linh, Bình Thạnh",
      comment:
        "Tôi rất thích tính năng lọc sân theo giờ. Không còn phải gọi hỏi từng sân nữa!",
      rating: 4,
    },
  ];

  return (
    <section className="py-20 px-6 bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">Phản hồi từ người dùng</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {feedbacks.map((fb, index) => (
            <FeedbackCard
              key={index}
              name={fb.name}
              comment={fb.comment}
              rating={fb.rating}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;
