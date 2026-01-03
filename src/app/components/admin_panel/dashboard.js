import { StatCard } from "../ui/Card";

function DashboardCard({ title, value, icon }) {
  return (
    <StatCard
      title={title}
      value={value}
      icon={icon}
    />
  );
}

export default DashboardCard;
