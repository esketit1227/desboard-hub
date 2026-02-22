import { Settings2, Bell } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  onCustomize: () => void;
}

const stats = [
  { label: "Active Projects", value: "12", trend: "+3" },
  { label: "Revenue", value: "$24.5k", trend: "+12%" },
  { label: "Pending Tasks", value: "8", trend: "-2" },
  { label: "Storage Used", value: "64%", trend: "+5%" },
];

const DashboardHeader = ({ onCustomize }: DashboardHeaderProps) => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight lowercase">desboard</h1>
          <p className="text-muted-foreground text-sm mt-1">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="glass rounded-xl p-2.5 hover:scale-105 transition-transform">
            <Bell className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={onCustomize}
            className="glass rounded-xl p-2.5 hover:scale-105 transition-transform"
          >
            <Settings2 className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
            JD
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="glass rounded-2xl p-4"
          >
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-semibold tracking-tight">{stat.value}</span>
              <span className="text-xs text-success font-medium">{stat.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
