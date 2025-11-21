export default function StatCard({ title, value, icon: Icon, color, bgColor }) {
  return (
    <div className={`${bgColor} rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-4xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`${color} bg-white p-4 rounded-xl shadow-md`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}