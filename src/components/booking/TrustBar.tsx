import { Users, Award, Star, MessageCircle } from 'lucide-react';

const stats = [
  { icon: Users, value: '450+', label: 'nöjda kunder' },
  { icon: Award, value: '15+', label: 'års erfarenhet' },
  { icon: Star, value: '4.9/5', label: 'betyg' },
  { icon: MessageCircle, value: '24h', label: 'svarstid' },
];

export function TrustBar() {
  return (
    <div className="bg-white border-y border-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-center gap-3">
              <stat.icon className="h-6 w-6 text-blue-600 shrink-0" />
              <div>
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
